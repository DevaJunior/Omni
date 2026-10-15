import React, { useMemo, useRef, useState } from 'react';
import { Package, CalendarDays, FileText, Plus } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useCanManageLab, useLabEquipments, useLabReservations, useNow } from '../../../src/hooks/useLabEquipment';
import { getReservationPeriod, toDateKey } from '../../../src/utils/equipmentScheduling';
import EquipmentReservationModal from '../../modals/EquipmentReservationModal/index';
import EquipmentTimeline from '../EquipmentTimeline';
import EquipmentReservations from '../EquipmentReservations';
import './styles.css';

interface FragLabBancadaProps {
  labId: string;
}

interface ModalPreset {
  equipmentId?: string;
  date?: string;
  startTime?: string;
}

const FragLabBancada: React.FC<FragLabBancadaProps> = ({ labId }) => {
  const { userProfile } = useAuth();
  const { equipments } = useLabEquipments(labId);
  const { reservations, loading } = useLabReservations(labId);
  const canManage = useCanManageLab(labId);
  const now = useNow();

  const [timelineDate, setTimelineDate] = useState(() => toDateKey());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preset, setPreset] = useState<ModalPreset>({});
  const scheduleRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const today = reservations.filter(r => getReservationPeriod(r, now) === 'hoje').length;
    const mineUpcoming = reservations.filter(
      r => r.userId === userProfile?.id && getReservationPeriod(r, now) !== 'historico'
    ).length;
    return { today, mineUpcoming };
  }, [reservations, userProfile?.id, now]);

  const openModal = (next: ModalPreset = {}) => {
    setPreset(next);
    setIsModalOpen(true);
  };

  return (
    <div className="bancada-tab-container anim-fade-up">
      <div className="bancada-header-simple">
        <h3>Bancada &amp; LIMS</h3>
        <p>Gestão rápida de inventário, equipamentos e recursos do laboratório.</p>
      </div>

      <div className="bancada-quick-actions">
        <div className="quick-action-card">
          <div className="quick-action-icon icon-green">
            <Package size={24} />
          </div>
          <div className="quick-action-info">
            <h4>Inventário</h4>
            <span>12 alertas de baixo estoque</span>
          </div>
        </div>

        <button
          type="button"
          className="quick-action-card"
          id="bancada-quick-schedule"
          onClick={() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <div className="quick-action-icon icon-blue">
            <CalendarDays size={24} />
          </div>
          <div className="quick-action-info">
            <h4>Agendamentos</h4>
            <span>
              {stats.today} hoje · {stats.mineUpcoming} suas pendentes
            </span>
          </div>
        </button>

        <div className="quick-action-card">
          <div className="quick-action-icon icon-purple">
            <FileText size={24} />
          </div>
          <div className="quick-action-info">
            <h4>Protocolos (POP)</h4>
            <span>Acesso rápido aos guias</span>
          </div>
        </div>
      </div>

      <section className="bancada-reservations-section" ref={scheduleRef}>
        <div className="reservations-header">
          <div>
            <h4>Grade de Equipamentos</h4>
            <span className="reservations-subtitle">Clique em um horário livre para reservar.</span>
          </div>
          <button className="bancada-btn-schedule" onClick={() => openModal({ date: timelineDate })} id="bancada-new-reservation">
            <Plus size={16} /> Agendar
          </button>
        </div>

        <EquipmentTimeline
          equipments={equipments}
          reservations={reservations}
          date={timelineDate}
          onDateChange={setTimelineDate}
          currentUserId={userProfile?.id}
          onSlotClick={(equipmentId, date, startTime) => openModal({ equipmentId, date, startTime })}
        />
      </section>

      <section className="bancada-reservations-section">
        <div className="reservations-header">
          <h4>Reservas</h4>
        </div>
        <EquipmentReservations
          reservations={reservations}
          currentUserId={userProfile?.id}
          canManage={canManage}
          loading={loading}
        />
      </section>

      <EquipmentReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labId={labId}
        equipments={equipments}
        reservations={reservations}
        initialEquipmentId={preset.equipmentId}
        initialDate={preset.date}
        initialStartTime={preset.startTime}
      />
    </div>
  );
};

export default FragLabBancada;
