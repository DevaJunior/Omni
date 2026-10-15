import React, { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { learnService } from '../../../../../src/services/learnService';
import { useToastStore } from '../../../../../src/stores/toastStore';
import { useConfirmStore } from '../../../../../src/stores/confirmStore';
import './styles.css';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await learnService.getAllReports();
      setReports(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      addToast("Erro ao carregar denúncias.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = (id: string) => {
    requestConfirm({
      title: 'Resolver Denúncia',
      message: 'Tem certeza que deseja marcar esta denúncia como resolvida? Isso indica que o conteúdo já foi avaliado e, se necessário, removido.',
      confirmText: 'Sim, resolver',
      onConfirm: async () => {
        try {
          await learnService.updateReportStatus(id, 'resolved');
          addToast("Denúncia resolvida com sucesso.", "success");
          fetchReports();
        } catch (err) {
          addToast("Erro ao atualizar denúncia.", "error");
        }
      }
    });
  };

  const handleViewNote = (noteId: string) => {
    navigate(`/learn/${noteId}`);
  };

  const filteredReports = reports.filter(r => r.status === activeTab && r.reason.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-reports-container">
      <div className="admin-page-header">
        <div>
          <h1>Central de Moderação</h1>
          <p>Avalie as denúncias de conteúdo submetidas pela comunidade.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="tabs-container">
          <button 
            className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pendentes ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'resolved' ? 'active' : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolvidas ({reports.filter(r => r.status === 'resolved').length})
          </button>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por motivo..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="reports-grid">
        {loading ? (
          <div className="admin-loading-text">Carregando denúncias...</div>
        ) : filteredReports.length === 0 ? (
          <div className="admin-empty-text">
            {activeTab === 'pending' ? "Nenhuma denúncia pendente. A comunidade está em paz!" : "Nenhuma denúncia resolvida encontrada."}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-card-header">
                <span className={`status-badge ${report.status}`}>
                  {report.status === 'pending' ? <><Clock size={14} /> Pendente</> : <><CheckCircle size={14} /> Resolvido</>}
                </span>
                <span className="report-date">{new Date(report.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="report-card-body">
                <h4>Motivo da Denúncia:</h4>
                <p className="report-reason">"{report.reason}"</p>
                <div className="report-meta-info">
                  <span><strong>ID do Post:</strong> <code>{report.noteId}</code></span>
                  <span><strong>ID do Denunciante:</strong> <code>{report.reporterId}</code></span>
                </div>
              </div>

              <div className="report-card-footer">
                <button className="btn-outline" onClick={() => handleViewNote(report.noteId)}>
                  <ExternalLink size={16} style={{marginRight: '6px'}} /> Ver Conteúdo
                </button>
                {report.status === 'pending' && (
                  <button className="btn-primary" onClick={() => handleResolve(report.id)}>
                    <CheckCircle size={16} style={{marginRight: '6px'}} /> Marcar como Resolvida
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

export default AdminReports;
