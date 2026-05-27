import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Send,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Heart
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import { communityService } from '../../../../../src/services/communityService';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import './styles.css';

const DiscussionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [discussion, setDiscussion] = useState<any>(null);
  const [authorStats, setAuthorStats] = useState({ publications: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiscussion = async () => {
    if (!id) return;
    try {
      const docSnap = await getDoc(doc(db, "discussions", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDiscussion({ id: docSnap.id, ...data });

        if (data.authorId) {
          const userDoc = await getDoc(doc(db, "users", data.authorId));
          let followersCount = 0;
          if (userDoc.exists()) {
            followersCount = (userDoc.data().followers || []).length;
          }
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

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm("Deseja realmente excluir esta publicação?")) {
      try {
        await communityService.deleteDiscussion(id);
        navigate('/community');
      } catch (e) {
        console.error("Erro ao excluir", e);
      }
    }
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
          <article className="disc-original-post">
            <div className="disc-post-header">
              <img src={discussion.avatar} alt={discussion.author} className="disc-author-avatar" />
              <div className="disc-author-info">
                <h4>{discussion.author}</h4>
                <span>{discussion.role} • {discussion.time}</span>
              </div>
              
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {currentUser?.uid === discussion.authorId && (
                  <button className="disc-action-btn disc-delete-btn" onClick={handleDelete} title="Excluir">
                    <Trash2 size={16} />
                  </button>
                )}
                <button className="disc-btn-more"><MoreHorizontal size={20} /></button>
              </div>
            </div>

            <div className="disc-post-body">
              <p>{discussion.content}</p>
              <div className="disc-post-tags">
                {discussion.tags.map((tag: any) => (
                  <span key={tag} className="disc-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="disc-post-actions">
              <button 
                className={`disc-action-btn ${discussion.likedBy?.includes(currentUser?.uid || '') ? 'disc-liked' : ''}`} 
                onClick={handleLike}
              >
                <Heart 
                  size={18} 
                  fill={discussion.likedBy?.includes(currentUser?.uid || '') ? 'currentColor' : 'none'} 
                  className={discussion.likedBy?.includes(currentUser?.uid || '') ? 'disc-like-anim' : ''}
                /> 
                {discussion.likes}
              </button>
              <button className="disc-action-btn active-state">
                <MessageSquare size={18} /> {discussion.commentsCount} Comentários
              </button>
              <button className="disc-action-btn disc-share">
                <Share2 size={18} /> Compartilhar
              </button>
            </div>
          </article>

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
                discussion.replies.map((reply: any) => (
                  <div key={reply.id} className={`disc-comment-item ${reply.isAuthor ? 'author-highlight' : ''}`}>
                    <img src={reply.avatar} alt={reply.author} className="disc-comment-avatar" />
                    <div className="disc-comment-content">
                      <div className="disc-comment-header">
                        <div className="disc-comment-author-info">
                          <h4>{reply.author} {reply.isAuthor && <span className="disc-author-badge">Autor</span>}</h4>
                          <span>{reply.role} • {reply.time}</span>
                        </div>
                      </div>
                      <p className="disc-comment-text">{reply.content}</p>
                      <div className="disc-comment-actions">
                        <div className="disc-vote-group-small">
                          <button className="disc-action-btn-icon"><ChevronUp size={16} /></button>
                          <span className="disc-vote-count-small">{reply.likes}</span>
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
              <div className="disc-author-cover"></div>
              <img src={discussion.avatar} alt={discussion.author} className="disc-author-profile-pic" />
              <div className="disc-author-widget-info">
                <h3>{discussion.author}</h3>
                <p>{discussion.role}</p>
                <div className="disc-author-stats">
                  <div><strong>{authorStats.publications}</strong><span>Publicações</span></div>
                  <div><strong>{authorStats.followers}</strong><span>Seguidores</span></div>
                </div>
                <button className="disc-btn-follow-full">
                  <UserPlus size={18} /> Seguir Pesquisador
                </button>
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
    </div>
  );
};

export default DiscussionDetail;