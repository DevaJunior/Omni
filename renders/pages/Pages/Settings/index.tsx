import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  LogOut,
  ChevronRight,
  Camera
} from 'lucide-react';

import { useAuth } from '../../../../src/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import './styles.css';

type SettingsSection = 'profile' | 'security' | 'notifications' | 'privacy' | 'appearance';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  // --- ESTADO DO FORMULÁRIO DE PERFIL ---
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    location: '',
    website: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // --- 2FA STATE ---
  // (Variáveis removidas temporariamente para bater com o layout estático)

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        headline: userProfile.headline || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: formData.name,
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
      });
      setSaveMessage('✅ Perfil atualizado com sucesso!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setSaveMessage('❌ Erro ao salvar. Tente novamente.');
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

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
                  {userProfile?.name?.[0] || 'D'}
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
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />

              </div>
              <div className="form-group">
                <label>Headline Acadêmica</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Pesquisador em Biotecnologia"
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Conte um pouco sobre sua trajetória..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
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
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Website / Link</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://seusite.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>

            {saveMessage && <p className="save-feedback">{saveMessage}</p>}
            <button 
              className="save-button" 
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        );

      case 'security':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Conta e Segurança</h2>
            <p className="section-description">Configure suas credenciais e proteja seu acesso.</p>

            <div className="settings-card-sub">
              <div className="form-group mb-0">
                <label className="settings-label">Endereço de E-mail</label>
                <div className="input-with-badge mt-12">
                  <input
                    type="email"
                    className="form-control form-control-disabled"
                    disabled
                    value={currentUser?.email || 'contatodevairjunior@gmail.com'}
                  />
                  <span className="verified-badge">Verificado</span>
                </div>
                <p className="section-description mt-12 mb-0">
                  O e-mail não pode ser alterado pois está vinculado ao Google Auth.
                </p>
              </div>
            </div>

            <div className="settings-card-sub flex-between">
              <div className="security-info">
                <h4>Autenticação em Duas Etapas</h4>
                <p>Adicione uma camada extra de segurança à sua conta.</p>
              </div>
              <button className="btn-secondary">Configurar</button>
            </div>

            <div className="settings-card-sub danger-zone flex-between">
              <div className="security-info">
                <h4 className="danger-text">Desativar Conta</h4>
                <p className="danger-text-muted">Isso tornará seu perfil privado e ocultará sua atividade.</p>
              </div>
              <button className="btn-danger">Desativar</button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Notificações</h2>
            <p className="section-description">Controle como e quando você recebe alertas da plataforma Omni.</p>
            
            <div className="settings-card-sub overflow-hidden no-padding">
              <div className="form-group-toggle">
                <div>
                  <h4>Notificações de E-mail</h4>
                  <p className="section-description mb-0">Receber um resumo de mensagens e convites por e-mail.</p>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-mark"></span>
                </label>
              </div>
              
              <hr className="settings-divider" />
              
              <div className="form-group-toggle">
                <div>
                  <h4>Push Notifications</h4>
                  <p className="section-description mb-0">Receber notificações no navegador para mensagens instantâneas.</p>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-mark"></span>
                </label>
              </div>

              <hr className="settings-divider" />
              
              <div className="form-group-toggle">
                <div>
                  <h4>Newsletter Semanal</h4>
                  <p className="section-description mb-0">Resumo de novas oportunidades e tópicos em alta da comunidade.</p>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" />
                  <span className="toggle-mark"></span>
                </label>
              </div>
            </div>
            
            <button className="save-button mt-24">Salvar Preferências</button>
          </div>
        );

      case 'privacy':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Privacidade</h2>
            <p className="section-description">Gerencie a visibilidade dos seus dados e atividades.</p>
            
            <div className="settings-card-sub overflow-hidden no-padding">
              <div className="form-group-toggle">
                <div>
                  <h4>Perfil Público</h4>
                  <p className="section-description mb-0">Permitir que usuários não logados encontrem seu perfil.</p>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-mark"></span>
                </label>
              </div>
              
              <hr className="settings-divider" />
              
              <div className="form-group-toggle">
                <div>
                  <h4>Mostrar E-mail</h4>
                  <p className="section-description mb-0">Exibir seu endereço de e-mail na página de perfil público.</p>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-mark"></span>
                </label>
              </div>

              <hr className="settings-divider" />
              
              <div className="form-group-toggle">
                <div>
                  <h4>Mostrar Inventário do Lab</h4>
                  <p className="section-description mb-0">Permitir que membros de outros laboratórios vejam seu inventário público.</p>
                </div>
                <label className="custom-toggle">
                  <input type="checkbox" />
                  <span className="toggle-mark"></span>
                </label>
              </div>
            </div>
            
            <button className="save-button mt-24">Atualizar Privacidade</button>
          </div>
        );

      case 'appearance':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Aparência</h2>
            <p className="section-description">Personalize a experiência visual da plataforma.</p>
            
            <div className="settings-card-sub">
              <div className="form-group mb-0">
                <label className="settings-label theme-label">Tema da Interface</label>
                
                <div className="radio-group">
                  <label className="custom-radio-container">
                    <input type="radio" name="theme" value="light" defaultChecked />
                    <span className="radio-mark"></span>
                    <span className="radio-label">Modo Claro</span>
                  </label>
                  
                  <label className="custom-radio-container">
                    <input type="radio" name="theme" value="dark" disabled />
                    <span className="radio-mark"></span>
                    <span className="radio-label disabled">Modo Escuro (Em breve)</span>
                  </label>
                  
                  <label className="custom-radio-container">
                    <input type="radio" name="theme" value="system" />
                    <span className="radio-mark"></span>
                    <span className="radio-label">Usar Padrão do Sistema</span>
                  </label>
                </div>
              </div>
            </div>
            
            <button className="save-button mt-24">Aplicar Tema</button>
          </div>
        );

      default:
        return (
          <div className="section-fade-in">
            <h2 className="section-title">{(activeSection as string).charAt(0).toUpperCase() + (activeSection as string).slice(1)}</h2>
            <p className="section-description">Esta seção está em desenvolvimento.</p>
          </div>
        );
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
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
            {activeSection === 'profile' && <ChevronRight size={16} className="chevron-indicator" />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <span className="sidebar-icon"><Lock size={20} /></span>
            Conta e Segurança
            {activeSection === 'security' && <ChevronRight size={16} className="chevron-indicator" />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <span className="sidebar-icon"><Bell size={20} /></span>
            Notificações
            {activeSection === 'notifications' && <ChevronRight size={16} className="chevron-indicator" />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveSection('privacy')}
          >
            <span className="sidebar-icon"><Shield size={20} /></span>
            Privacidade
            {activeSection === 'privacy' && <ChevronRight size={16} className="chevron-indicator" />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSection('appearance')}
          >
            <span className="sidebar-icon"><Palette size={20} /></span>
            Aparência
            {activeSection === 'appearance' && <ChevronRight size={16} className="chevron-indicator" />}
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
