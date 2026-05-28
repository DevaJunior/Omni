import type { Project } from '../../../../../src/types/community';
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
  Link as LinkIcon,
  FlaskConical,
  ArrowRight
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import './styles.css';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import LabTeamTab from '../../../../fragments/Lab/LabTeamTab';
import Footer from '../../../../menus/Footer';
import JoinLabModal from './../../../../modals/JoinLabModal/index';
import ProjectApplicationModal from './../../../../modals/ProjectApplicationModal/index';

const LabProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'publicacoes' | 'oportunidades' | 'equipe_publica'>('publicacoes');
  
  const { userProfile } = useAuth();
  const [labData, setLabData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [realMembersCount, setRealMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Candidatura
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Utilizando o estado para atualizar o botão principal após sucesso do modal ou fetch
  const [hasRequested, setHasRequested] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchLabAndRequests = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const labRef = doc(db, 'labs', id);
        const labSnap = await getDoc(labRef);
        
        if (labSnap.exists()) {
          setLabData({ id: labSnap.id, ...labSnap.data() });

          // Buscar projetos (oportunidades) do lab
          const pQuery = query(collection(db, 'projects'), where('labId', '==', id));
          const pSnap = await getDocs(pQuery);
          const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProjects(pData);
          
          // Buscar número de membros reais
          const mQuery = query(collection(db, 'users'), where('lab.id', '==', id));
          const mSnap = await getDocs(mQuery);
          let memCount = mSnap.docs.length;
          
          // Garantir que o admin conta
          const mems = mSnap.docs.map(d => ({ id: d.id }));
          if (labSnap.data().adminId && !mems.some(m => m.id === labSnap.data().adminId)) {
            memCount += 1;
          }
          setRealMembersCount(memCount);
        } else {
          setLabData(null);
        }

        // Buscar se o usuário já tem solicitação enviada para este lab
        if (userProfile?.id) {
          const q = query(
            collection(db, 'lab_requests'),
            where('userId', '==', userProfile.id),
            where('labId', '==', id)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            // Pega o status da primeira solicitação encontrada
            const reqData = querySnapshot.docs[0].data();
            setRequestStatus(reqData.status);
            if (reqData.status === 'pending') {
              setHasRequested(true);
            }
          }
        }

      } catch (error) {
        console.error("Erro ao buscar laboratório:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabAndRequests();
  }, [id, userProfile]);

  // O estado real de filiação lido do perfil no Firebase ou via requisição aceita (fallback para testes)
  const isFiliado = userProfile?.lab?.name === labData?.name || userProfile?.lab?.id === labData?.id || requestStatus === 'accepted';

  useEffect(() => {
    if (id && userProfile?.following?.includes(id)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [userProfile, id]);

  const handleFollowToggle = async () => {
    if (!userProfile || !id) return;
    setIsFollowLoading(true);
    try {
      const userRef = doc(db, 'users', userProfile.id);
      if (isFollowing) {
        await updateDoc(userRef, { following: arrayRemove(id) });
        setIsFollowing(false);
      } else {
        await updateDoc(userRef, { following: arrayUnion(id) });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Erro ao seguir lab:", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleRequestJoin = () => {
    setIsModalOpen(true);
  };

  const handleApplyToProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  if (loading) {
    return (
      <div className="lab-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <h2>Carregando laboratório...</h2>
      </div>
    );
  }

  if (!labData) {
    return (
      <div className="lab-profile-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '1rem' }}>
        <h2>Laboratório não encontrado</h2>
        <button className="cmmt-btn-primary" onClick={() => navigate('/lab')}>Voltar para Comunidade</button>
      </div>
    );
  }

  return (
    <>
      <div className="lab-profile-page">
        <div className="lab-profile-container">

          <button className="tool-btn-back" onClick={() => navigate('/lab')}>
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
                    <button 
                      className={`lab-btn-outline ${isFollowing ? 'following' : ''}`} 
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      style={isFollowing ? { backgroundColor: '#f1f5f9', color: '#0f172a', borderColor: '#cbd5e1' } : {}}
                    >
                      {isFollowLoading ? 'Aguarde...' : isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                    <button
                      className={`lab-btn-solid ${isFiliado ? 'filiado' : hasRequested ? 'requested' : ''}`}
                      onClick={handleRequestJoin}
                      disabled={isFiliado || hasRequested}
                      style={isFiliado ? { backgroundColor: '#10b981', color: '#fff', borderColor: '#10b981', opacity: 0.8, cursor: 'default' } : {}}
                    >
                      {isFiliado ? (
                        <><CheckCircle2 size={16} /> Filiado ao LAB</>
                      ) : hasRequested ? (
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
                    className={activeTab === 'equipe_publica' ? 'active' : ''}
                    onClick={() => setActiveTab('equipe_publica')}
                  >
                    <Users size={16} /> Equipe
                  </button>
                </div>
              </div>

              {/* Lista de Publicações */}
              {activeTab === 'publicacoes' && (
                <div className="lab-publications-list">
                  {labData.publications?.length > 0 ? labData.publications.map((pub: Record<string, unknown>) => (
                    <article key={(pub as any).id} className="lab-pub-card-clean">
                      <div className="lab-pub-top">
                        <span className="lab-pub-type-tag">
                          <BookOpen size={16} /> {(pub as any).type || "Publicação Científica"}
                        </span>
                        <span className={`lab-pub-access ${pub.isFree ? 'open' : 'paywall'}`}>
                          {pub.isFree ? 'Open Access' : 'Paywall'}
                        </span>
                      </div>

                      <h3 className="lab-pub-title">{(pub as any).title}</h3>
                      <p className="lab-pub-authors">{(pub as any).authors || "Autores não listados"}</p>

                      <div className="lab-pub-meta-clean">
                        <strong>{(pub as any).journal}</strong>
                        <span><Calendar size={14} /> {(pub as any).date}</span>
                      </div>

                      <div className="lab-pub-bottom">
                        <div className="lab-pub-tags-clean">
                          {(pub as any).tags?.map((tag: string) => <span key={tag}>{tag}</span>)}
                        </div>
                        <button
                          className="lab-pub-link-btn"
                          onClick={() => navigate(`/article/${pub.id}`)}
                        >
                          Ler Artigo <ExternalLink size={14} />
                        </button>
                      </div>
                    </article>
                  )) : (
                    <div className="lab-placeholder-tab">Nenhuma publicação cadastrada neste laboratório.</div>
                  )}
                </div>
              )}

              {/* Aba de Oportunidades / Projetos */}
              {activeTab === 'oportunidades' && (
                <div className="lab-projects-list">
                  {projects.length > 0 ? projects.map((proj: any) => (
                    <article key={proj.id} className="lab-pub-card-clean" style={{ borderLeft: '4px solid #a5a6f6' }}>
                      <div className="lab-pub-top">
                        <span className="lab-pub-type-tag">
                          <Briefcase size={16} /> {proj.type || "Oportunidade"}
                        </span>
                        <span className="lab-pub-access open" style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981' }}>
                          {proj.status}
                        </span>
                      </div>

                      <h3 className="lab-pub-title">{proj.title}</h3>
                      <p className="lab-pub-authors">Coordenador: {proj.coordinator}</p>
                      
                      {proj.grant && (
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          <strong>Bolsa:</strong> {proj.grant}
                        </p>
                      )}

                      <div className="lab-pub-meta-clean">
                        <strong><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> {proj.location}</strong>
                        <span><Calendar size={14} /> Fechamento: {proj.deadline}</span>
                      </div>

                      <div className="lab-pub-bottom">
                        <div className="lab-pub-tags-clean">
                          {proj.tags?.map((tag: string) => <span key={tag}>{tag}</span>)}
                        </div>
                        <button
                          className="lab-btn-solid"
                          onClick={() => handleApplyToProject(proj)}
                        >
                          Candidatar-se <ArrowRight size={14} />
                        </button>
                      </div>
                    </article>
                  )) : (
                    <div className="lab-placeholder-tab">Sem projetos ativos ou oportunidades abertas no momento.</div>
                  )}
                </div>
              )}
              
              {activeTab === 'equipe_publica' && <LabTeamTab mode="public" labId={labData.id} />}
            </div>

            {/* COLUNA DIREITA (Sidebar) */}
            <div className="lab-sidebar-col">

              {isFiliado && (
                <div className="lab-sidebar-card researcher-space-card">
                  <div className="researcher-space-header">
                    <div className="researcher-space-icon">
                      <FlaskConical size={20} />
                    </div>
                    <h3>Espaço do Pesquisador</h3>
                  </div>
                  <p>
                    Acesse as ferramentas internas do laboratório, cadernos, gestão e LIMS.
                  </p>
                  <button 
                    className="researcher-space-btn"
                    onClick={() => navigate(`/lab/${labData.id}/workspace`)}
                  >
                    Acessar Workspace <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Artigos Destaque */}
              <div className="lab-sidebar-card">
                <h3>Artigos de Destaque</h3>
                <div className='lab-divisor'></div>
                <div className="lab-featured-list">
                  {labData.featuredArticles?.length > 0 ? labData.featuredArticles.map((art: any) => (
                    <div key={art.id} className="lab-featured-item">
                      <h4>{art.title}</h4>
                      <span>{art.journal} {art.year ? `• ${art.year}` : ''}</span>
                    </div>
                  )) : (
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Nenhum destaque registrado.</p>
                  )}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="lab-sidebar-card lab-stats-card">
                <div className="lab-stat-row">
                  <span>Visualizações</span>
                  <p>{labData.stats?.views || 0}</p>
                </div>
                <div className="lab-stat-row">
                  <span>Publicações</span>
                  <p>{labData.publications?.length || 0}</p>
                </div>
                <div className="lab-stat-row">
                  <span>Projetos</span>
                  <p>{projects.length}</p>
                </div>
                <div className="lab-stat-row">
                  <span>Membros</span>
                  <p>{realMembersCount}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <JoinLabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labId={labData.id}
        labName={labData.name}
        onSuccess={() => setHasRequested(true)} // Recebe o sinal de envio para atualizar o botão na tela
      />

      <ProjectApplicationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProject}
        labId={labData.id}
      />

      <Footer />
    </>
  );
};

export default LabProfile;