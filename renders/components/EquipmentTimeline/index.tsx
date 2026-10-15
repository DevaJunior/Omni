import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { useNow } from '../../../src/hooks/useLabEquipment';
import type { Equipment, EquipmentReservation } from '../../../src/types/equipment';
import {
  addDays,
  formatDateLabel,
  getCapacity,
  minutesToTime,
  statusSlug,
  timeToMinutes,
  toDateKey,
  toTimeKey,
} from '../../../src/utils/equipmentScheduling';
import './styles.css';

interface EquipmentTimelineProps {
  equipments: Equipment[];
  reservations: EquipmentReservation[];
  date: string;
  onDateChange: (date: string) => void;
  onSlotClick?: (equipmentId: string, date: string, startTime: string) => void;
  currentUserId?: string;
}

const DEFAULT_START_H = 7;
const DEFAULT_END_H = 21;
const SLOT_MIN = 30;
const LANE_H = 26;

interface PositionedBlock {
  reservation: EquipmentReservation;
  lane: number;
}

/** Distribui reservas sobrepostas em "faixas" para equipamentos de uso simultâneo. */
const assignLanes = (items: EquipmentReservation[]) => {
  const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const laneEnds: string[] = [];
  const blocks: PositionedBlock[] = sorted.map(r => {
    let lane = laneEnds.findIndex(end => end <= r.startTime);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(r.endTime);
    } else {
      laneEnds[lane] = r.endTime;
    }
    return { reservation: r, lane };
  });
  return { blocks, lanes: Math.max(1, laneEnds.length) };
};

