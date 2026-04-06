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
import Footer from '../../../menus/Footer';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'projetos' | 'publicacoes'>('visao-geral');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock de dados do usuário 
  const userData = {
    name: "Devair Junior",
    headline: "Mestrando em Biotecnologia | Bacharel em Ciência da Computação | Desenvolvedor Front-end",
    bio: "Unindo a engenharia de software com as ciências biológicas. Sou bacharel em Ciência da Computação e atualmente desenvolvo meu projeto de mestrado em Biotecnologia, focado em modelagem matemática e bioinformática aplicadas à fitorremediação. Apaixonado por criar interfaces limpas, arquiteturas escaláveis e, nas horas vagas, pelo universo nerd, fantasias e desenvolvimento de jogos.",
    location: "Alfenas, MG - Brasil",
    email: "contatodevairjunior@gmail.com",
    github: "github.com/DevaJunior",
    linkedin: "linkedin.com/in/devairjunior",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000",
    skills: ["React", "TypeScript", "Python", "Bioinformática", "Lógica P-Fuzzy", "CSS Puro", "Phaser 3"],
    lab: {
      name: "Phyton Research",
      role: "Pesquisador / Desenvolvedor Principal"
    },
    projects: [
      {
        id: 1,
        title: "Omni",
        description: "Plataforma web avançada para análise de dados de fitorremediação utilizando modelagem matemática com Lógica P-Fuzzy.",
        tags: ["React", "TypeScript", "Biotecnologia"],
        status: "Em Desenvolvimento"
      },
      {
        id: 2,
        title: "Spotted",
        description: "Plataforma B2B2C conectando profissionais de saúde (nutricionistas e personal trainers) aos seus clientes.",
        tags: ["SaaS", "MVP", "Vercel"],
        status: "Validação"
      },
      {
        id: 3,
        title: "Klaus Universe",
        description: "Desenvolvimento de mundo e game design para um jogo de plataforma 2D com temática de fantasia e folclore.",
        tags: ["Game Dev", "Phaser 3", "Storytelling"],
        status: "Conceito"
      }
    ]
  };

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