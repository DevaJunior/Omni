import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Users,
  Briefcase,
  Calendar,
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import './styles.css';
import Footer from '../../../../menus/Footer';
import JoinLabModal from './../../../../modals/JoinLabModal/index';

const LabProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'publicacoes' | 'oportunidades' | 'equipe'>('publicacoes');
  
  // Utilizando o estado para atualizar o botão principal após sucesso do modal
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const labData = {
    id: id || "1",
    name: "Phyton Research",
    institution: "Universidade Federal de Alfenas (UNIFAL-MG)",
    verified: true,
    description: "Laboratório de excelência focado na intersecção entre biotecnologia ambiental, modelagem matemática e bioinformática. Desenvolvemos soluções escaláveis para a fitorremediação de ambientes aquáticos utilizando lógica P-Fuzzy e arquiteturas computacionais modernas.",
    location: "Alfenas, MG - Brasil",
    website: "phytonresearch.unifal.edu.br",
    email: "diretoria@phytonresearch.com",
    logoImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=200",
    stats: {
      views: 1245,
      publications: 245,
      projects: 23,
      members: 12
    },
    featuredArticles: [
      {
        id: 301,
        title: "Fitorremediação de Cádmio utilizando macrófitas aquáticas em biorreatores.",
        journal: "Journal of Botany",
        year: "2024"
      },
      {
        id: 302,
        title: "Comparativo entre Lógica Fuzzy e Redes Neurais na predição de qualidade da água.",
        journal: "Water Research",
        year: "2025"
      }
    ],
    publications: [
      {
        id: 201,
        title: "Modelagem P-Fuzzy Aplicada na Fitorremediação de Ambientes Aquáticos",
        authors: "Ribeiro, H. M.; Costa, A. L.; Silva, M.",
        journal: "Journal of Environmental Biotechnology",
        date: "Outubro, 2025",
        tags: ["Artigo Original", "P-Fuzzy"],
        isFree: true
      },
      {
        id: 202,
        title: "Desenvolvimento de Interfaces Web para Automação de Equipamentos",
        authors: "Mendes, R.; Eduardo, C.",
        journal: "Simpósio Internacional de Tecnologia",
        date: "Agosto, 2025",
        tags: ["Anais de Evento", "Automação"],
        isFree: false
      }
    ]
  };

  const handleRequestJoin = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="lab-profile-page">
        <div className="lab-profile-container">

          <button className="lab-btn-back-clean" onClick={() => navigate('/community')}>
            <ArrowLeft size={18} />
            Voltar para Comunidade
          </button>

          <div className="lab-grid-layout">

            {/* COLUNA ESQUERDA (Principal) */}
            <div className="lab-main-col">

              <div className="lab-header-card-clean">
                <div className="lab-header-top-row">
                  <img src={labData.logoImage} alt="Logo" className="lab-logo-clean" />

                  <div className="lab-title-area">
                    <span className="lab-badge-blue">LAB</span>
                    <div className="lab-name-row">
                      <h1>{labData.name}</h1>
                      {labData.verified && (
                        <svg className="lab-verified-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#5d5fef" />
                        </svg>
                      )}
                    </div>
                    <span className="lab-institution-clean">
                      <Building2 size={16} /> {labData.institution}
                    </span>
                  </div>

                  <div className="lab-action-buttons">
                    <button className="lab-btn-outline">Seguir</button>
                    <button
                      className={`lab-btn-solid ${hasRequested ? 'requested' : ''}`}
                      onClick={handleRequestJoin}
                      disabled={hasRequested}
                    >
                      {hasRequested ? (
                        <><CheckCircle2 size={16} /> Solicitação Enviada</>
                      ) : (
                        <><Users size={16} /> Filiar-se ao Lab</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="lab-about-section">
                  <p><strong>Sobre</strong> {labData.description}</p>
                </div>

                <div className="lab-contact-row">
                  <span><MapPin size={16} /> {labData.location}</span>
                  <span><Mail size={16} /> {labData.email}</span>
                  <a href={`https://${labData.website}`} target="_blank" rel="noreferrer">
                    <LinkIcon size={16} /> {labData.website}
                  </a>
                </div>
              </div>

              {/* Navegação de Abas */}
              <div className="lab-tabs-clean">
                <div className="lab-tabs-left">
                  <button
                    className={activeTab === 'publicacoes' ? 'active' : ''}
                    onClick={() => setActiveTab('publicacoes')}
                  >
                    <BookOpen size={16} /> Publicações
                  </button>
                  <button
                    className={activeTab === 'oportunidades' ? 'active' : ''}
                    onClick={() => setActiveTab('oportunidades')}
                  >
                    <Briefcase size={16} /> Oportunidades
                  </button>
                </div>
                <div className="lab-tabs-right">
                  <button
                    className={activeTab === 'equipe' ? 'active' : ''}
                    onClick={() => setActiveTab('equipe')}
                  >
                    <Users size={16} /> Equipe
                  </button>
                </div>
              </div>

              {/* Lista de Publicações */}
              {activeTab === 'publicacoes' && (
                <div className="lab-publications-list">
                  {labData.publications.map(pub => (
                    <article key={pub.id} className="lab-pub-card-clean">
                      <div className="lab-pub-top">
                        <span className="lab-pub-type-tag">
                          <BookOpen size={16} /> Publicação Científica
                        </span>
                        <span className={`lab-pub-access ${pub.isFree ? 'open' : 'paywall'}`}>
                          {pub.isFree ? 'Open Access' : 'Paywall'}
                        </span>
                      </div>

                      <h3 className="lab-pub-title">{pub.title}</h3>
                      <p className="lab-pub-authors">{pub.authors}</p>

                      <div className="lab-pub-meta-clean">
                        <strong>{pub.journal}</strong>
                        <span><Calendar size={14} /> {pub.date}</span>
                      </div>

                      <div className="lab-pub-bottom">
                        <div className="lab-pub-tags-clean">
                          {pub.tags.map(tag => <span key={tag}>{tag}</span>)}
                        </div>
                        <button
                          className="lab-pub-link-btn"
                          onClick={() => navigate(`/article/${pub.id}`)}
                        >
                          Ler Artigo <ExternalLink size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Placeholder para outras abas */}
              {activeTab === 'oportunidades' && <div className="lab-placeholder-tab">Sem oportunidades abertas no momento.</div>}
              {activeTab === 'equipe' && <div className="lab-placeholder-tab">Visualização da equipe.</div>}

            </div>

            {/* COLUNA DIREITA (Sidebar) */}
            <div className="lab-sidebar-col">

              {/* Artigos Destaque */}
              <div className="lab-sidebar-card">
                <h3>Artigos de Destaque</h3>
                <div className='lab-divisor'></div>
                <div className="lab-featured-list">
                  {labData.featuredArticles.map(art => (
                    <div key={art.id} className="lab-featured-item">
                      <h4>{art.title}</h4>
                      <span>{art.journal} • {art.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="lab-sidebar-card lab-stats-card">
                <div className="lab-stat-row">
                  <span>Visualizações</span>
                  <p>{labData.stats.views}</p>
                </div>
                <div className="lab-stat-row">
                  <span>Publicações</span>
                  <p>{labData.stats.publications}</p>
                </div>
                <div className="lab-stat-row">
                  <span>Projetos</span>
                  <p>{labData.stats.projects}</p>
                </div>
                <div className="lab-stat-row">
                  <span>Mmebros</span>
                  <p>{labData.stats.members}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <JoinLabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labName={labData.name}
        onSuccess={() => setHasRequested(true)} // Recebe o sinal de envio para atualizar o botão na tela
      />

      <Footer />
    </>
  );
};

export default LabProfile;