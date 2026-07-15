import { useToastStore } from '../../../../src/stores/toastStore';
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
  Bookmark,
  MessageSquare,
  Beaker,
  Building2,
  Lock,
  Plus,
  Users,
  ArrowRight,
  MoreVertical,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../src/config/firebaseConfig';
import Footer from '../../../menus/Footer';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { bookmarkService, type IBookmark } from '../../../../src/services/bookmarkService';
import type { IUser } from '../../../../src/types';


const UserProfile: React.FC = () => {
  const { addToast } = useToastStore();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'projetos' | 'publicacoes' | 'colecoes'>('visao-geral');

  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [userDiscussions, setUserDiscussions] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<IBookmark[]>([]);
  const [affiliatedLabs, setAffiliatedLabs] = useState<any[]>([]);
  
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [bookmarkToRemove, setBookmarkToRemove] = useState<IBookmark | null>(null);
  const [spaceFilter, setSpaceFilter] = useState<'all' | 'colab'>('all');
  const [selectedSpaceType, setSelectedSpaceType] = useState<'lab' | 'personal'>('lab');

  const parseDateStr = (d: any) => {
    if (!d) return 0;
    const str = String(d);
    if (str.includes('/')) {
      const [day, month, year] = str.split('/');
      return new Date(`${year}-${month}-${day}`).getTime();
    }
    return new Date(str).getTime();
  };

  useEffect(() => {
    if (!userData) return;
    const fetchUserContent = async () => {
      try {
        const dQuery = query(collection(db, "discussions"), where("authorId", "==", userData.id));
        const dSnap = await getDocs(dQuery);
        const dData = dSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setUserDiscussions(dData.sort((a: { date: string }, b: { date: string }) => parseDateStr(b.date) - parseDateStr(a.date)));

        const pQuery = query(collection(db, "projects"), where("coordinator", "==", userData.name));
        const pSnap = await getDocs(pQuery);
        const pData = pSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setUserProjects(pData);

        const nQuery = query(collection(db, "notes"), where("authorId", "==", userData.id));
        const nSnap = await getDocs(nQuery);
        const nData = nSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setUserNotes(nData.sort((a: { date: string }, b: { date: string }) => parseDateStr(b.date) - parseDateStr(a.date)));

        const bks = await bookmarkService.getUserBookmarks(userData.id);
        setUserBookmarks(bks);

        // Buscar Laboratórios Afiliados Dinamicamente
        const userLabsList = userData.labs && userData.labs.length > 0 
          ? userData.labs 
          : (userData.lab ? [userData.lab] : []);

        const labsData = [];
        for (const uLab of userLabsList) {
          if (!uLab.id) continue;
          const labDoc = await getDoc(doc(db, 'labs', uLab.id));
          
          let memCount = 0;
          try {
            const mQuery = query(collection(db, 'users'), where('lab.id', '==', uLab.id));
            const mSnap = await getDocs(mQuery);
            memCount = mSnap.docs.length;
            
            if (labDoc.exists()) {
              const mems = mSnap.docs.map(d => ({ id: d.id }));
              if (labDoc.data().adminId && !mems.some(m => m.id === labDoc.data().adminId)) {
                memCount += 1;
              }
            }
          } catch (e) {
            console.error("Erro ao buscar membros:", e);
          }

          if (labDoc.exists()) {
             const labInfo = labDoc.data();
             labsData.push({
               id: labDoc.id,
               role: uLab.role,
               name: labInfo.name,
               institution: labInfo.institution || (uLab.id === '1' ? 'Laboratório Titular' : 'Universidade Federal'),
               membersCount: memCount
             });
          } else {
             labsData.push({
               id: uLab.id,
               role: uLab.role,
               name: uLab.name || 'Laboratório Desconhecido',
               institution: 'Instituição não informada',
               membersCount: memCount || 1
             });
          }
        }
        setAffiliatedLabs(labsData);

      } catch (err) {
        console.error("Erro ao buscar conteúdos do usuário:", err);
      }
    };
    fetchUserContent();
  }, [userData]);

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
          setUserData({ id: userDoc.id, ...userDoc.data() } as IUser);
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

  const handleFileUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (!currentUser || !userData) return;
    setIsUploading(true);

    try {
      const uniqueName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `users/${currentUser.uid}/${type}s/${uniqueName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, () => resolve());
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // Atualizar no Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { [type]: downloadURL });

      // Atualizar o state local
      setUserData({ ...userData, [type]: downloadURL });
      addToast(`${type === 'avatar' ? 'Foto de perfil' : 'Capa'} atualizada com sucesso!`, 'success');
    } catch (err) {
      console.error(`Erro ao fazer upload do ${type}:`, err);
      addToast(`Ocorreu um erro ao atualizar ${type === 'avatar' ? 'a foto' : 'a capa'}.`, 'error');
    } finally {
      setIsUploading(false);
    }
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
            <img
              src={userData.cover || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80"}
              alt="Capa do Perfil"
              className="profile-cover-img"
            />
            {isOwnProfile && (
              <label className="btn-edit-cover" style={{ cursor: 'pointer' }}>
                <Edit3 size={16} /> {isUploading ? 'Atualizando...' : 'Editar Capa'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0], 'cover');
                  }}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          <div className="profile-main-layout">

            {/* SIDEBAR ESQUERDA: Info Pessoal */}
            <aside className="profile-sidebar">
              <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
                <img src={userData.avatar || "https://ui-avatars.com/api/?name=" + (userData.name || "User")} alt={userData.name} className="profile-avatar" />
                {isOwnProfile && (
                  <label
                    className="btn-edit-avatar"
                    style={{ position: 'absolute', bottom: '0', right: '0', background: '#5d5fef', color: '#fff', padding: '6px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                    title="Editar foto de perfil"
                  >
                    <Edit3 size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0], 'avatar');
                      }}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>

              <div className="profile-basic-info">
                <h1>{userData.name || 'Usuário Omni'}</h1>
                <h2>{userData.headline || 'Pesquisador Acadêmico'}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {isOwnProfile ? (
                    <button className="btn-profile-primary" onClick={() => navigate('/settings')}>Editar Perfil</button>
                  ) : (
                    <button className="btn-profile-primary" onClick={async () => {
                      const { chatService } = await import('../../../../src/services/chatService');
                      if (currentUser && userProfile) {
                        await chatService.getOrCreateChat(currentUser.uid, id!, userProfile, userData);
                        navigate('/inbox');
                      }
                    }}>Enviar Mensagem</button>
                  )}
                </div>
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
                  className={`tab-btn ${activeTab === 'publicacoes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('publicacoes')}
                >
                  <BookOpen size={18} /> Publicações
                </button>
                <button
                  className={`tab-btn ${activeTab === 'projetos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projetos')}
                >
                  <Code2 size={18} /> Projetos
                </button>
                <button
                  className={`tab-btn ${activeTab === 'colecoes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('colecoes')}
                >
                  <Bookmark size={18} /> Coleções
                </button>

                <div className="tab-spacer"></div>

                {isOwnProfile && (
                  <>
                    <button
                      className="tab-btn-icon"
                      title="Nova Publicação"
                      onClick={() => setIsPublishModalOpen(true)}
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      className="tab-btn-icon"
                      title="Configurações da Conta"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings size={20} />
                    </button>
                  </>
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

                    <div className="spaces-section-header mt-4">
                      <div className="spaces-title-area">
                        <h3>Meus Espaços</h3>
                        <p>Laboratórios, projetos colaborativos e áreas privadas.</p>
                      </div>
                      <div className="spaces-filter">
                        <button className={spaceFilter === 'all' ? 'active' : ''} onClick={() => setSpaceFilter('all')}>Todos (3)</button>
                        <button className={spaceFilter === 'colab' ? 'active' : ''} onClick={() => setSpaceFilter('colab')}>Colaborativos</button>
                      </div>
                    </div>

                    <div className="spaces-grid mb-4" style={{ marginBottom: '2rem' }}>
                      {/* Laboratórios Dinâmicos do Firebase */}
                      {affiliatedLabs.map((labItem, idx) => (
                        <div key={idx} className={`space-card ${idx === 0 ? 'highlight' : ''}`}>
                          <div className="space-card-header">
                            <div className="space-icon-group">
                              <div className="space-icon-wrapper">
                                {idx === 0 ? <Beaker size={24} /> : <Building2 size={24} />}
                              </div>
                              <div className="space-info">
                                <h4>{labItem.name}</h4>
                                <p>{labItem.institution}</p>
                              </div>
                            </div>
                            <button className="space-options-btn"><MoreVertical size={20} /></button>
                          </div>
                          <div className="space-card-footer">
                            <div>
                              <span className="space-role-label">PAPEL</span>
                              <span className="space-role-value">{labItem.role || 'Membro'}</span>
                            </div>
                            <div className="space-actions">
                              {idx === 0 ? (
                                <div className="space-members-group">
                                  <img src="https://i.pravatar.cc/150?img=32" alt="Membro" className="space-member-avatar" />
                                  <img src="https://i.pravatar.cc/150?img=12" alt="Membro" className="space-member-avatar" />
                                  <div className="space-member-count">+{Math.max(0, labItem.membersCount - 2)}</div>
                                </div>
                              ) : (
                                <div className="space-members-text">
                                  <Users size={14} /> {labItem.membersCount}
                                </div>
                              )}
                              <button className={`btn-open-space ${idx === 0 ? 'primary' : ''}`} onClick={() => navigate(`/lab/${labItem.id}`)}>
                                {idx === 0 ? <ArrowRight size={18} /> : 'Abrir'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Workspace Pessoal (se for o próprio perfil) */}
                      {isOwnProfile && (
                        <div className="space-card">
                          <div className="space-card-header">
                            <div className="space-icon-group">
                              <div className="space-icon-wrapper">
                                <Lock size={24} />
                              </div>
                              <div className="space-info">
                                <h4>Workspace Pessoal</h4>
                                <p>Rascunhos & Dados Privados</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-card-footer">
                            <div>
                              <span className="space-role-label">ACESSO</span>
                              <div className="space-access-value"><div className="space-access-dot"></div>Privado</div>
                            </div>
                            <button className="btn-open-space" onClick={() => navigate(`/lab/${currentUser?.uid}/workspace`)}>Abrir</button>
                          </div>
                        </div>
                      )}

                      {/* Novo Espaço (se for o próprio perfil) */}
                      {isOwnProfile && (
                        <div className="space-card new-space" onClick={() => setIsSpaceModalOpen(true)}>
                          <Plus size={32} className="new-space-icon" />
                          <span className="new-space-text">Novo Espaço</span>
                        </div>
                      )}
                    </div>

                    <div className="content-card mt-4">
                      <h3 className="card-section-title">Atividade Recente</h3>
                      <div className="activity-feed">
                        {(() => {
                          const allActivities = [
                            ...userDiscussions.map(d => ({ ...d, type: 'discussion', sortDate: parseDateStr(d.date) })),
                            ...userNotes.map(n => ({ ...n, type: 'note', sortDate: parseDateStr(n.date) }))
                          ].sort((a, b) => b.sortDate - a.sortDate);

                          return (
                            <>
                              {allActivities.map(act => (
                                <div key={`${act.type}-${act.id}`} className="activity-item" onClick={() => navigate(act.type === 'discussion' ? `/discussion/${act.id}` : `/learn/${act.id}`)} style={{ cursor: 'pointer' }}>
                                  <div className={`activity-icon ${act.type === 'note' ? 'green' : 'blue'}`}><MessageSquare size={16} /></div>
                                  <div className="activity-details">
                                    <p>Publicou um{act.type === 'note' ? 'a nota de estudo' : 'a discussão'}: <strong>{act.title ? act.title.substring(0, 50) : (act.content ? act.content.substring(0, 50) : '')}...</strong></p>
                                    <span className="activity-time">{act.date || act.time}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="activity-item">
                                <div className="activity-icon blue"><Terminal size={16} /></div>
                                <div className="activity-details">
                                  <p>{userData.name} entrou na plataforma Omni.</p>
                                  <span className="activity-time">{(userData as any).createdAt || 'Recente'}</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA: PROJETOS */}
                {activeTab === 'projetos' && (
                  <div className="projects-grid anim-fade-up">
                    {userProjects.length > 0 ? (
                      userProjects.map(proj => (
                        <div key={proj.id} className="content-card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--primary-color)' }}>
                          <h3>{proj.title}</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{proj.institution} • {proj.type}</p>
                          <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{proj.description}</p>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {proj.tags?.map((t: string) => <span key={t} className="skill-tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{t}</span>)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state-card">
                        <Code2 size={48} />
                        <h3>Nenhum projeto público</h3>
                        <p>Inicie um novo projeto ou torne um projeto privado em público para exibí-lo aqui.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ABA: PUBLICAÇÕES */}
                {activeTab === 'publicacoes' && (
                  <div className="anim-fade-up">
                    {userNotes.length > 0 || userDiscussions.length > 0 ? (
                      [
                        ...userNotes.map(n => ({ ...n, type: 'note', sortDate: parseDateStr(n.date) })),
                        ...userDiscussions.map(d => ({ ...d, type: 'discussion', sortDate: parseDateStr(d.date) }))
                      ]
                        .sort((a, b) => b.sortDate - a.sortDate)
                        .map(pub => (
                          <div key={`${pub.type}-${pub.id}`} className="content-card" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => navigate(pub.type === 'note' ? `/learn/${pub.id}` : `/discussion/${pub.id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{pub.type === 'note' ? pub.title : 'Discussão na Comunidade'}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{pub.date || pub.time}</p>
                              </div>
                              <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{pub.type === 'note' ? pub.subject || 'Artigo' : 'Discussão'}</span>
                            </div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-color)' }}>{pub.type === 'note' ? pub.excerpt : pub.content}</p>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <span>❤️ {pub.likes || 0} Curtidas</span>
                              {pub.type === 'discussion' && <span>💬 {pub.comments || 0} Comentários</span>}
                              {pub.type === 'note' && <span>⏱️ {pub.readTime}</span>}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="empty-state-card">
                        <BookOpen size={48} />
                        <h3>Nenhuma publicação adicionada</h3>
                        <p>Compartilhe seus artigos científicos, resumos e produções acadêmicas com a comunidade.</p>
                        {isOwnProfile && (
                          <button className="btn-profile-outline mt-3">Adicionar Publicação</button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ABA: COLEÇÕES */}
                {activeTab === 'colecoes' && (
                  <div className="anim-fade-up">
                    {userBookmarks.length > 0 ? (
                      userBookmarks.map(bk => (
                        <div key={bk.id} className="content-card" style={{ marginBottom: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} 
                             onClick={() => navigate(bk.type === 'note' ? `/learn/${bk.targetId}` : bk.type === 'discussion' ? `/discussion/${bk.targetId}` : `/article/${bk.targetId}`)}>
                          <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{bk.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Salvo em {bk.savedAt ? new Date(bk.savedAt as any).toLocaleDateString('pt-BR') : 'Data Desconhecida'}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                              {bk.type === 'note' ? 'Nota' : bk.type === 'discussion' ? 'Discussão' : 'Artigo'}
                            </span>
                            <button 
                              className="btn-interact-icon" 
                              style={{ color: 'var(--primary)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookmarkToRemove(bk);
                              }}
                              title="Remover das Coleções"
                            >
                              <Bookmark size={20} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state-card">
                        <Bookmark size={48} />
                        <h3>Nenhum item salvo</h3>
                        <p>Os artigos, projetos e discussões que você salvar aparecerão aqui para fácil acesso.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </main>

          </div>
        </div>
      </div>
      <Footer />

      {/* MODAL DE PUBLICAÇÃO */}
      {isPublishModalOpen && (
        <div className="modal-overlay publish-modal-overlay" onClick={() => setIsPublishModalOpen(false)}>
          <div className="modal-container publish-modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
              <h2>O que você deseja publicar?</h2>
              <button className="btn-close-modal" onClick={() => setIsPublishModalOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="publish-options-grid">
              <div className="publish-option-card" onClick={() => {
                setIsPublishModalOpen(false);
                // Lógica de navegação ou ação para Conteúdo
              }}>
                <div className="publish-option-icon">
                  <MessageSquare size={24} />
                </div>
                <span className="publish-option-title">Conteúdo</span>
              </div>

              <div className="publish-option-card" onClick={() => {
                setIsPublishModalOpen(false);
                navigate('/community/publish-article'); // Exemplo de rota de artigo
              }}>
                <div className="publish-option-icon">
                  <BookOpen size={24} />
                </div>
                <span className="publish-option-title">Artigo</span>
              </div>

              <div className="publish-option-card" onClick={() => {
                setIsPublishModalOpen(false);
                navigate('/learn/publish-note'); // Exemplo de rota de nota/resumo
              }}>
                <div className="publish-option-icon">
                  <Bookmark size={24} />
                </div>
                <span className="publish-option-title">Resumo</span>
              </div>

              <div className="publish-option-card" onClick={() => {
                setIsPublishModalOpen(false);
                // Lógica de navegação para Pesquisa
              }}>
                <div className="publish-option-icon">
                  <Activity size={24} />
                </div>
                <span className="publish-option-title">Pesquisa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO ESPAÇO */}
      {isSpaceModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSpaceModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <Building2 className="modal-header-bg" size={160} color="#e2e8f0" style={{ right: '-20px', top: '-20px' }} />
              <h2>Adicionar Novo Espaço</h2>
              <p>Escolha que tipo de ambiente você deseja configurar.</p>
              <button className="btn-close-modal" onClick={() => setIsSpaceModalOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              <div 
                className={`space-option ${selectedSpaceType === 'lab' ? 'selected' : ''}`}
                onClick={() => setSelectedSpaceType('lab')}
              >
                <div className={`space-option-icon ${selectedSpaceType === 'lab' ? 'purple' : 'gray'}`}>
                  <Users size={24} />
                </div>
                <div className="space-option-content">
                  <h4>Laboratório ou Grupo de Pesquisa</h4>
                  <p>Crie um espaço colaborativo para gerenciar membros, permissões, inventário (LIMS) e projetos conjuntos.</p>
                </div>
                <div className="space-option-radio"></div>
              </div>

              <div 
                className={`space-option ${selectedSpaceType === 'personal' ? 'selected' : ''}`}
                onClick={() => setSelectedSpaceType('personal')}
              >
                <div className={`space-option-icon ${selectedSpaceType === 'personal' ? 'purple' : 'gray'}`}>
                  <Lock size={24} />
                </div>
                <div className="space-option-content">
                  <h4>Workspace Pessoal (Privado)</h4>
                  <p>Área restrita exclusiva para suas notas, drafts de artigos, análises em andamento e dados sensíveis.</p>
                </div>
                <div className="space-option-radio"></div>
              </div>

              <div className="modal-divider">OU JUNTE-SE A UM EXISTENTE</div>

              <div className="join-space-form">
                <div className="join-input-wrapper">
                  <LinkIcon size={18} className="join-input-icon" />
                  <input type="text" className="join-input" placeholder="Cole o Link de Convite ou Código do Lab..." />
                </div>
                <button className="btn-join">Solicitar Entrada</button>
              </div>
            </div>

            <div className="modal-footer">
              <p className="modal-footer-text">Você poderá alterar as configurações do espaço posteriormente.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setIsSpaceModalOpen(false)}>Cancelar</button>
                <button className="btn-continue">Continuar <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE REMOÇÃO DE COLEÇÃO */}
      {bookmarkToRemove && (
        <div className="modal-overlay" onClick={() => setBookmarkToRemove(null)}>
          <div className="modal-container" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Remover da Coleção</h2>
              <button className="btn-close-modal" onClick={() => setBookmarkToRemove(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ paddingTop: '1rem', paddingBottom: '1.5rem' }}>
              <p>Tem certeza que deseja remover <strong>{bookmarkToRemove.title}</strong> das suas coleções?</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
              <button 
                className="btn-modal-cancel" 
                style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }} 
                onClick={() => setBookmarkToRemove(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-confirm" 
                style={{ flex: 1, padding: '0.8rem', background: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white' }} 
                onClick={async () => {
                  await bookmarkService.toggleBookmark(userData!.id, bookmarkToRemove.targetId, bookmarkToRemove.type, bookmarkToRemove.title);
                  setUserBookmarks(prev => prev.filter(b => b.id !== bookmarkToRemove.id));
                  addToast('Item removido das Coleções.', 'info');
                  setBookmarkToRemove(null);
                }}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;