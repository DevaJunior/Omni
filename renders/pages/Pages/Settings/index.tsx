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
  ArrowLeft,
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

            <div className="settings-card-sub" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold' }}>Endereço de E-mail</label>
                <div className="input-with-badge" style={{ position: 'relative', marginTop: '12px' }}>
                  <input
                    type="email"
                    className="form-control"
                    disabled
                    value={currentUser?.email || 'contatodevairjunior@gmail.com'}
                    style={{ background: '#ffffff', width: '100%', paddingRight: '100px', cursor: 'not-allowed', color: '#334155' }}
                  />
                  <span className="verified-badge" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '600' }}>Verificado</span>
                </div>
                <p className="section-description" style={{ fontSize: '0.8rem', marginTop: '12px', marginBottom: 0 }}>
                  O e-mail não pode ser alterado pois está vinculado ao Google Auth.
                </p>
              </div>
            </div>

            <div className="settings-card-sub" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="security-info">
                <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>Autenticação em Duas Etapas</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Adicione uma camada extra de segurança à sua conta.</p>
              </div>
              <button 
                className="btn-secondary" 
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', padding: '8px 20px', borderRadius: '8px', fontWeight: '500' }}
              >
                Configurar
              </button>
            </div>

            <div className="settings-card-sub danger-zone" style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="security-info">
                <h4 style={{ fontSize: '1rem', color: '#b91c1c', fontWeight: 'bold', marginBottom: '4px' }}>Desativar Conta</h4>
                <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: 0 }}>Isso tornará seu perfil privado e ocultará sua atividade.</p>
              </div>
              <button className="btn-danger" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '500' }}>Desativar</button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Notificações</h2>
            <p className="section-description">Controle como e quando você recebe alertas da plataforma Omni.</p>
            
            <div className="settings-card-sub" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div className="form-group-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>Notificações de E-mail</h4>
                  <p className="section-description" style={{ fontSize: '0.9rem', margin: 0 }}>Receber um resumo de mensagens e convites por e-mail.</p>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>
              
              <hr style={{ margin: '0', borderColor: '#e2e8f0', borderTop: 'none' }} />
              
              <div className="form-group-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>Push Notifications</h4>
                  <p className="section-description" style={{ fontSize: '0.9rem', margin: 0 }}>Receber notificações no navegador para mensagens instantâneas.</p>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>

              <hr style={{ margin: '0', borderColor: '#e2e8f0', borderTop: 'none' }} />
              
              <div className="form-group-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>Newsletter Semanal</h4>
                  <p className="section-description" style={{ fontSize: '0.9rem', margin: 0 }}>Resumo de novas oportunidades e tópicos em alta da comunidade.</p>
                </div>
                <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>
            </div>
            
            <button className="save-button" style={{ marginTop: '24px', background: '#6366f1', width: 'auto', padding: '12px 24px', borderRadius: '8px' }}>Salvar Preferências</button>
          </div>
        );

      case 'privacy':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Privacidade</h2>
            <p className="section-description">Gerencie a visibilidade dos seus dados e atividades.</p>
            
            <div className="settings-card-sub" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div className="form-group-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>Perfil Público</h4>
                  <p className="section-description" style={{ fontSize: '0.9rem', margin: 0 }}>Permitir que usuários não logados encontrem seu perfil.</p>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>
              
              <hr style={{ margin: '0', borderColor: '#e2e8f0', borderTop: 'none' }} />
              
              <div className="form-group-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>Mostrar E-mail</h4>
                  <p className="section-description" style={{ fontSize: '0.9rem', margin: 0 }}>Exibir seu endereço de e-mail na página de perfil público.</p>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>

              <hr style={{ margin: '0', borderColor: '#e2e8f0', borderTop: 'none' }} />
              
              <div className="form-group-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}>Mostrar Inventário do Lab</h4>
                  <p className="section-description" style={{ fontSize: '0.9rem', margin: 0 }}>Permitir que membros de outros laboratórios vejam seu inventário público.</p>
                </div>
                <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>
            </div>
            
            <button className="save-button" style={{ marginTop: '24px', background: '#6366f1', width: 'auto', padding: '12px 24px', borderRadius: '8px' }}>Atualizar Privacidade</button>
          </div>
        );

      case 'appearance':
        return (
          <div className="section-fade-in">
            <h2 className="section-title">Aparência</h2>
            <p className="section-description">Personalize a experiência visual da plataforma.</p>
            
            <div className="settings-card-sub" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '16px', display: 'block' }}>Tema da Interface</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="radio" name="theme" value="light" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '0.95rem', color: '#334155' }}>Modo Claro</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="radio" name="theme" value="dark" disabled style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Modo Escuro (Em breve)</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="radio" name="theme" value="system" style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '0.95rem', color: '#334155' }}>Usar Padrão do Sistema</span>
                  </label>
                </div>
              </div>
            </div>
            
            <button className="save-button" style={{ marginTop: '24px', background: '#6366f1', width: 'auto', padding: '12px 24px', borderRadius: '8px' }}>Aplicar Tema</button>
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
            {activeSection === 'notifications' && <ChevronRight size={16} className="chevron-indicator" style={{ marginLeft: 'auto' }} />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveSection('privacy')}
          >
            <span className="sidebar-icon"><Shield size={20} /></span>
            Privacidade
            {activeSection === 'privacy' && <ChevronRight size={16} className="chevron-indicator" style={{ marginLeft: 'auto' }} />}
          </button>

          <button
            className={`sidebar-item ${activeSection === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSection('appearance')}
          >
            <span className="sidebar-icon"><Palette size={20} /></span>
            Aparência
            {activeSection === 'appearance' && <ChevronRight size={16} className="chevron-indicator" style={{ marginLeft: 'auto' }} />}
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
