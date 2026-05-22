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
  ChevronDown
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import './styles.css';

const DiscussionDetail: React.FC = () => {
  const navigate = useNavigate();
  // Capturando o ID da rota
  const { id } = useParams();

  const [replyText, setReplyText] = useState('');
  const [discussion, setDiscussion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDiscussion = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "discussions", id));
        if (docSnap.exists()) {
          setDiscussion({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Erro ao carregar discussão", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussion();
  }, [id]);

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
              <button className="disc-btn-more"><MoreHorizontal size={20} /></button>
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
              <div className="disc-vote-group">
                <button className="disc-action-btn-icon"><ChevronUp size={22} /></button>
                <span className="disc-vote-count">{discussion.likes}</span>
                <button className="disc-action-btn-icon"><ChevronDown size={22} /></button>
              </div>
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
                  disabled={replyText.trim().length === 0}
                >
                  Responder <Send size={16} />
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
                  <div><strong>45</strong><span>Publicações</span></div>
                  <div><strong>1.2k</strong><span>Seguidores</span></div>
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