const EquipmentTimeline: React.FC<EquipmentTimelineProps> = ({
  equipments,
  reservations,
  date,
  onDateChange,
  onSlotClick,
  currentUserId,
}) => {
  const now = useNow();
  const today = toDateKey(now);
  const isPastDay = date < today;
  const isToday = date === today;

  const dayReservations = useMemo(
    () => reservations.filter(r => r.date === date && r.status !== 'Cancelado'),
    [reservations, date]
  );

  // Expande a janela visível caso existam reservas fora do horário padrão.
  const { startMin, endMin } = useMemo(() => {
    let s = DEFAULT_START_H * 60;
    let e = DEFAULT_END_H * 60;
    dayReservations.forEach(r => {
      s = Math.min(s, Math.floor(timeToMinutes(r.startTime) / 60) * 60);
      e = Math.max(e, Math.ceil(timeToMinutes(r.endTime) / 60) * 60);
    });
    return { startMin: s, endMin: Math.min(e, 24 * 60) };
  }, [dayReservations]);

  const range = endMin - startMin;
  const hours = useMemo(() => {
    const list: number[] = [];
    for (let m = startMin; m < endMin; m += 60) list.push(m);
    return list;
  }, [startMin, endMin]);

  const pct = (min: number) => ((min - startMin) / range) * 100;
  const nowMin = timeToMinutes(toTimeKey(now));
  const showNowLine = isToday && nowMin >= startMin && nowMin <= endMin;

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>, equipment: Equipment) => {
    if (!onSlotClick || isPastDay || equipment.status !== 'Ativo') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    let minute = startMin + Math.floor((ratio * range) / SLOT_MIN) * SLOT_MIN;
    if (isToday && minute < nowMin) {
      // Arredonda para o próximo slot futuro.
      minute = Math.ceil(nowMin / SLOT_MIN) * SLOT_MIN;
      if (minute >= endMin) return;
    }
    onSlotClick(equipment.id, date, minutesToTime(minute));
  };

  return (
    <div className="eqt-container">
      <div className="eqt-toolbar">
        <div className="eqt-nav">
          <button className="eqt-nav-btn" onClick={() => onDateChange(addDays(date, -1))} aria-label="Dia anterior" id="eqt-prev-day">
            <ChevronLeft size={16} />
          </button>
          <button
            className={`eqt-today-btn ${isToday ? 'active' : ''}`}
            onClick={() => onDateChange(today)}
            id="eqt-today"
          >
            Hoje
          </button>
          <button className="eqt-nav-btn" onClick={() => onDateChange(addDays(date, 1))} aria-label="Próximo dia" id="eqt-next-day">
            <ChevronRight size={16} />
          </button>
          <span className="eqt-date-label">{formatDateLabel(date, now)}</span>
        </div>
        <input
          type="date"
          className="eqt-date-input"
          value={date}
          onChange={e => e.target.value && onDateChange(e.target.value)}
          aria-label="Escolher data"
          id="eqt-date-input"
        />
      </div>

      {equipments.length === 0 ? (
        <div className="eqt-empty">Nenhum equipamento cadastrado para exibir na grade.</div>
      ) : (
        <div className="eqt-scroll">
          <div className="eqt-grid">
            <div className="eqt-header-row">
              <div className="eqt-label-col" />
              <div className="eqt-hours">
                {hours.map(h => (
                  <span key={h} className="eqt-hour" style={{ left: `${pct(h)}%` }}>
                    {minutesToTime(h)}
                  </span>
                ))}
              </div>
            </div>

            {equipments.map(eq => {
              const eqReservations = dayReservations.filter(r => r.equipmentId === eq.id);
              const { blocks, lanes } = assignLanes(eqReservations);
              const inactive = eq.status !== 'Ativo';
              const clickable = !!onSlotClick && !inactive && !isPastDay;
              return (
                <div key={eq.id} className={`eqt-row ${inactive ? 'inactive' : ''}`}>
                  <div className="eqt-label-col">
                    <strong title={eq.name}>{eq.name}</strong>
                    <span>
                      {inactive ? (
                        <>
                          <Wrench size={11} /> {eq.status}
                        </>
                      ) : eq.allowConcurrent ? (
                        `Até ${getCapacity(eq)} simultâneos`
                      ) : (
                        'Exclusivo'
                      )}
                    </span>
                  </div>
                  <div
                    className={`eqt-track ${clickable ? 'clickable' : ''}`}
                    style={{ height: lanes * LANE_H + 12 }}
                    onClick={e => handleTrackClick(e, eq)}
                    title={clickable ? 'Clique em um horário livre para reservar' : undefined}
                  >
                    {hours.map(h => (
                      <span key={h} className="eqt-gridline" style={{ left: `${pct(h)}%` }} />
                    ))}
                    {isToday && nowMin > startMin && (
                      <span className="eqt-past-shade" style={{ width: `${Math.min(pct(nowMin), 100)}%` }} />
                    )}
                    {blocks.map(({ reservation: r, lane }) => {
                      const left = pct(timeToMinutes(r.startTime));
                      const width = pct(timeToMinutes(r.endTime)) - left;
                      const mine = r.userId === currentUserId;
                      return (
                        <div
                          key={r.id}
                          className={`eqt-block status-${statusSlug(r.status)} ${mine ? 'mine' : ''}`}
                          style={{ left: `${left}%`, width: `${width}%`, top: 6 + lane * LANE_H, height: LANE_H - 4 }}
                          title={`${r.startTime}–${r.endTime} · ${mine ? 'Você' : r.userName} · ${r.status}`}
                          onClick={e => e.stopPropagation()}
                        >
                          <span>{mine ? 'Você' : r.userName?.split(' ')[0]}</span>
                          <em>
                            {r.startTime}–{r.endTime}
                          </em>
                        </div>
                      );
                    })}
                    {showNowLine && <span className="eqt-now-line" style={{ left: `${pct(nowMin)}%` }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="eqt-legend">
        <span><i className="lg-agendado" /> Agendado</span>
        <span><i className="lg-em-uso" /> Em uso</span>
        <span><i className="lg-mine" /> Minhas reservas</span>
        <span><i className="lg-concluido" /> Concluído</span>
      </div>
    </div>
  );
};

export default EquipmentTimeline;
