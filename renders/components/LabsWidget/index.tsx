import React from 'react';
import { Microscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LabPartner } from '../../../src/types/community';
import './styles.css';

interface LabsWidgetProps {
  labs: LabPartner[];
  className?: string;
}

const LabsWidget: React.FC<LabsWidgetProps> = ({ labs, className }) => {
  const navigate = useNavigate();

  return (
    <div className={`lw-sidebar-widget ${className || ''}`}>
      <div className="lw-widget-header">
        <Microscope size={20} className="lw-widget-icon" />
        <h2>Laboratórios</h2>
      </div>
      <div className="lw-suggested-labs">
        {labs.length > 0 ? (
          labs.map(lab => (
            <div
              key={lab.id}
              className="lw-lab-item"
              onClick={() => navigate(`/lab/${lab.id}`)}
            >
              <div className="lw-lab-avatar-placeholder">
                {lab.name ? lab.name.substring(0, 2).toUpperCase() : 'LB'}
              </div>
              <div className="lw-lab-details">
                <h5>{lab.name || 'Laboratório Sem Nome'}</h5>
              </div>
              <button
                className="lw-btn-view"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/lab/${lab.id}`);
                }}
              >
                Ver
              </button>
            </div>
          ))
        ) : (
          <span className="lw-empty-msg">Nenhum laboratório disponível.</span>
        )}
      </div>
    </div>
  );
};

export default LabsWidget;
