import React, { useEffect, useState } from 'react';
import { FlaskConical, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminService } from '../../../../../src/services/adminService';
import type { LabProfile } from '../../../../../src/types/lab';
import { useToastStore } from '../../../../../src/stores/toastStore';
import { useConfirmStore } from '../../../../../src/stores/confirmStore';
import OmniLoader from '../../../../components/OmniLoader';
import './styles.css';

const AdminLabs: React.FC = () => {
  const [labs, setLabs] = useState<LabProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLabs();
      setLabs(data);
    } catch (err) {
      addToast("Erro ao buscar laboratórios.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    const actionText = status === 'approved' ? 'aprovar' : 'rejeitar';
    requestConfirm({
      title: `${status === 'approved' ? 'Aprovar' : 'Rejeitar'} Laboratório`,
      message: `Tem certeza que deseja ${actionText} este laboratório?`,
      confirmText: `Sim, ${actionText}`,
      onConfirm: async () => {
        try {
          await adminService.updateLabStatus(id, status);
          addToast(`Laboratório ${actionText === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso.`, "success");
          fetchLabs();
        } catch (err) {
          addToast("Erro ao atualizar o status.", "error");
        }
      }
    });
  };

  const pendingLabs = labs.filter(l => l.status === 'pending');
  const activeLabs = labs.filter(l => l.status === 'approved' || l.status === undefined || l.status === null);

  const displayedLabs = (activeTab === 'pending' ? pendingLabs : activeLabs).filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.institution.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-labs-container">
      <div className="admin-page-header">
        <div>
          <h1>Governança de Laboratórios</h1>
          <p>Aprove novos laboratórios para garantir a integridade da plataforma.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="tabs-container">
          <button 
            className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Fila de Aprovação ({pendingLabs.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Laboratórios Ativos ({activeLabs.length})
          </button>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou instituição..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="labs-grid">
        {loading ? (
          <OmniLoader
            variant="section"
            size="sm"
            message="Carregando laboratórios..."
            submessage="Sincronizando entidades cadastradas..."
            icon="flask"
            showLine={false}
          />
        ) : displayedLabs.length === 0 ? (
          <div className="admin-empty-text">Nenhum laboratório encontrado nesta aba.</div>
        ) : (
          displayedLabs.map(lab => (
            <div key={lab.id} className="lab-governance-card">
              <div className="lab-card-header">
                <div className="lab-identity">
                  {lab.logoImage || lab.image ? (
                    <img src={lab.logoImage || lab.image} alt={lab.name} className="lab-avatar" />
                  ) : (
                    <div className="lab-avatar-fallback"><FlaskConical size={20} /></div>
                  )}
                  <div>
                    <h3>{lab.name}</h3>
                    <span className="lab-institution">{lab.institution}</span>
                  </div>
                </div>
                {lab.status === 'pending' ? (
                  <span className="status-badge pending"><Clock size={12} /> Em Análise</span>
                ) : (
                  <span className="status-badge approved"><CheckCircle size={12} /> Ativo</span>
                )}
              </div>
              
              <div className="lab-card-body">
                <p><strong>Descrição:</strong> {lab.description || 'Nenhuma descrição fornecida.'}</p>
                <div className="lab-meta-info">
                  <span><strong>Local:</strong> {lab.location || 'Não informado'}</span>
                  <span><strong>Site:</strong> {lab.website || 'N/A'}</span>
                  <span><strong>E-mail:</strong> {lab.email || 'N/A'}</span>
                </div>
              </div>

              <div className="lab-card-footer">
                {activeTab === 'pending' ? (
                  <div className="action-buttons-group">
                    <button className="btn-outline danger" onClick={() => handleUpdateStatus(lab.id, 'rejected')}>
                      <XCircle size={16} /> Rejeitar
                    </button>
                    <button className="btn-primary" onClick={() => handleUpdateStatus(lab.id, 'approved')}>
                      <CheckCircle size={16} /> Aprovar Laboratório
                    </button>
                  </div>
                ) : (
                  <button className="btn-outline" onClick={() => window.open(`/lab/${lab.id}`, '_blank')}>
                    Ver Perfil Público
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLabs;
