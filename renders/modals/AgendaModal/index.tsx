import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Plus, Clock, Users, Beaker, LayoutList } from 'lucide-react';
import './styles.css';

interface AgendaEvent {
  id: string;
  type: 'reminder' | 'experiment' | 'meeting';
  title: string;
  description?: string;
  date: string;
  time?: string;
  isCompleted?: boolean;
}

const mockEvents: AgendaEvent[] = [
  { id: '1', type: 'reminder', title: 'Atualizar planilhas de estoque', date: '2023-10-24', isCompleted: false },
  { id: '2', type: 'experiment', title: 'Extração de DNA - Amostras 1 a 10', description: 'Bancada 03. Responsável: João.', date: '2023-10-24', time: '14:00' },
  { id: '3', type: 'meeting', title: 'Reunião do Lab', description: 'Discussão sobre novos insumos.', date: '2023-10-24', time: '16:30' },
];

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<AgendaEvent[]>(mockEvents);
  const [filter, setFilter] = useState<'all' | 'experiments' | 'reminders'>('all');
  const [selectedDate, setSelectedDate] = useState(24);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  if (!isOpen) return null;

  const toggleReminder = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
  };

  const eventsForSelectedDate = events.filter(e => {
    const eventDay = parseInt(e.date.split('-')[2], 10);
    return eventDay === selectedDate;
  });

  const countAll = eventsForSelectedDate.length;
  const countExperiments = eventsForSelectedDate.filter(e => e.type === 'experiment').length;
  const countReminders = eventsForSelectedDate.filter(e => e.type === 'reminder').length;

  const filteredEvents = eventsForSelectedDate.filter(e => {
    if (filter === 'experiments') return e.type === 'experiment';
    if (filter === 'reminders') return e.type === 'reminder';
    return true;
  });

  return (
    <div className="agenda-modal-overlay" onClick={onClose}>
      <div className="agenda-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Left Pane (Sidebar) */}
        <div className="agenda-sidebar">
          <div className="agenda-sidebar-header">
            <h2>Agenda</h2>
            <button className="agenda-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="agenda-calendar-wrapper">
            <div className="mock-calendar-header">OUTUBRO 2023</div>
            <div className="mock-calendar">
              <div className="mock-calendar-day">D</div><div className="mock-calendar-day">S</div><div className="mock-calendar-day">T</div><div className="mock-calendar-day">Q</div><div className="mock-calendar-day">Q</div><div className="mock-calendar-day">S</div><div className="mock-calendar-day">S</div>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const isSelected = selectedDate === day;
                const hasEvent = events.some(e => parseInt(e.date.split('-')[2], 10) === day);
                return (
                  <div 
                    key={day} 
                    className={`mock-calendar-day ${isSelected ? 'active' : ''} ${hasEvent ? 'has-event' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </div>
                );
              })}
              <div></div><div></div><div></div><div></div>
            </div>
          </div>

          <div className="agenda-filters">
            <button className={`agenda-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              <div className="filter-btn-left"><CalendarIcon size={16} /> Todos</div>
              {countAll > 0 && <span className="filter-badge">{countAll}</span>}
            </button>
            <button className={`agenda-filter-btn ${filter === 'reminders' ? 'active' : ''}`} onClick={() => setFilter('reminders')}>
              <div className="filter-btn-left"><LayoutList size={16} /> Lembretes</div>
              {countReminders > 0 && <span className="filter-badge">{countReminders}</span>}
            </button>
            <button className={`agenda-filter-btn ${filter === 'experiments' ? 'active' : ''}`} onClick={() => setFilter('experiments')}>
              <div className="filter-btn-left"><Beaker size={16} /> Experimentos</div>
              {countExperiments > 0 && <span className="filter-badge">{countExperiments}</span>}
            </button>
          </div>
        </div>

        {/* Right Pane (Main) */}
        <div className="agenda-main">
          <div className="agenda-main-header">
            <div className="agenda-main-date">
              <h3>{selectedDate === 24 ? 'Hoje, ' : ''}{selectedDate} de Outubro</h3>
              <p>Você tem {filteredEvents.length} compromisso{filteredEvents.length !== 1 && 's'} agendado{filteredEvents.length !== 1 && 's'}.</p>
            </div>
            <button className="btn-add-event" onClick={() => setIsAddEventOpen(true)}>
              <Plus size={18} /> Novo Evento
            </button>
          </div>

          <div className="agenda-timeline">
            {filteredEvents.map(event => (
              <div key={event.id} className={`timeline-item type-${event.type}`}>
                <div className="timeline-time">
                  {event.time || 'All Day'}
                </div>
                <div className="timeline-content">
                  <div className="timeline-badge">
                    {event.type === 'experiment' ? 'Experimento' : event.type === 'meeting' ? 'Reunião' : 'Lembrete'}
                  </div>
                  
                  {event.type === 'reminder' ? (
                    <label className="reminder-check">
                      <input 
                        type="checkbox" 
                        checked={event.isCompleted || false} 
                        onChange={() => toggleReminder(event.id)} 
                      />
                      <span>{event.title}</span>
                    </label>
                  ) : (
                    <>
                      <h4>{event.title}</h4>
                      {event.description && <p>{event.description}</p>}
                      <div className="timeline-footer">
                        <Clock size={14} /> {event.time}
                        {event.type === 'experiment' && <><Beaker size={14} style={{marginLeft: 8}}/> Bancada</>}
                        {event.type === 'meeting' && <><Users size={14} style={{marginLeft: 8}}/> Equipe</>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD EVENT MODAL OVERLAY */}
        {isAddEventOpen && (
          <div className="agenda-edit-modal-overlay" onClick={() => setIsAddEventOpen(false)}>
            <div className="agenda-edit-modal-container" onClick={e => e.stopPropagation()}>
              <div className="agenda-edit-header">
                <h2>Novo Evento</h2>
                <button className="agenda-close-btn" onClick={() => setIsAddEventOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="agenda-edit-body">
                <div className="form-group">
                  <label>Título <span className="text-blue">*</span></label>
                  <input type="text" placeholder="Ex: Reunião de Pauta" />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <input type="text" placeholder="Detalhes adicionais do evento" />
                </div>
                <div className="form-row">
                  <div className="form-group select-wrapper">
                    <label>Tipo</label>
                    <select>
                      <option value="experiment">Experimento</option>
                      <option value="meeting">Reunião</option>
                      <option value="reminder">Lembrete</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Horário</label>
                    <input type="time" defaultValue="14:00" />
                  </div>
                </div>
              </div>
              <div className="agenda-edit-footer">
                <button className="btn-cancel" onClick={() => setIsAddEventOpen(false)}>Cancelar</button>
                <button className="btn-save" onClick={() => setIsAddEventOpen(false)}>Salvar Evento</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AgendaModal;
