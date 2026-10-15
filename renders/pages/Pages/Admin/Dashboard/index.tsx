import React, { useEffect, useState } from 'react';
import { Users, Building, FlaskConical, AlertTriangle, TrendingUp } from 'lucide-react';
import './styles.css';
import { adminService, type AdminMetrics } from '../../../../../src/services/adminService';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="admin-loading">Carregando métricas...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>Overview do Sistema</h1>
        <p>Visão geral da plataforma Omni e métricas de engajamento e governança.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon users-icon"><Users size={24} /></div>
          <div className="metric-data">
            <h3>Total de Usuários</h3>
            <span className="metric-value">{metrics?.totalUsers || 0}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon labs-icon"><FlaskConical size={24} /></div>
          <div className="metric-data">
            <h3>Laboratórios Ativos</h3>
            <span className="metric-value">{metrics?.totalLabs || 0}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon inst-icon"><Building size={24} /></div>
          <div className="metric-data">
            <h3>Instituições</h3>
            <span className="metric-value">{metrics?.totalInstitutions || 0}</span>
          </div>
        </div>

        <div className="metric-card warning-card">
          <div className="metric-icon alert-icon"><AlertTriangle size={24} /></div>
          <div className="metric-data">
            <h3>Denúncias Pendentes</h3>
            <span className="metric-value">{metrics?.unresolvedReports || 0}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-area">
        <div className="dashboard-panel">
          <h3><TrendingUp size={20} /> Acesso Rápido a Moderação</h3>
          <p>
            O fluxo de governança foi inicializado. Em breve você verá gráficos detalhados
            do crescimento da rede acadêmica aqui. Utilize o menu lateral para iniciar as tarefas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
