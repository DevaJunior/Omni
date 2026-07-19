import React from 'react';
import './styles.css';

interface FragLabConfigProps {
  labId: string;
}

const FragLabConfig: React.FC<FragLabConfigProps> = ({ labId }) => {
  return (
    <div className="fraglab-config-container anim-fade-up" data-lab-id={labId}>
      <div className="lab-team-header">
        <div>
          <h3>Configurações do Laboratório</h3>
          <p>Ajuste as preferências e informações do laboratório.</p>
        </div>
      </div>
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Página de configurações em construção.
      </div>
    </div>
  );
};

export default FragLabConfig;
