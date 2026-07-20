import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';
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
  scheduleItems?: ScheduleItem[];
  reminders?: ReminderItem[];
  onToggleReminder?: (id: string, checked: boolean) => void;
  onOpenAgenda?: () => void;
}

const defaultSchedule: ScheduleItem[] = [
  {
    id: '1',
    month: 'HOJE',
    day: '19',
    color: 'blue',
    title: 'Uso do Espectrofotômetro',
    time: '14:00 - 16:00'
  },
  {
    id: '2',
    month: 'SEG',
    day: '20',
    color: 'gray',
    title: 'Reunião LBA',
    time: '09:00 - 10:30'
  }
];

const defaultReminders: ReminderItem[] = [
  { id: 'rem1', text: 'Calibrar pHmetro (bancada 2)', checked: false },
  { id: 'rem2', text: 'Revisar protocolo extração', checked: false }
];

const Schedule: React.FC<ScheduleProps> = ({
  scheduleItems = defaultSchedule,
  reminders = defaultReminders,
  onToggleReminder,
  onOpenAgenda
}) => {
  // Local state just to show interactivity if uncontrolled from above
  const [localReminders, setLocalReminders] = useState(reminders);

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

  return (
    <div className="mybench-card mybench-schedule-card">
      <div className="schedule-header" style={{ cursor: 'pointer' }} onClick={onOpenAgenda}>
        <h4>A sua Agenda</h4>
        <CalendarIcon size={18} className="schedule-icon" />
      </div>

      <div className="schedule-list">
        {scheduleItems.map(item => (
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
        ))}
      </div>

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
