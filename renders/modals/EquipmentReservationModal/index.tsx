import { useToastStore } from '../../../src/stores/toastStore';
import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, Wrench } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { createReservation, getErrorMessage } from '../../../src/services/equipmentService';
import type { Equipment, EquipmentReservation } from '../../../src/types/equipment';
import {
  checkAvailability,
  getCapacity,
  isBlocking,
  minutesToTime,
  timeToMinutes,
  toDateKey,
  validateScheduleWindow,
} from '../../../src/utils/equipmentScheduling';
import './styles.css';

interface EquipmentReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  equipments: Equipment[];
  reservations: EquipmentReservation[];
  /** Pré-seleção (ex.: clique em um horário livre na timeline). */
  initialEquipmentId?: string;
  initialDate?: string;
  initialStartTime?: string;
  onSuccess?: () => void;
}

const DEFAULT_DURATION_MIN = 60;

const addMinutes = (time: string, minutes: number) =>
  minutesToTime(Math.min(timeToMinutes(time) + minutes, 23 * 60 + 59));

const EquipmentReservationModal: React.FC<EquipmentReservationModalProps> = ({
  isOpen,
  onClose,
  labId,
  equipments,
  reservations,
  initialEquipmentId,
  initialDate,
  initialStartTime,
  onSuccess,
}) => {
  const { addToast } = useToastStore();
  const { userProfile } = useAuth();

  const [equipmentId, setEquipmentId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeEquipments = useMemo(() => equipments.filter(eq => eq.status === 'Ativo'), [equipments]);
  const today = toDateKey();

  // Reinicia o formulário sempre que o modal abre (respeitando pré-seleções).
  useEffect(() => {
    if (!isOpen) return;
    const preselected = activeEquipments.find(eq => eq.id === initialEquipmentId);
    setEquipmentId(preselected?.id || activeEquipments[0]?.id || '');
    setDate(initialDate && initialDate >= today ? initialDate : today);
    setStartTime(initialStartTime || '');
    setEndTime(initialStartTime ? addMinutes(initialStartTime, DEFAULT_DURATION_MIN) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialEquipmentId, initialDate, initialStartTime]);

  // Caso a lista de equipamentos chegue depois da abertura do modal.
  useEffect(() => {
    if (isOpen && !equipmentId && activeEquipments.length > 0) setEquipmentId(activeEquipments[0].id);
  }, [isOpen, equipmentId, activeEquipments]);

  // Fecha com ESC.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !isSubmitting && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, onClose]);

  const selectedEquipment = equipments.find(eq => eq.id === equipmentId);
  const capacity = selectedEquipment ? getCapacity(selectedEquipment) : 1;

  const occupied = useMemo(
    () =>
      reservations.filter(r => r.equipmentId === equipmentId && r.date === date && isBlocking(r)),
    [reservations, equipmentId, date]
  );

  const windowError = startTime && endTime ? validateScheduleWindow({ date, startTime, endTime }) : null;
  const availability =
    startTime && endTime && !windowError ? checkAvailability(occupied, startTime, endTime, capacity) : null;

  if (!isOpen) return null;

  const handleStartChange = (value: string) => {
    setStartTime(value);
    if (value && (!endTime || endTime <= value)) setEndTime(addMinutes(value, DEFAULT_DURATION_MIN));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      addToast('Você precisa estar logado para agendar um equipamento.', 'info');
      return;
    }
    if (!selectedEquipment) {
      addToast('Selecione um equipamento válido.', 'warning');
      return;
    }
    const error = validateScheduleWindow({ date, startTime, endTime });
    if (error) {
      addToast(error, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReservation({
        labId,
        userId: userProfile.id,
        userName: userProfile.name,
        equipmentId: selectedEquipment.id,
        date,
        startTime,
        endTime,
      });
      addToast('Agendamento realizado com sucesso!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao agendar equipamento:', err);
      addToast(getErrorMessage(err, 'Ocorreu um erro ao agendar o equipamento.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unavailableEquipments = equipments.filter(eq => eq.status !== 'Ativo');

  return (
    <div className="res-modal-overlay" onClick={() => !isSubmitting && onClose()}>
      <div
        className="res-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="res-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <button className="res-modal-close" onClick={onClose} aria-label="Fechar" id="res-modal-close-btn">
          <X size={20} />
        </button>

        <div className="res-modal-header">
          <h2 id="res-modal-title">Agendar Equipamento</h2>
          <p>Reserve um horário para utilizar os equipamentos do laboratório.</p>
        </div>

        <form className="res-modal-form" onSubmit={handleSubmit}>
          <div className="res-modal-form-group">
            <label htmlFor="res-equipment">Equipamento</label>
            {activeEquipments.length > 0 ? (
              <select
                id="res-equipment"
                value={equipmentId}
                onChange={e => setEquipmentId(e.target.value)}
                required
              >
                {activeEquipments.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} {eq.allowConcurrent ? `(Simultâneo · até ${getCapacity(eq)})` : '(Exclusivo)'}
                  </option>
                ))}
                {unavailableEquipments.map(eq => (
                  <option key={eq.id} value={eq.id} disabled>
                    {eq.name} — {eq.status}
                  </option>
                ))}
              </select>
            ) : (
              <div className="res-modal-empty">
                <Wrench size={16} />
                {equipments.length > 0
                  ? 'Nenhum equipamento ativo no momento (todos em manutenção ou desativados).'
                  : 'Nenhum equipamento cadastrado. Peça ao responsável para cadastrar em "Equipamentos".'}
              </div>
            )}
          </div>

          <div className="res-modal-form-group">
            <label htmlFor="res-date">Data</label>
            <input
              id="res-date"
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="res-modal-form-row">
            <div className="res-modal-form-group">
              <label htmlFor="res-start">Horário Início</label>
              <input
                id="res-start"
                type="time"
                value={startTime}
                onChange={e => handleStartChange(e.target.value)}
                required
              />
            </div>
            <div className="res-modal-form-group">
              <label htmlFor="res-end">Horário Fim</label>
              <input
                id="res-end"
                type="time"
                value={endTime}
                min={startTime || undefined}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {selectedEquipment && date && (
            <div className="res-occupied">
              <span className="res-occupied-title">
                <Clock size={14} /> Ocupação neste dia
                {capacity > 1 && <em> · capacidade {capacity} simultâneos</em>}
              </span>
              {occupied.length > 0 ? (
                <ul className="res-occupied-list">
                  {occupied.map(r => (
                    <li key={r.id} className="res-occupied-chip" title={`Reservado por ${r.userName}`}>
                      {r.startTime}–{r.endTime}
                      <span>{r.userName?.split(' ')[0]}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="res-occupied-free">Dia totalmente livre para este equipamento.</span>
              )}
            </div>
          )}

          {windowError && (
            <div className="res-feedback res-feedback-error">
              <AlertTriangle size={16} /> {windowError}
            </div>
          )}
          {availability && (
            <div className={`res-feedback ${availability.ok ? 'res-feedback-ok' : 'res-feedback-error'}`}>
              {availability.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {availability.ok
                ? capacity > 1
                  ? `Horário disponível (${capacity - availability.peak} vaga(s) restante(s) no pico).`
                  : 'Horário disponível.'
                : capacity > 1
                  ? `Capacidade de ${capacity} pessoas atingida neste intervalo.`
                  : 'Conflito: já existe reserva neste intervalo.'}
            </div>
          )}

          <div className="res-modal-footer">
            <button type="button" className="res-btn-cancel" onClick={onClose} disabled={isSubmitting} id="res-cancel-btn">
              Cancelar
            </button>
            <button
              type="submit"
              className="res-btn-confirm"
              id="res-confirm-btn"
              disabled={isSubmitting || activeEquipments.length === 0 || !!windowError || availability?.ok === false}
            >
              {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentReservationModal;
