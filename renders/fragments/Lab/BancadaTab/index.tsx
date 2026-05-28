import React from 'react';
import { 
  Package, 
  CalendarDays, 
  FileText, 
  Clock,
  Calendar,
  Plus
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import EquipmentReservationModal from '../../../modals/EquipmentReservationModal/index';
import './styles.css';

interface BancadaTabProps {
  labId: string;
}

const BancadaTab: React.FC<BancadaTabProps> = ({ labId }) => {
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchReservations = async () => {
    if (!labId) return;
    try {
      const q = query(
        collection(db, 'equipment_reservations'),
        where('labId', '==', labId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos", error);
    }
  };

  React.useEffect(() => {
    fetchReservations();
  }, [labId]);

  return (
    <div className="bancada-tab-container anim-fade-up">
      <div className="bancada-header-simple">
        <h3>Bancada & LIMS</h3>
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

        <div className="quick-action-card">
          <div className="quick-action-icon icon-blue">
            <CalendarDays size={24} />
          </div>
          <div className="quick-action-info">
            <h4>Agendamentos</h4>
            <span>Ver quadro de horários</span>
          </div>
        </div>

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

      <div className="bancada-reservations-section">
        <div className="reservations-header">
          <h4>Equipamentos: Próximas Reservas</h4>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="text-link-green" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #10b981', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>
              <Plus size={16} /> Agendar
            </button>
          </div>
        </div>
        
        <div className="reservations-list">
          {reservations.length > 0 ? reservations.map((res: any, index: number) => (
            <React.Fragment key={res.id}>
              <div className="reservation-item">
                <div className="res-left">
                  <div className="res-icon">
                    <Clock size={20} />
                  </div>
                  <div className="res-info">
                    <h5>{res.equipmentName}</h5>
                    <span>Reservado por {res.userName}</span>
                  </div>
                </div>
                <div className="res-right">
                  <span className={`res-badge ${res.status === 'Agendado' ? 'badge-agendado' : 'badge-em-uso'}`}>{res.status}</span>
                  <span className="res-time"><Calendar size={14} /> {res.date}, {res.startTime} - {res.endTime}</span>
                </div>
              </div>
              {index < reservations.length - 1 && <div className="res-divider"></div>}
            </React.Fragment>
          )) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Nenhum agendamento encontrado para este laboratório.</div>
          )}
        </div>
      </div>

      <EquipmentReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labId={labId}
        onSuccess={fetchReservations}
      />
    </div>
  );
};

export default BancadaTab;
