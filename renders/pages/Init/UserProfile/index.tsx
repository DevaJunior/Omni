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
  ArrowLeft
} from 'lucide-react';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import Footer from '../../../menus/Footer';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'projetos' | 'publicacoes'>('visao-geral');

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Busca dos dados no Firestore (ID mockado para validação)
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", "uid_devair_junior"));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
            <img src={userData.cover} alt="Capa do Perfil" className="profile-cover-img" />
            <button className="btn-edit-cover"><Edit3 size={16} /> Editar Capa</button>
          </div>

          <div className="profile-main-layout">

            {/* SIDEBAR ESQUERDA: Info Pessoal */}
            <aside className="profile-sidebar">
              <div className="profile-avatar-wrapper">
                <img src={userData.avatar} alt={userData.name} className="profile-avatar" />
              </div>

              <div className="profile-basic-info">
                <h1>{userData.name}</h1>
                <h2>{userData.headline}</h2>
                <button className="btn-profile-primary">Editar Perfil</button>
              </div>

              <div className="profile-details-list">
                <div className="detail-item">
                  <MapPin size={18} />
                  <span>{userData.location}</span>
                </div>
                <div className="detail-item">
                  <Briefcase size={18} />
                  <span>{userData.lab.role} em <strong onClick={() => navigate('/lab/1')} style={{ cursor: 'pointer' }}>{userData.lab.name}</strong></span>
                </div>
                <div className="detail-item">
                  <GraduationCap size={18} />
                  <span>Mestrado na UNIFAL-MG</span>
                </div>
                <div className="detail-item">
                  <Mail size={18} />
                  <a href={`mailto:${userData.email}`}>{userData.email}</a>
                </div>
                <div className="detail-item">
                  <FiGithub size={18} />
                  <a href={`https://${userData.github}`} target="_blank" rel="noreferrer">{userData.github}</a>
                </div>
                <div className="detail-item">
                  <FiLinkedin size={18} />
                  <a href={`https://${userData.linkedin}`} target="_blank" rel="noreferrer">{userData.linkedin}</a>
                </div>
              </div>

              <div className="profile-skills-section">
                <h3>Competências</h3>
                <div className="skills-tags">
                  {userData.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
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

                <div className="tab-spacer"></div>

                <button className="tab-btn-icon" title="Configurações da Conta">
                  <Settings size={20} />
                </button>
              </div>

              <div className="profile-tab-content">

                {/* ABA: VISÃO GERAL */}
                {activeTab === 'visao-geral' && (
                  <div className="anim-fade-up">
                    <div className="content-card">
                      <h3 className="card-section-title">Sobre</h3>
                      <p className="profile-bio-text">{userData.bio}</p>
                    </div>

                    <div className="content-card mt-4">
                      <h3 className="card-section-title">Atividade Recente</h3>
                      <div className="activity-feed">
                        <div className="activity-item">
                          <div className="activity-icon blue"><Terminal size={16} /></div>
                          <div className="activity-details">
                            <p>Adicionou o módulo <strong>Engine P-Fuzzy</strong> à plataforma Omni.</p>
                            <span className="activity-time">Hoje</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon green"><BookOpen size={16} /></div>
                          <div className="activity-details">
                            <p>Apoiou a publicação <em>"Modelagem P-Fuzzy Aplicada na Fitorremediação"</em>.</p>
                            <span className="activity-time">Há 3 dias</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon amber"><Briefcase size={16} /></div>
                          <div className="activity-details">
                            <p>Atualizou o status do projeto <strong>Spotted</strong> para "Validação".</p>
                            <span className="activity-time">Semana passada</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA: PROJETOS */}
                {activeTab === 'projetos' && (
                  <div className="projects-grid anim-fade-up">
                    {userData.projects.map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <h4><Code2 size={18} /> {project.title}</h4>
                          <span className={`project-status ${project.status === 'Validação' ? 'status-amber' : 'status-blue'}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="project-description">{project.description}</p>
                        <div className="project-footer">
                          <div className="project-tags">
                            {project.tags.map(tag => <span key={tag}>{tag}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ABA: PUBLICAÇÕES */}
                {activeTab === 'publicacoes' && (
                  <div className="empty-state-card anim-fade-up">
                    <BookOpen size={48} />
                    <h3>Nenhuma publicação adicionada</h3>
                    <p>Compartilhe seus artigos científicos, resumos e produções acadêmicas com a comunidade.</p>
                    <button className="btn-profile-outline mt-3">Adicionar Publicação</button>
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