// Tipos do módulo de Equipamentos & Agendamentos do laboratório.

export type EquipmentStatus = 'Ativo' | 'Em Manutenção' | 'Desativado';

export type ReservationStatus = 'Agendado' | 'Em uso' | 'Concluído' | 'Cancelado';

export type ReservationPeriod = 'hoje' | 'proximos' | 'historico';

export interface Equipment {
  id: string;
  labId: string;
  name: string;
  description?: string;
  allowConcurrent: boolean;
  capacity: number;
  status: EquipmentStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EquipmentInput {
  name: string;
  description?: string;
  allowConcurrent: boolean;
  capacity: number;
  status?: EquipmentStatus;
}

export interface EquipmentReservation {
  id: string;
  labId: string;
  userId: string;
  userName: string;
  equipmentId: string;
  equipmentName: string;
  /** Data local no formato YYYY-MM-DD */
  date: string;
  /** Horário no formato HH:MM */
  startTime: string;
  /** Horário no formato HH:MM */
  endTime: string;
  status: ReservationStatus;
  createdAt?: unknown;
  checkedInAt?: unknown;
  finishedAt?: unknown;
  cancelledAt?: unknown;
  cancelledBy?: string;
}

/** Registro mínimo de uma reserva usado no documento de trava diária (equipment_day_locks). */
export interface BookingSlot {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
}
