import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  addDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type {
  BookingSlot,
  Equipment,
  EquipmentInput,
  EquipmentReservation,
} from '../types/equipment';
import {
  canCheckIn,
  checkAvailability,
  getCapacity,
  isBlocking,
  isOverlapping,
  sortChronologically,
  toDateKey,
  toTimeKey,
  validateScheduleWindow,
} from '../utils/equipmentScheduling';

export const EQUIPMENT_COLLECTIONS = {
  EQUIPMENTS: 'equipments',
  RESERVATIONS: 'equipment_reservations',
  /** Um documento por equipamento/dia que serializa as reservas via transação (evita overbooking). */
  DAY_LOCKS: 'equipment_day_locks',
} as const;

/** Erro de regra de negócio com mensagem pronta para exibir ao usuário. */
export class EquipmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EquipmentError';
  }
}

export const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof EquipmentError ? error.message : fallback;

const lockIdFor = (equipmentId: string, date: string) => `${equipmentId}_${date}`;

// ---------------------------------------------------------------------------
// Assinaturas em tempo real
// ---------------------------------------------------------------------------

export const subscribeLabEquipments = (
  labId: string,
  onData: (items: Equipment[]) => void,
  onError?: (e: Error) => void
): Unsubscribe => {
  // Sem orderBy para não exigir índice composto; a ordenação é feita no cliente.
  const q = query(collection(db, EQUIPMENT_COLLECTIONS.EQUIPMENTS), where('labId', '==', labId));
  return onSnapshot(
    q,
    snap => {
      const items = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          status: data.status || 'Ativo',
          capacity: data.allowConcurrent ? Number(data.capacity) || 2 : 1,
        } as Equipment;
      });
      items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      onData(items);
    },
    onError
  );
};

export const subscribeLabReservations = (
  labId: string,
  onData: (items: EquipmentReservation[]) => void,
  onError?: (e: Error) => void
): Unsubscribe => {
  const q = query(collection(db, EQUIPMENT_COLLECTIONS.RESERVATIONS), where('labId', '==', labId));
  return onSnapshot(
    q,
    snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as EquipmentReservation);
      onData(sortChronologically(items));
    },
    onError
  );
};

// ---------------------------------------------------------------------------
// Equipamentos
// ---------------------------------------------------------------------------

const normalizeEquipmentInput = (input: EquipmentInput) => ({
  name: input.name.trim(),
  description: (input.description || '').trim(),
  allowConcurrent: input.allowConcurrent,
  capacity: input.allowConcurrent ? Math.max(2, Number(input.capacity) || 2) : 1,
});

