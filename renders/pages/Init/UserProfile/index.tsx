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
  MessageSquare
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../src/config/firebaseConfig';
import Footer from '../../../menus/Footer';
import { useAuth } from '../../../../src/contexts/AuthContext';
import type { IUser } from '../../../../src/types';


const UserProfile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'projetos' | 'publicacoes' | 'colecoes'>('visao-geral');

  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [userDiscussions, setUserDiscussions] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!userData) return;
    const fetchUserContent = async () => {
      try {
        const dQuery = query(collection(db, "discussions"), where("authorId", "==", userData.id));
        const dSnap = await getDocs(dQuery);
        const dData = dSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setUserDiscussions(dData.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));

        const pQuery = query(collection(db, "projects"), where("coordinator", "==", userData.name));
        const pSnap = await getDocs(pQuery);
        const pData = pSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setUserProjects(pData);
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
      alert(`${type === 'avatar' ? 'Foto de perfil' : 'Capa'} atualizada com sucesso!`);
    } catch (err) {
      console.error(`Erro ao fazer upload do ${type}:`, err);
      alert(`Ocorreu um erro ao atualizar ${type === 'avatar' ? 'a foto' : 'a capa'}.`);
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
                        {userDiscussions.length > 0 ? userDiscussions.slice(0, 3).map(disc => (
                          <div key={disc.id} className="activity-item" onClick={() => navigate(`/discussion/${disc.id}`)} style={{ cursor: 'pointer' }}>
                            <div className="activity-icon blue"><MessageSquare size={16} /></div>
                            <div className="activity-details">
                              <p>Publicou uma discussão: <strong>{disc.content.substring(0, 50)}...</strong></p>
                              <span className="activity-time">{disc.date ? new Date(disc.date).toLocaleDateString() : disc.time}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="activity-item">
                            <div className="activity-icon blue"><Terminal size={16} /></div>
                            <div className="activity-details">
                              <p>Realizou login na plataforma Omni.</p>
                              <span className="activity-time">Recente</span>
                            </div>
                          </div>
                        )}
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
                    {userDiscussions.length > 0 ? (
                      userDiscussions.map(pub => (
                        <div key={pub.id} className="content-card" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => navigate(`/discussion/${pub.id}`)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Discussão na Comunidade</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{pub.date ? new Date(pub.date).toLocaleDateString() : pub.time}</p>
                            </div>
                            <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Discussão</span>
                          </div>
                          <p style={{ marginTop: '1rem', color: 'var(--text-color)' }}>{pub.content}</p>
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span>❤️ {pub.likes} Curtidas</span>
                            <span>💬 {pub.comments || 0} Comentários</span>
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