import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  UserPlus,
  ChevronUp,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import { communityService } from '../../../../../src/services/communityService';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import ConfirmModal from '../../../../components/ConfirmModal';
import CardDiscussion from '../../../../components/CardDiscussion';
import './styles.css';

const DiscussionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [discussion, setDiscussion] = useState<any>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorStats, setAuthorStats] = useState({ publications: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const fetchDiscussion = async () => {
    if (!id) return;
    try {
      const docSnap = await getDoc(doc(db, "discussions", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDiscussion({ id: docSnap.id, ...data });

        if (data.authorId) {
          const userDoc = await getDoc(doc(db, "users", data.authorId));
          if (userDoc.exists()) {
            setAuthorProfile(userDoc.data());
          }

          // Busca contagem real de seguidores
          const followersQuery = query(collection(db, "users"), where("following", "array-contains", data.authorId));
          const followersSnap = await getDocs(followersQuery);
          const followersCount = followersSnap.docs.length;

          // Busca contagem de publicações do autor
          const pubQuery = query(collection(db, "discussions"), where("authorId", "==", data.authorId));
          const pubSnap = await getDocs(pubQuery);

          setAuthorStats({
            publications: pubSnap.docs.length,
            followers: followersCount
          });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar discussão", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDiscussion();
  }, [id]);

  useEffect(() => {
    if (discussion?.authorId && userProfile?.following?.includes(discussion.authorId)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [userProfile, discussion]);

  const handleFollowAuthor = async () => {
    if (!currentUser || !discussion?.authorId) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      if (isFollowing) {
        await updateDoc(userRef, { following: arrayRemove(discussion.authorId) });
        setIsFollowing(false);
        setAuthorStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await updateDoc(userRef, { following: arrayUnion(discussion.authorId) });
        setIsFollowing(true);
        setAuthorStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (e) {
      console.error("Erro ao seguir usuário", e);
    }
  };

  const handleSendReply = async () => {
    if (!id || !replyText.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      const newReply = {
        id: Date.now().toString(),
        author: userProfile?.name || currentUser.displayName || 'Você',
        authorId: currentUser.uid,
        avatar: userProfile?.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=Você`,
        role: 'Pesquisador(a)',
        time: 'Agora mesmo',
        content: replyText.trim(),
        likes: 0,
        isAuthor: discussion.authorId === currentUser.uid
      };
      await communityService.addReply(id, newReply);
      setReplyText('');
      await fetchDiscussion(); // Refresh
    } catch (e) {
      console.error("Erro ao enviar resposta", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!id || !currentUser) return;
    try {
      const { liked, likesCount } = await communityService.voteDiscussion(id, currentUser.uid);
      setDiscussion((prev: any) => ({
        ...prev,
        likes: likesCount,
        likedBy: liked ? [...(prev.likedBy || []), currentUser.uid] : (prev.likedBy || []).filter((u: string) => u !== currentUser.uid)
      }));
    } catch (e) {
      console.error("Erro ao curtir", e);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Discussão',
      message: 'Deseja realmente excluir esta publicação?',
      onConfirm: async () => {
        try {
          await communityService.deleteDiscussion(id);
          navigate('/community');
        } catch (e) {
          console.error("Erro ao excluir", e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando postagem...</div>;
  if (!discussion) return <div style={{ padding: '40px', textAlign: 'center' }}>Discussão não encontrada.</div>;



  return (
    <div className="disc-detail-container">

      {/* Botão de Voltar */}
      <button className="disc-btn-back" onClick={() => navigate('/community')}>
        <ArrowLeft size={20} />
        Voltar para Discussões
      </button>

      <div className="disc-detail-layout">

        {/* COLUNA PRINCIPAL: THREAD DE DISCUSSÃO */}
        <main className="disc-main-content">

          {/* Post Original */}
          {/* Post Original */}
          <CardDiscussion
            post={{
              id: discussion.id,
              avatar: discussion.avatar,
              author: discussion.author,
              authorId: discussion.authorId,
              role: discussion.role,
              date: discussion.date || discussion.time,
              content: discussion.content,
              tags: discussion.tags,
              likedBy: discussion.likedBy,
              likes: discussion.likes,
              comments: discussion.commentsCount,
            }}
            currentUserUid={currentUser?.uid}
            onOpenThread={() => {}}
            onLike={() => handleLike()}
            onDelete={() => setConfirmConfig({
              isOpen: true,
              title: 'Excluir discussão',
              message: 'Tem certeza que deseja excluir esta discussão? Esta ação não pode ser desfeita.',
              onConfirm: handleDelete
            })}
            style={{ marginBottom: '24px' }}
          />

          {/* Área de Resposta */}
          <div className="disc-reply-box">
            <div className="disc-reply-avatar-placeholder">Você</div>
            <div className="disc-reply-input-wrapper">
              <textarea
                placeholder="Adicione à discussão com seus conhecimentos..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <div className="disc-reply-footer">
                <span className="disc-reply-hint">Seja respeitoso e científico.</span>
                <button
                  className="disc-btn-send"
                  disabled={replyText.trim().length === 0 || isSubmitting}
                  onClick={handleSendReply}
                >
                  {isSubmitting ? 'Enviando...' : 'Responder'} <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          <hr className="disc-divider" />

          {/* Árvore de Comentários */}
          <div className="disc-comments-section">
            <h3 className="disc-comments-title">Respostas ({(discussion.replies || []).length})</h3>

            <div className="disc-comments-list">
              {(!discussion.replies || discussion.replies.length === 0) ? (
                <p style={{ color: 'var(--text-muted)' }}>Seja o primeiro a responder esta discussão!</p>
              ) : (
                discussion.replies.map((reply: Record<string, unknown>) => (
                  <div key={(reply as any).id} className={`disc-comment-item ${reply.isAuthor ? 'author-highlight' : ''}`}>
                    <img 
                      src={(reply as any).avatar} 
                      alt={(reply as any).author} 
                      className="disc-comment-avatar" 
                      onClick={(e) => { e.stopPropagation(); if((reply as any).authorId) navigate(`/profile/${(reply as any).authorId}`); }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="disc-comment-content">
                      <div className="disc-comment-header">
                        <div className="disc-comment-author-info">
                          <h4 
                            onClick={(e) => { e.stopPropagation(); if((reply as any).authorId) navigate(`/profile/${(reply as any).authorId}`); }}
                            style={{ cursor: 'pointer' }}
                          >
                            {(reply as any).author} {reply.isAuthor && <span className="disc-author-badge">Autor</span>}
                          </h4>
                          <span>{(reply as any).role} • {(reply as any).time}</span>
                        </div>
                      </div>
                      <p className="disc-comment-text">{(reply as any).content}</p>
                      <div className="disc-comment-actions">
                        <div className="disc-vote-group-small">
                          <button className="disc-action-btn-icon"><ChevronUp size={16} /></button>
                          <span className="disc-vote-count-small">{(reply as any).likes}</span>
                          <button className="disc-action-btn-icon"><ChevronDown size={16} /></button>
                        </div>
                        <button className="disc-action-btn-small">Responder</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* BARRA LATERAL: AUTOR E TRENDS */}
        <aside className="disc-sidebar">
          <div className="disc-sticky-wrapper">

            {/* Sobre o Autor */}
            <div className="disc-widget disc-author-widget">
              <div 
                className="disc-author-cover"
                style={authorProfile?.cover ? { backgroundImage: `url(${authorProfile.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              ></div>
              <img 
                src={authorProfile?.avatar || discussion.avatar} 
                alt={discussion.author} 
                className="disc-author-profile-pic" 
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${discussion.authorId}`); }}
                style={{ cursor: 'pointer' }}
              />
              <div className="disc-author-widget-info">
                <h3 
                  onClick={(e) => { e.stopPropagation(); navigate(`/profile/${discussion.authorId}`); }}
                  style={{ cursor: 'pointer' }}
                >
                  {authorProfile?.name || discussion.author}
                </h3>
                <p>{authorProfile?.role || discussion.role}</p>
                <div className="disc-author-stats">
                  <div><strong>{authorStats.publications}</strong><span>Publicações</span></div>
                  <div><strong>{authorStats.followers}</strong><span>Seguidores</span></div>
                </div>
                {currentUser?.uid !== discussion.authorId && (
                  <button 
                    className={`disc-btn-follow-full ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowAuthor}
                    style={isFollowing ? { backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' } : {}}
                  >
                    {isFollowing ? <><CheckCircle2 size={18} /> Seguindo</> : <><UserPlus size={18} /> Seguir Pesquisador</>}
                  </button>
                )}
              </div>
            </div>

            {/* Tópicos Relacionados */}
            <div className="disc-widget">
              <h3>Tópicos Relacionados</h3>
              <div className="disc-related-tags">
                <span className="disc-tag-outline">Python para Ciência</span>
                <span className="disc-tag-outline">Matemática Aplicada</span>
                <span className="disc-tag-outline">Tratamento de Água</span>
                <span className="disc-tag-outline">Biomassa</span>
              </div>
            </div>

          </div>
        </aside>

      </div>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default DiscussionDetail;