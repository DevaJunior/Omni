import type {
  BookingSlot,
  Equipment,
  EquipmentReservation,
  ReservationPeriod,
  ReservationStatus,
} from '../types/equipment';

/** Status que ocupam capacidade do equipamento. */
export const BLOCKING_STATUSES: ReservationStatus[] = ['Agendado', 'Em uso'];

/** Janela (em minutos) antes do início em que o check-in é liberado. */
export const CHECK_IN_WINDOW_MIN = 15;

const pad = (n: number) => String(n).padStart(2, '0');

/** Data LOCAL no formato YYYY-MM-DD (evita o deslocamento de fuso do toISOString). */
export const toDateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Horário LOCAL no formato HH:MM. */
export const toTimeKey = (d: Date = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const minutesToTime = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

export const addDays = (dateKey: string, days: number) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return toDateKey(new Date(y, m - 1, d + days));
};

export const isOverlapping = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart < bEnd && aEnd > bStart;

export const isBlocking = (r: Pick<EquipmentReservation, 'status'>) => BLOCKING_STATUSES.includes(r.status);

export const getCapacity = (eq: Pick<Equipment, 'allowConcurrent' | 'capacity'>) =>
  eq.allowConcurrent ? Math.max(2, Number(eq.capacity) || 2) : 1;

/** Converte um status em slug para uso em classes CSS ("Em uso" → "em-uso", "Concluído" → "concluido"). */
export const statusSlug = (status: string) =>
  status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

/**
 * Calcula o pico de uso simultâneo dentro do intervalo [start, end) considerando as reservas existentes.
 * Diferente de "contar reservas sobrepostas", isso permite, por exemplo, que um equipamento de
 * capacidade 2 aceite 08–11 quando já existem 08–09 e 10–11 (que não se sobrepõem entre si).
 */
export const getPeakConcurrency = (slots: Pick<BookingSlot, 'startTime' | 'endTime'>[], start: string, end: string) => {
  const events: { t: number; delta: number }[] = [];
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);

  slots.forEach(slot => {
    if (!isOverlapping(start, end, slot.startTime, slot.endTime)) return;
    events.push({ t: Math.max(s, timeToMinutes(slot.startTime)), delta: 1 });
    events.push({ t: Math.min(e, timeToMinutes(slot.endTime)), delta: -1 });
  });

  // Saídas antes de entradas no mesmo instante (intervalos semiabertos).
  events.sort((a, b) => a.t - b.t || a.delta - b.delta);

  let current = 0;
  let peak = 0;
  events.forEach(ev => {
    current += ev.delta;
    peak = Math.max(peak, current);
  });
  return peak;
};

export interface AvailabilityResult {
  ok: boolean;
  peak: number;
  capacity: number;
}

export const checkAvailability = (
  slots: Pick<BookingSlot, 'startTime' | 'endTime'>[],
  start: string,
  end: string,
  capacity: number
): AvailabilityResult => {
  const peak = getPeakConcurrency(slots, start, end);
  return { ok: peak < capacity, peak, capacity };
};

export interface ScheduleValidationInput {
  date: string;
  startTime: string;
  endTime: string;
  now?: Date;
}

/** Valida regras temporais básicas. Retorna mensagem de erro ou null. */
export const validateScheduleWindow = ({ date, startTime, endTime, now = new Date() }: ScheduleValidationInput) => {
  if (!date || !startTime || !endTime) return 'Preencha data, horário de início e de fim.';
  if (startTime >= endTime) return 'O horário de início deve ser menor que o horário de fim.';

  const today = toDateKey(now);
  if (date < today) return 'Não é possível agendar em datas passadas.';
  if (date === today && startTime < toTimeKey(now)) return 'O horário de início já passou.';
  return null;
};

export const getReservationPeriod = (r: EquipmentReservation, now: Date = new Date()): ReservationPeriod => {
  const today = toDateKey(now);
  if (r.status === 'Cancelado' || r.status === 'Concluído') return 'historico';
  if (r.date < today) return 'historico';
  if (r.date === today) {
    // Reserva "Agendado" cujo horário já terminou vai para o histórico; "Em uso" permanece em Hoje.
    if (r.status === 'Agendado' && r.endTime <= toTimeKey(now)) return 'historico';
    return 'hoje';
  }
  return 'proximos';
};

export const sortChronologically = (list: EquipmentReservation[], direction: 'asc' | 'desc' = 'asc') => {
  const factor = direction === 'asc' ? 1 : -1;
  return [...list].sort(
    (a, b) =>
      factor * (a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime))
  );
};

export const canCheckIn = (r: EquipmentReservation, now: Date = new Date()) => {
  if (r.status !== 'Agendado' || r.date !== toDateKey(now)) return false;
  const nowMin = timeToMinutes(toTimeKey(now));
  return nowMin >= timeToMinutes(r.startTime) - CHECK_IN_WINDOW_MIN && nowMin < timeToMinutes(r.endTime);
};

export const formatDateLabel = (dateKey: string, now: Date = new Date()) => {
  const today = toDateKey(now);
  if (dateKey === today) return 'Hoje';
  if (dateKey === addDays(today, 1)) return 'Amanhã';
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
};

export const getDateParts = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return {
    day: pad(d),
    month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
  };
};
