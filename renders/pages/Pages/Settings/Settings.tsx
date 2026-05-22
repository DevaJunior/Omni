import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Camera,
  Mail
} from 'lucide-react';

import { useAuth } from '../../../../src/contexts/AuthContext';
import './Settings.css';

type SettingsSection = 'profile' | 'security' | 'notifications' | 'privacy' | 'appearance';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Perfil Público</h2>
            <p className="section-description">Gerencie como as outras pessoas veem você na plataforma.</p>

            <div className="profile-photo-section">
              <div className="avatar-wrapper">
                <div className="avatar-image">
                  {userProfile?.personal.name?.[0] || 'D'}
                </div>

                <div className="edit-avatar-btn">
                  <Camera size={16} />
                </div>
              </div>
              <div className="photo-info">
                <h3>Sua Foto</h3>
                <p>Recomendado: 400x400px. Formatos: JPG, PNG ou GIF.</p>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Nome de Exibição</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Seu nome"
                  defaultValue={userProfile?.personal.name || ''}
                />

              </div>
              <div className="form-group">
                <label>Headline Acadêmica</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Pesquisador em Biotecnologia"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Conte um pouco sobre sua trajetória..."
              ></textarea>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Localização</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: São Paulo, Brasil"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Website / Link</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://seusite.com"
                />
              </div>
            </div>

            <button className="save-button">Salvar Alterações</button>
          </div>
        );

      case 'security':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Conta e Segurança</h2>
            <p className="section-description">Configure suas credenciais e proteja seu acesso.</p>

            <div className="settings-card">
              <div className="form-group">
                <label>Endereço de E-mail</label>
                <div className="input-with-badge">
                  <div className="form-control-icon" style={{ paddingLeft: '12px' }}>
                    <Mail size={18} color="#94a3b8" />
                  </div>
                  <input
                    type="email"
                    className="form-control"
                    disabled
                    value={currentUser?.email || ''}
                  />

                  <span className="verified-badge">Verificado</span>
                </div>
                <p className="section-description" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                  O e-mail não pode ser alterado pois está vinculado ao Google Auth.
                </p>
              </div>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4>Autenticação em Duas Etapas</h4>
                <p>Adicione uma camada extra de segurança à sua conta.</p>
              </div>
              <button className="btn-secondary">Configurar</button>
            </div>

            <div className="security-item danger-zone">
              <div className="security-info">
                <h4 style={{ color: '#ef4444' }}>Desativar Conta</h4>
                <p>Isso tornará seu perfil privado e ocultará sua atividade.</p>
              </div>
              <button className="btn-danger">Desativar</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="section-fade-in">
            <h2 className="section-title">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
            <p className="section-description">Esta seção está em desenvolvimento.</p>
          </div>
        );
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Voltar
        </div>
        <h1>Configurações</h1>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <button
            className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <span className="sidebar-icon"><User size={20} /></span>
            Perfil Público
            {activeSection === 'profile' && <ChevronRight size={16} className="chevron-indicator" style={{ marginLeft: 'auto' }} />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <span className="sidebar-icon"><Lock size={20} /></span>
            Conta e Segurança
            {activeSection === 'security' && <ChevronRight size={16} className="chevron-indicator" style={{ marginLeft: 'auto' }} />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <span className="sidebar-icon"><Bell size={20} /></span>
            Notificações
          </button>

          <button
            className={`sidebar-item ${activeSection === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveSection('privacy')}
          >
            <span className="sidebar-icon"><Shield size={20} /></span>
            Privacidade
          </button>

          <button
            className={`sidebar-item ${activeSection === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSection('appearance')}
          >
            <span className="sidebar-icon"><Palette size={20} /></span>
            Aparência
          </button>

          <div className="sidebar-divider"></div>

          <button className="sidebar-item logout-button" onClick={handleLogout}>
            <span className="sidebar-icon"><LogOut size={20} /></span>
            Sair da Conta
          </button>
        </aside>

        <main className="settings-content">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Settings;
