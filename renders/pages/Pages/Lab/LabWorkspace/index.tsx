import { useToastStore } from '../../../../../src/stores/toastStore';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  FlaskConical, 
  MessageSquare, 
  Book, 
  Users,
  Settings
} from 'lucide-react';
import LabTeamTab from '../../../../fragments/Lab/LabTeamTab';
import BancadaTab from '../../../../fragments/Lab/BancadaTab';
import AreaComumTab from '../../../../fragments/Lab/AreaComumTab';
import CadernoTab from '../../../../fragments/Lab/CadernoTab';
import './styles.css';

const LabWorkspace: React.FC = () => {
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'bancada' | 'forum' | 'caderno' | 'gestao'>('bancada');

  return (
    <div className="lab-workspace-page">
      <div className="lab-workspace-header">
        <button className="tool-btn-back" onClick={() => navigate(`/lab/${id || '1'}`)}>
          <ArrowLeft size={18} />
          Voltar para o Perfil do Lab
        </button>
        <div className="workspace-title">
          <h2>Workspace do Laboratório</h2>
          <span className="workspace-badge">Acesso Restrito</span>
        </div>
      </div>

      <div className="lab-workspace-container">
        {/* Menu Lateral do Workspace */}
        <aside className="workspace-sidebar">
          <button 
            className={`workspace-nav-btn ${activeTab === 'bancada' ? 'active' : ''}`}
            onClick={() => setActiveTab('bancada')}
          >
            <FlaskConical size={18} />
            Bancada & LIMS
          </button>
          
          <button 
            className={`workspace-nav-btn ${activeTab === 'forum' ? 'active' : ''}`}
            onClick={() => setActiveTab('forum')}
          >
            <MessageSquare size={18} />
            Área Comum
          </button>
          
          <button 
            className={`workspace-nav-btn ${activeTab === 'caderno' ? 'active' : ''}`}
            onClick={() => setActiveTab('caderno')}
          >
            <Book size={18} />
            Meu Caderno
          </button>
          
          <div className="workspace-divider" />
          
          <button 
            className={`workspace-nav-btn ${activeTab === 'gestao' ? 'active' : ''}`}
            onClick={() => setActiveTab('gestao')}
          >
            <Users size={18} />
            Gestão da Equipe
          </button>
          
          <button 
            className="workspace-nav-btn"
            onClick={() => addToast('Configurações do Lab em breve!', 'info')}
          >
            <Settings size={18} />
            Configurações
          </button>
        </aside>

        {/* Área de Conteúdo Principal */}
        <main className="workspace-main-content">
          {activeTab === 'bancada' && (
            <BancadaTab labId={id || '1'} />
          )}

          {activeTab === 'forum' && (
            <AreaComumTab labId={id || '1'} />
          )}

          {activeTab === 'caderno' && (
            <CadernoTab labId={id || '1'} />
          )}

          {activeTab === 'gestao' && (
            <div className="workspace-content-card">
              <LabTeamTab mode="manage" labId={id || '1'} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LabWorkspace;
