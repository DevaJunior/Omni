import React, { useMemo, useState } from 'react';
import { Calendar, Clock, LogIn, CheckCheck, XCircle, User, Inbox } from 'lucide-react';
import { useToastStore } from '../../../src/stores/toastStore';
import { useConfirmStore } from '../../../src/stores/confirmStore';
import {
  cancelReservation,
  checkInReservation,
  finishReservation,
  getErrorMessage,
} from '../../../src/services/equipmentService';
import { useNow } from '../../../src/hooks/useLabEquipment';
import type { EquipmentReservation, ReservationPeriod } from '../../../src/types/equipment';
import {
  canCheckIn,
  formatDateLabel,
  getReservationPeriod,
  sortChronologically,
  statusSlug,
} from '../../../src/utils/equipmentScheduling';
import './styles.css';

interface EquipmentReservationsProps {
  reservations: EquipmentReservation[];
  currentUserId?: string;
  canManage: boolean;
  loading?: boolean;
}

const TABS: { key: ReservationPeriod; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'proximos', label: 'Próximos' },
  { key: 'historico', label: 'Histórico' },
];

const HISTORY_PAGE = 15;

const STATUS_CLASS: Record<EquipmentReservation['status'], string> = {
  Agendado: 'eqr-badge-agendado',
  'Em uso': 'eqr-badge-em-uso',
  Concluído: 'eqr-badge-concluido',
  Cancelado: 'eqr-badge-cancelado',
};

const EquipmentReservations: React.FC<EquipmentReservationsProps> = ({
  reservations,
  currentUserId,
  canManage,
  loading = false,
}) => {
  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();
  const now = useNow();

  const [activeTab, setActiveTab] = useState<ReservationPeriod>('hoje');
  const [onlyMine, setOnlyMine] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE);

  const grouped = useMemo(() => {
    const base = onlyMine ? reservations.filter(r => r.userId === currentUserId) : reservations;
    const groups: Record<ReservationPeriod, EquipmentReservation[]> = { hoje: [], proximos: [], historico: [] };
    base.forEach(r => groups[getReservationPeriod(r, now)].push(r));
    groups.hoje = sortChronologically(groups.hoje);
    groups.proximos = sortChronologically(groups.proximos);
    groups.historico = sortChronologically(groups.historico, 'desc');
    return groups;
  }, [reservations, onlyMine, currentUserId, now]);

  const list = activeTab === 'historico' ? grouped.historico.slice(0, historyLimit) : grouped[activeTab];

  const runAction = async (id: string, action: () => Promise<unknown>, successMsg: string, errorMsg: string) => {
    setBusyId(id);
    try {
      await action();
      addToast(successMsg, 'success');
    } catch (err) {
      console.error(errorMsg, err);
      addToast(getErrorMessage(err, errorMsg), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = (r: EquipmentReservation) => {
    const isOwner = r.userId === currentUserId;
    requestConfirm({
      title: 'Cancelar reserva',
      message: `Cancelar a reserva de "${r.equipmentName}" em ${formatDateLabel(r.date, now)}, ${r.startTime}–${r.endTime}${
        isOwner ? '' : ` (de ${r.userName})`
      }? O horário será liberado para a equipe.`,
      confirmText: 'Cancelar reserva',
      cancelText: 'Voltar',
      isDanger: true,
      onConfirm: () =>
        runAction(
          r.id,
          () => cancelReservation(r.id, currentUserId || 'desconhecido'),
          'Reserva cancelada. Horário liberado.',
          'Não foi possível cancelar a reserva.'
        ),
    });
  };

  const handleCheckIn = (r: EquipmentReservation) =>
    runAction(r.id, () => checkInReservation(r), 'Check-in realizado. Bom experimento!', 'Não foi possível fazer o check-in.');

  const handleFinish = (r: EquipmentReservation) =>
    runAction(r.id, () => finishReservation(r.id), 'Uso finalizado. Equipamento liberado.', 'Não foi possível finalizar o uso.');

  const emptyMessage: Record<ReservationPeriod, string> = {
    hoje: 'Nenhuma reserva para hoje.',
    proximos: 'Nenhuma reserva futura.',
    historico: 'Nenhum registro no histórico.',
  };

  return (
    <div className="eqr-container">
      <div className="eqr-toolbar">
        <div className="eqr-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.key}
              id={`eqr-tab-${tab.key}`}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`eqr-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="eqr-tab-count">{grouped[tab.key].length}</span>
            </button>
          ))}
        </div>
        <label className="eqr-toggle" htmlFor="eqr-only-mine">
          <input id="eqr-only-mine" type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} />
          <span className="eqr-toggle-track" aria-hidden="true" />
          Somente minhas
        </label>
      </div>

      <div className="eqr-list">
        {loading ? (
          <div className="eqr-empty">Carregando reservas...</div>
        ) : list.length === 0 ? (
          <div className="eqr-empty">
            <Inbox size={28} />
            {emptyMessage[activeTab]}
          </div>
        ) : (
          list.map(r => {
            const isOwner = r.userId === currentUserId;
            const canControl = isOwner || canManage;
            const busy = busyId === r.id;
            return (
              <div key={r.id} className={`eqr-item status-${statusSlug(r.status)}`}>
                <div className="eqr-left">
                  <div className="eqr-icon">
                    <Clock size={18} />
                  </div>
                  <div className="eqr-info">
                    <h5>{r.equipmentName}</h5>
                    <span className="eqr-user">
                      <User size={12} /> {isOwner ? 'Você' : r.userName}
                    </span>
                  </div>
                </div>

                <div className="eqr-right">
                  <div className="eqr-meta">
                    <span className={`eqr-badge ${STATUS_CLASS[r.status]}`}>{r.status}</span>
                    <span className="eqr-time">
                      <Calendar size={13} /> {formatDateLabel(r.date, now)}, {r.startTime}–{r.endTime}
                    </span>
                  </div>

                  {canControl && (r.status === 'Agendado' || r.status === 'Em uso') && activeTab !== 'historico' && (
                    <div className="eqr-actions">
                      {isOwner && canCheckIn(r, now) && (
                        <button
                          className="eqr-btn eqr-btn-primary"
                          onClick={() => handleCheckIn(r)}
                          disabled={busy}
                          id={`eqr-checkin-${r.id}`}
                        >
                          <LogIn size={14} /> Check-in
                        </button>
                      )}
                      {r.status === 'Em uso' && (
                        <button
                          className="eqr-btn eqr-btn-success"
                          onClick={() => handleFinish(r)}
                          disabled={busy}
                          id={`eqr-finish-${r.id}`}
                        >
                          <CheckCheck size={14} /> Finalizar
                        </button>
                      )}
                      {r.status === 'Agendado' && (
                        <button
                          className="eqr-btn eqr-btn-danger"
                          onClick={() => handleCancel(r)}
                          disabled={busy}
                          id={`eqr-cancel-${r.id}`}
                          title="Cancelar reserva"
                        >
                          <XCircle size={14} /> Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {activeTab === 'historico' && grouped.historico.length > historyLimit && (
          <button className="eqr-more" onClick={() => setHistoryLimit(l => l + HISTORY_PAGE)} id="eqr-history-more">
            Mostrar mais ({grouped.historico.length - historyLimit} restantes)
          </button>
        )}
      </div>
    </div>
  );
};

export default EquipmentReservations;
