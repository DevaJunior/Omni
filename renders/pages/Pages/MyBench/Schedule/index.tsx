import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronRight } from 'lucide-react';
import type { EquipmentReservation } from '../../../../../src/types/equipment';
import { getDateParts, getReservationPeriod, toDateKey } from '../../../../../src/utils/equipmentScheduling';
import { useNow } from '../../../../../src/hooks/useLabEquipment';
import './styles.css';

export interface ScheduleItem {
  id: string;
  month: string;
  day: string;
  color: 'blue' | 'gray';
  title: string;
  time: string;
}

export interface ReminderItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ScheduleProps {
  reservations?: EquipmentReservation[];
  scheduleItems?: ScheduleItem[];
  reminders?: ReminderItem[];
  loading?: boolean;
  onToggleReminder?: (id: string, checked: boolean) => void;
  onOpenAgenda?: () => void;
  onOpenReservationModal?: () => void;
  onOpenFullSchedule?: () => void;
}

const defaultReminders: ReminderItem[] = [
  { id: 'rem1', text: 'Calibrar pHmetro (bancada 2)', checked: false },
  { id: 'rem2', text: 'Revisar protocolo extração', checked: false }
];

const Schedule: React.FC<ScheduleProps> = ({
  reservations,
  scheduleItems,
  reminders = defaultReminders,
  loading = false,
  onToggleReminder,
  onOpenAgenda,
  onOpenReservationModal,
  onOpenFullSchedule,
}) => {
  const [localReminders, setLocalReminders] = useState(reminders);
  const now = useNow();
  const today = toDateKey(now);

  const handleToggle = (id: string, currentChecked: boolean) => {
    if (onToggleReminder) {
      onToggleReminder(id, !currentChecked);
    } else {
      setLocalReminders(prev =>
        prev.map(r => (r.id === id ? { ...r, checked: !r.checked } : r))
      );
    }
  };

  const activeReminders = onToggleReminder ? reminders : localReminders;

  // Se `reservations` foi fornecido (dados reais do Firestore), calcula a lista cronológica real.
  // Caso contrário, usa `scheduleItems` como fallback.
  let displayItems: ScheduleItem[] = [];

  if (reservations) {
    const upcoming = reservations
      .filter(r => r.status !== 'Cancelado' && getReservationPeriod(r, now) !== 'historico')
      .slice(0, 4);

    displayItems = upcoming.map(r => {
      const parts = getDateParts(r.date);
      const isToday = r.date === today;
      return {
        id: r.id,
        month: isToday ? 'HOJE' : parts.month,
        day: parts.day,
        color: isToday ? 'blue' : 'gray',
        title: r.equipmentName,
        time: `${r.startTime} - ${r.endTime} · ${r.userName?.split(' ')[0] || ''}`,
      };
    });
  } else if (scheduleItems) {
    displayItems = scheduleItems;
  }

  return (
    <div className="mybench-card mybench-schedule-card">
      <div className="schedule-header">
        <div className="schedule-header-title" onClick={onOpenFullSchedule || onOpenAgenda} style={{ cursor: 'pointer' }}>
          <h4>A sua Agenda</h4>
          <CalendarIcon size={18} className="schedule-icon" />
        </div>
        {onOpenReservationModal && (
          <button
            type="button"
            className="schedule-btn-add"
            onClick={onOpenReservationModal}
            id="schedule-quick-add"
            title="Reservar equipamento"
          >
            <Plus size={14} /> Agendar
          </button>
        )}
      </div>

      <div className="schedule-list">
        {loading ? (
          <div className="schedule-empty">Carregando agendamentos...</div>
        ) : displayItems.length > 0 ? (
          displayItems.map(item => (
            <div key={item.id} className="schedule-item">
              <div className={`schedule-date date-${item.color}`}>
                <span className="date-month">{item.month}</span>
                <span className="date-day">{item.day}</span>
              </div>
              <div className="schedule-info">
                <h5>{item.title}</h5>
                <span>{item.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="schedule-empty">
            <p>Nenhum equipamento agendado.</p>
            {onOpenReservationModal && (
              <button
                type="button"
                className="schedule-empty-btn"
                onClick={onOpenReservationModal}
              >
                <Plus size={14} /> Agendar primeiro equipamento
              </button>
            )}
          </div>
        )}
      </div>

      {onOpenFullSchedule && (
        <button
          type="button"
          className="schedule-view-all-btn"
          onClick={onOpenFullSchedule}
        >
          Ver grade completa de equipamentos <ChevronRight size={14} />
        </button>
      )}

      <div className="schedule-divider"></div>

      <div className="reminders-section">
        <span className="reminders-title">LEMBRETES</span>
        {activeReminders.map(rem => (
          <div key={rem.id} className="reminder-item">
            <input
              type="checkbox"
              id={rem.id}
              checked={rem.checked}
              onChange={() => handleToggle(rem.id, rem.checked)}
            />
            <label htmlFor={rem.id}>{rem.text}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