export const createEquipment = async (labId: string, input: EquipmentInput) => {
  if (!input.name.trim()) throw new EquipmentError('Informe o nome do equipamento.');
  const ref = await addDoc(collection(db, EQUIPMENT_COLLECTIONS.EQUIPMENTS), {
    labId,
    ...normalizeEquipmentInput(input),
    status: input.status || 'Ativo',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateEquipment = async (equipmentId: string, input: EquipmentInput) => {
  if (!input.name.trim()) throw new EquipmentError('Informe o nome do equipamento.');
  await updateDoc(doc(db, EQUIPMENT_COLLECTIONS.EQUIPMENTS, equipmentId), {
    ...normalizeEquipmentInput(input),
    ...(input.status ? { status: input.status } : {}),
    updatedAt: serverTimestamp(),
  });
};

export const setEquipmentStatus = async (equipmentId: string, status: Equipment['status']) => {
  await updateDoc(doc(db, EQUIPMENT_COLLECTIONS.EQUIPMENTS, equipmentId), {
    status,
    updatedAt: serverTimestamp(),
  });
};

/** Reservas ativas (Agendado/Em uso) de hoje em diante para um equipamento. */
export const getUpcomingActiveReservations = async (equipmentId: string) => {
  const snap = await getDocs(
    query(collection(db, EQUIPMENT_COLLECTIONS.RESERVATIONS), where('equipmentId', '==', equipmentId))
  );
  const today = toDateKey();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as EquipmentReservation)
    .filter(r => isBlocking(r) && r.date >= today);
};

export const deleteEquipment = async (equipmentId: string) => {
  const upcoming = await getUpcomingActiveReservations(equipmentId);
  if (upcoming.length > 0) {
    throw new EquipmentError(
      `Este equipamento possui ${upcoming.length} reserva(s) futura(s) ativa(s). Cancele-as ou coloque o equipamento em manutenção.`
    );
  }
  await deleteDoc(doc(db, EQUIPMENT_COLLECTIONS.EQUIPMENTS, equipmentId));
};

// ---------------------------------------------------------------------------
// Reservas
// ---------------------------------------------------------------------------

export interface CreateReservationParams {
  labId: string;
  userId: string;
  userName: string;
  equipmentId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const createReservation = async (params: CreateReservationParams) => {
  const { labId, userId, userName, equipmentId, date, startTime, endTime } = params;

  const windowError = validateScheduleWindow({ date, startTime, endTime });
  if (windowError) throw new EquipmentError(windowError);

  // Reservas criadas antes da existência das travas diárias (compatibilidade com dados antigos).
  const legacySnap = await getDocs(
    query(collection(db, EQUIPMENT_COLLECTIONS.RESERVATIONS), where('equipmentId', '==', equipmentId))
  );
  const legacy: BookingSlot[] = legacySnap.docs
    .map(d => ({ id: d.id, ...d.data() }) as EquipmentReservation)
    .filter(r => r.date === date && isBlocking(r))
    .map(r => ({ id: r.id, userId: r.userId, startTime: r.startTime, endTime: r.endTime }));

  const equipmentRef = doc(db, EQUIPMENT_COLLECTIONS.EQUIPMENTS, equipmentId);
  const lockRef = doc(db, EQUIPMENT_COLLECTIONS.DAY_LOCKS, lockIdFor(equipmentId, date));
  const reservationRef = doc(collection(db, EQUIPMENT_COLLECTIONS.RESERVATIONS));

  await runTransaction(db, async tx => {
    const equipmentSnap = await tx.get(equipmentRef);
    if (!equipmentSnap.exists()) throw new EquipmentError('Equipamento não encontrado.');
    const equipment = { id: equipmentSnap.id, ...equipmentSnap.data() } as Equipment;

    if ((equipment.status || 'Ativo') !== 'Ativo') {
      throw new EquipmentError(`"${equipment.name}" está ${equipment.status?.toLowerCase()} e não aceita reservas.`);
    }

    const lockSnap = await tx.get(lockRef);
    const lockBookings: BookingSlot[] = lockSnap.exists() ? (lockSnap.data().bookings as BookingSlot[]) || [] : [];
    const lockIds = new Set(lockBookings.map(b => b.id));
    const allBookings = [...lockBookings, ...legacy.filter(b => !lockIds.has(b.id))];

    if (allBookings.some(b => b.userId === userId && isOverlapping(startTime, endTime, b.startTime, b.endTime))) {
      throw new EquipmentError('Você já possui uma reserva deste equipamento que se sobrepõe a este horário.');
    }

    const capacity = getCapacity(equipment);
    const { ok } = checkAvailability(allBookings, startTime, endTime, capacity);
    if (!ok) {
      throw new EquipmentError(
        capacity > 1
          ? `A capacidade simultânea (${capacity} pessoas) já foi atingida em parte deste intervalo.`
          : 'Este equipamento é de uso exclusivo e já possui reserva neste intervalo.'
      );
    }

    const slot: BookingSlot = { id: reservationRef.id, userId, startTime, endTime };
    tx.set(lockRef, {
      labId,
      equipmentId,
      date,
      bookings: [...lockBookings, slot],
      updatedAt: serverTimestamp(),
    });
    tx.set(reservationRef, {
      labId,
      userId,
      userName,
      equipmentId,
      equipmentName: equipment.name,
      date,
      startTime,
      endTime,
      status: 'Agendado',
      createdAt: serverTimestamp(),
    });
  });

  return reservationRef.id;
};

/** Encerra uma reserva (cancelamento ou conclusão) e libera o horário na trava diária. */
const closeReservation = async (
  reservationId: string,
  patch: Record<string, unknown>
) => {
  const reservationRef = doc(db, EQUIPMENT_COLLECTIONS.RESERVATIONS, reservationId);

  await runTransaction(db, async tx => {
    const resSnap = await tx.get(reservationRef);
    if (!resSnap.exists()) throw new EquipmentError('Reserva não encontrada.');
    const current = { id: resSnap.id, ...resSnap.data() } as EquipmentReservation;
    if (!isBlocking(current)) throw new EquipmentError('Esta reserva já foi encerrada.');

    const lockRef = doc(db, EQUIPMENT_COLLECTIONS.DAY_LOCKS, lockIdFor(current.equipmentId, current.date));
    const lockSnap = await tx.get(lockRef);

    tx.update(reservationRef, patch);
    if (lockSnap.exists()) {
      const bookings = ((lockSnap.data().bookings as BookingSlot[]) || []).filter(b => b.id !== reservationId);
      tx.update(lockRef, { bookings, updatedAt: serverTimestamp() });
    }
  });
};

export const cancelReservation = (reservationId: string, cancelledBy: string) =>
  closeReservation(reservationId, {
    status: 'Cancelado',
    cancelledAt: serverTimestamp(),
    cancelledBy,
  });

export const finishReservation = (reservationId: string) =>
  closeReservation(reservationId, {
    status: 'Concluído',
    finishedAt: serverTimestamp(),
    actualEndTime: toTimeKey(),
  });

export const checkInReservation = async (reservation: EquipmentReservation) => {
  if (!canCheckIn(reservation)) {
    throw new EquipmentError('O check-in só é liberado no dia da reserva, a partir de 15 minutos antes do início.');
  }
  await updateDoc(doc(db, EQUIPMENT_COLLECTIONS.RESERVATIONS, reservation.id), {
    status: 'Em uso',
    checkedInAt: serverTimestamp(),
  });
};
