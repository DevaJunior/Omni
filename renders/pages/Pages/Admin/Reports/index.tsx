import React, { useEffect, useState } from 'react';
import { Shield, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { learnService } from '../../../../../src/services/learnService';
import { useToastStore } from '../../../../../src/stores/toastStore';
import { useConfirmStore } from '../../../../../src/stores/confirmStore';
import './styles.css';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
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
      message: 'Tem certeza que deseja marcar esta denúncia como resolvida? Isso indicará que a ação necessária já foi tomada.',
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

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Carregando denúncias...</div>;
  }

  return (
    <div className="admin-reports-wrapper">
      <div className="admin-reports-container">
        <header className="admin-header">
          <Shield size={32} className="admin-icon" />
          <div>
            <h1>Central de Moderação</h1>
            <p>Avalie as denúncias de publicações realizadas pelos usuários.</p>
          </div>
        </header>

        <div className="reports-list">
          {reports.length === 0 ? (
            <div className="empty-reports">Nenhuma denúncia encontrada. A comunidade está em paz!</div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className={`report-card ${report.status === 'resolved' ? 'resolved' : ''}`}>
                <div className="report-card-header">
                  <span className={`status-badge ${report.status}`}>
                    {report.status === 'pending' ? <><Clock size={14} /> Pendente</> : <><CheckCircle size={14} /> Resolvido</>}
                  </span>
                  <span className="report-date">{new Date(report.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="report-card-body">
                  <h4>Motivo da Denúncia:</h4>
                  <p className="report-reason">"{report.reason}"</p>
                  <p className="report-meta">Publicação ID: <code>{report.noteId}</code></p>
                  <p className="report-meta">Denunciante ID: <code>{report.reporterId}</code></p>
                </div>

                <div className="report-card-footer">
                  <button className="btn-view-note" onClick={() => handleViewNote(report.noteId)}>
                    <ExternalLink size={16} /> Visualizar Publicação
                  </button>
                  {report.status === 'pending' && (
                    <button className="btn-resolve" onClick={() => handleResolve(report.id)}>
                      <CheckCircle size={16} /> Marcar como Resolvida
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
