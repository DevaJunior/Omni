import React from 'react';
import { 
  Package, 
  CalendarDays, 
  FileText, 
  Clock,
  Calendar
} from 'lucide-react';
import './styles.css';

interface BancadaTabProps {
  labId: string;
}

const BancadaTab: React.FC<BancadaTabProps> = ({ labId: _labId }) => {
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
          <button className="text-link-green">Ver todos</button>
        </div>
        
        <div className="reservations-list">
          {/* Reservation 1 */}
          <div className="reservation-item">
            <div className="res-left">
              <div className="res-icon">
                <Clock size={20} />
              </div>
              <div className="res-info">
                <h5>Microscópio Confocal</h5>
                <span>Reservado por Dra. Helena Ribeiro</span>
              </div>
            </div>
            <div className="res-right">
              <span className="res-badge badge-agendado">Agendado</span>
              <span className="res-time"><Calendar size={14} /> Hoje, 14:00 - 16:00</span>
            </div>
          </div>

          <div className="res-divider"></div>

          {/* Reservation 2 */}
          <div className="reservation-item">
            <div className="res-left">
              <div className="res-icon">
                <Clock size={20} />
              </div>
              <div className="res-info">
                <h5>Centrífuga Refrigerada</h5>
                <span>Reservado por Carlos Eduardo</span>
              </div>
            </div>
            <div className="res-right">
              <span className="res-badge badge-em-uso">Em uso</span>
              <span className="res-time"><Calendar size={14} /> Hoje, 16:30 - 17:30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BancadaTab;
