import './styles.css';
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  GraduationCap,
  Briefcase,
  Mail,
  Code2,
  BookOpen,
  Settings,
  Edit3,
  Terminal,
  Activity,
  ArrowLeft,
  Bookmark
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import Footer from '../../../menus/Footer';
import { useAuth } from '../../../../src/contexts/AuthContext';
import type { IUser } from '../../../../src/types';


const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'projetos' | 'publicacoes' | 'colecoes'>('visao-geral');

  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchUser = async () => {
      const targetId = id || (currentUser ? currentUser.uid : null);
      if (!targetId) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", targetId));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as IUser);
        } else if (currentUser && targetId === currentUser.uid) {
           // Fallback de segurança temporário se o doc do usuário logado acabou de ser criado e o Firestore ainda não indexou o read
           setUserData({ 
             id: currentUser.uid,
             name: currentUser.displayName || "Usuário Recente", 
             email: currentUser.email || "",
             role: "Pesquisador",
             avatar: currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
           } as any);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#a5a6f6' }}>
        <h2>Carregando Perfil...</h2>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        <h2>Erro: Usuário não encontrado no banco de dados.</h2>
      </div>
    );
  }

  // Fallbacks para campos que podem ser nulos em contas novas
  const lab = userData.lab || { name: 'Comunidade Omni', role: 'Pesquisador' };

  const isOwnProfile = !id || id === currentUser?.uid;

  return (
    <>
      <div className="user-profile-wrapper">
        <div className="user-profile-container">

          <button className="btn-back-profile" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Voltar
          </button>

          {/* HEADER / COVER */}
          <div className="profile-cover-card">
            <img
              src={userData.cover || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80"}
              alt="Capa do Perfil"
              className="profile-cover-img"
            />
            {isOwnProfile && (
              <button className="btn-edit-cover"><Edit3 size={16} /> Editar Capa</button>
            )}
          </div>

          <div className="profile-main-layout">

            {/* SIDEBAR ESQUERDA: Info Pessoal */}
            <aside className="profile-sidebar">
              <div className="profile-avatar-wrapper">
                <img src={userData.avatar || "https://ui-avatars.com/api/?name=" + (userData.name || "User")} alt={userData.name} className="profile-avatar" />
              </div>

              <div className="profile-basic-info">
                <h1>{userData.name || 'Usuário Omni'}</h1>
                <h2>{userData.headline || 'Pesquisador Acadêmico'}</h2>
                {isOwnProfile && (
                  <button className="btn-profile-primary" onClick={() => navigate('/settings')}>Editar Perfil</button>
                )}
              </div>

              <div className="profile-details-list">
                <div className="detail-item">
                  <MapPin size={18} />
                  <span>{userData.location || 'Localização não informada'}</span>
                </div>
                <div className="detail-item">
                  <Briefcase size={18} />
                  <span>{lab.role} em <strong style={{ cursor: 'pointer' }}>{lab.name}</strong></span>
                </div>
                <div className="detail-item">
                  <GraduationCap size={18} />
                  <span>{'Instituição não informada'}</span>
                </div>
                <div className="detail-item">
                  <Mail size={18} />
                  <a href={`mailto:${userData.email}`}>{userData.email}</a>
                </div>
              </div>

              <div className="profile-skills-section">
                <h3>Competências</h3>
                <div className="skills-tags">
                  {(userData.skills || []).length > 0 ? (
                    userData.skills?.map((skill: string) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <span className="skill-tag">Inovação Científica</span>
                  )}
                </div>
              </div>
            </aside>

            {/* COLUNA PRINCIPAL: Abas e Conteúdo */}
            <main className="profile-content-area">

              <div className="profile-tabs">
                <button
                  className={`tab-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
                  onClick={() => setActiveTab('visao-geral')}
                >
                  <Activity size={18} /> Visão Geral
                </button>
                <button
                  className={`tab-btn ${activeTab === 'projetos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projetos')}
                >
                  <Code2 size={18} /> Projetos
                </button>
                <button
                  className={`tab-btn ${activeTab === 'publicacoes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('publicacoes')}
                >
                  <BookOpen size={18} /> Publicações
                </button>
                <button
                  className={`tab-btn ${activeTab === 'colecoes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('colecoes')}
                >
                  <Bookmark size={18} /> Coleções
                </button>

                <div className="tab-spacer"></div>

                {isOwnProfile && (
                  <button
                    className="tab-btn-icon"
                    title="Configurações da Conta"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings size={20} />
                  </button>
                )}
              </div>

              <div className="profile-tab-content">

                {/* ABA: VISÃO GERAL */}
                {activeTab === 'visao-geral' && (
                  <div className="anim-fade-up">
                    <div className="content-card">
                      <h3 className="card-section-title">Sobre</h3>
                      <p className="profile-bio-text">{userData.bio || "Este usuário ainda não escreveu uma bio."}</p>
                    </div>

                    <div className="content-card mt-4">
                      <h3 className="card-section-title">Atividade Recente</h3>
                      <div className="activity-feed">
                        <div className="activity-item">
                          <div className="activity-icon blue"><Terminal size={16} /></div>
                          <div className="activity-details">
                            <p>Realizou login na plataforma Omni.</p>
                            <span className="activity-time">Agora</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA: PROJETOS */}
                {activeTab === 'projetos' && (
                  <div className="projects-grid anim-fade-up">
                    <div className="empty-state-card">
                      <Code2 size={48} />
                      <h3>Nenhum projeto público</h3>
                      <p>Inicie um novo projeto ou torne um projeto privado em público para exibí-lo aqui.</p>
                    </div>
                  </div>
                )}

                {/* ABA: PUBLICAÇÕES */}
                {activeTab === 'publicacoes' && (
                  <div className="empty-state-card anim-fade-up">
                    <BookOpen size={48} />
                    <h3>Nenhuma publicação adicionada</h3>
                    <p>Compartilhe seus artigos científicos, resumos e produções acadêmicas com a comunidade.</p>
                    {isOwnProfile && (
                      <button className="btn-profile-outline mt-3">Adicionar Publicação</button>
                    )}
                  </div>
                )}

                {/* ABA: COLEÇÕES */}
                {activeTab === 'colecoes' && (
                  <div className="empty-state-card anim-fade-up">
                    <Bookmark size={48} />
                    <h3>Nenhum item salvo</h3>
                    <p>Os artigos, projetos e discussões que você salvar aparecerão aqui para fácil acesso.</p>
                  </div>
                )}

              </div>
            </main>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;