import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  UserPlus,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Link,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import { communityService } from '../../../../../src/services/communityService';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import ConfirmModal from '../../../../components/ConfirmModal';
import CardDiscussion from '../../../../components/Cards/CardDiscussion';
import CardButtonOptions from '../../../../components/Cards/CardButtonOptions';
import { Edit, Trash2, Flag } from 'lucide-react';
import './styles.css';

const ReplyItem = ({ 
  reply, navigate, currentUserUid, onEdit, onDelete 
}: { 
  reply: any; navigate: any; currentUserUid?: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content || '');
  const content = reply.content || '';
  const linesCount = content.split('\n').length;
  const isLong = content.length > 300 || linesCount > 3;

  return (
    <div className={`disc-comment-item ${reply.isAuthor ? 'author-highlight' : ''}`}>
      <img 
        src={reply.avatar} 
        alt={reply.author} 
        className="disc-comment-avatar" 
        onClick={(e) => { e.stopPropagation(); if(reply.authorId) navigate(`/profile/${reply.authorId}`); }}
        style={{ cursor: 'pointer' }}
      />
      <div className="disc-comment-content">
        <div className="disc-comment-header">
          <div className="disc-comment-author-info">
            <h4 
              onClick={(e) => { e.stopPropagation(); if(reply.authorId) navigate(`/profile/${reply.authorId}`); }}
              style={{ cursor: 'pointer' }}
            >
              {reply.author} {reply.isAuthor && <span className="disc-author-badge">Autor</span>}
            </h4>
            <span>{reply.role} • {reply.time}</span>
          </div>
          <CardButtonOptions
            options={
              currentUserUid === reply.authorId
                ? [
                  { label: 'Editar', icon: <Edit size={16} />, onClick: () => { setIsEditing(true); setEditContent(reply.content); } },
                  { label: 'Excluir', icon: <Trash2 size={16} />, onClick: () => onDelete(reply.id), danger: true }
                ]
                : [
                  { label: 'Denunciar', icon: <Flag size={16} />, onClick: () => alert('Em desenvolvimento'), danger: true }
                ]
            }
          />
        </div>

        {isEditing ? (
          <div style={{ marginTop: '8px' }}>
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setIsEditing(false); setEditContent(reply.content); }} 
                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => { onEdit(reply.id, editContent); setIsEditing(false); }} 
                style={{ padding: '6px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <p 
            className="disc-comment-text" 
            style={{ 
              whiteSpace: 'pre-wrap',
              margin: 0,
              ...( !expanded && isLong ? {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              } : {})
            }}
          >
            {content}
          </p>
          {isLong && !expanded && (
            <button 
              onClick={() => setExpanded(true)}
              style={{ 
                position: 'absolute',
                bottom: -2,
                right: 0,
                background: reply.isAuthor ? '#fcfcff' : '#fff',
                border: 'none', 
                color: 'var(--primary)', 
                cursor: 'pointer', 
                padding: '0 0 0 24px', 
                display: 'flex',
                alignItems: 'center'
              }}
              title="Expandir"
            >
              <ChevronDown size={18} />
            </button>
          )}
          {isLong && expanded && (
            <button 
              onClick={() => setExpanded(false)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--primary)', 
                cursor: 'pointer', 
                padding: '4px 0 0 0', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
                marginTop: '4px'
              }}
              title="Recolher"
            >
              <ChevronUp size={18} />
            </button>
          )}
          </div>
        )}
        
        {/* Renderiza link legado (string) se existir, por retrocompatibilidade */}
        {typeof reply.link === 'string' && reply.link && (
          <a 
            href={reply.link} 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#f3f4f6', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              fontSize: '0.85rem',
              color: 'var(--primary)',
              textDecoration: 'none',
              marginTop: '8px',
              fontWeight: '500',
              width: 'fit-content'
            }}
          >
            <ExternalLink size={14} /> Acessar Link Anexo
          </a>
        )}

        {/* Renderiza lista de links */}
        {reply.links && reply.links.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {reply.links.map((lnk: any, idx: number) => (
              <a 
                key={idx}
                href={lnk.url} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: '#f3f4f6', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  width: 'fit-content'
                }}
              >
                <Link size={14} /> {lnk.title}
              </a>
            ))}
          </div>
        )}

        <div className="disc-comment-actions" style={{ marginTop: '12px' }}>
          <div className="disc-vote-group-small">
            <button className="disc-action-btn-icon"><ChevronUp size={16} /></button>
            <span className="disc-vote-count-small">{reply.likes}</span>
            <button className="disc-action-btn-icon"><ChevronDown size={16} /></button>
          </div>
          <button className="disc-action-btn-small">Responder</button>
        </div>
      </div>
    </div>
  );
};

const DiscussionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [replyLinks, setReplyLinks] = useState<{title: string, url: string}[]>([]);
  const [tempLinkTitle, setTempLinkTitle] = useState('');
  const [tempLinkUrl, setTempLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
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
  const [editModal, setEditModal] = useState({ isOpen: false, content: '' });

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
        links: replyLinks,
        likes: 0,
        isAuthor: discussion.authorId === currentUser.uid
      };
      await communityService.addReply(id, newReply);
      setReplyText('');
      setReplyLinks([]);
      setTempLinkTitle('');
      setTempLinkUrl('');
      setShowLinkInput(false);
      await fetchDiscussion(); // Refresh
    } catch (err) {
      console.error("Erro ao responder", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReply = async (replyId: string, newContent: string) => {
    if (!id || !newContent.trim()) return;
    try {
      await communityService.updateReply(id, replyId, newContent);
      await fetchDiscussion();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReply = (replyId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Resposta',
      message: 'Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        if (!id) return;
        try {
          await communityService.deleteReply(id, replyId);
          await fetchDiscussion();
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
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

  const handleEditDiscussion = () => {
    if (!discussion) return;
    setEditModal({ isOpen: true, content: discussion.content || '' });
  };

  const handleSaveEditDiscussion = async (newContent: string) => {
    if (!id || !newContent.trim()) return;
    try {
      await communityService.updateDiscussion(id, newContent.trim());
      setDiscussion((prev: any) => ({ ...prev, content: newContent.trim() }));
    } catch (e) {
      console.error('Erro ao editar', e);
    } finally {
      setEditModal({ isOpen: false, content: '' });
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
            onEdit={handleEditDiscussion}
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
              {showLinkInput && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {replyLinks.map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <Link size={14} color="var(--primary)" />
                      <strong style={{ color: 'var(--text-main)' }}>{l.title}</strong>
                      <span style={{ color: 'var(--text-muted)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.url}</span>
                      <button 
                        onClick={() => setReplyLinks(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Remover link"
                      >
                        <X size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))}

                  {replyLinks.length < 5 && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: replyLinks.length > 0 ? '8px' : '0' }}>
                      <input
                        type="text"
                        placeholder="Título do Link (ex: Artigo Base)"
                        value={tempLinkTitle}
                        onChange={(e) => setTempLinkTitle(e.target.value)}
                        style={{ width: '35%', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.85rem', padding: '6px 10px', borderRadius: '4px' }}
                      />
                      <input
                        type="url"
                        placeholder="https://exemplo.com"
                        value={tempLinkUrl}
                        onChange={(e) => setTempLinkUrl(e.target.value)}
                        style={{ flex: 1, border: '1px solid #d1d5db', outline: 'none', fontSize: '0.85rem', padding: '6px 10px', borderRadius: '4px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tempLinkTitle.trim() && tempLinkUrl.trim()) {
                            e.preventDefault();
                            setReplyLinks(prev => [...prev, { title: tempLinkTitle.trim(), url: tempLinkUrl.trim() }]);
                            setTempLinkTitle('');
                            setTempLinkUrl('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if(tempLinkTitle.trim() && tempLinkUrl.trim()) {
                            setReplyLinks(prev => [...prev, { title: tempLinkTitle.trim(), url: tempLinkUrl.trim() }]);
                            setTempLinkTitle('');
                            setTempLinkUrl('');
                          }
                        }}
                        disabled={!tempLinkTitle.trim() || !tempLinkUrl.trim()}
                        style={{ 
                          background: (tempLinkTitle.trim() && tempLinkUrl.trim()) ? 'var(--primary)' : '#e5e7eb', 
                          color: (tempLinkTitle.trim() && tempLinkUrl.trim()) ? '#fff' : '#9ca3af', 
                          border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: (tempLinkTitle.trim() && tempLinkUrl.trim()) ? 'pointer' : 'not-allowed',
                          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600
                        }}
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>
                  )}
                  {replyLinks.length >= 5 && (
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>Você atingiu o limite de 5 links anexados por resposta.</span>
                  )}
                </div>
              )}
              <div className="disc-reply-footer">
                <span className="disc-reply-hint">Seja respeitoso e científico.</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    className="disc-btn-link-toggle"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    title="Anexar link"
                  >
                    <Link size={18} color={showLinkInput || replyLinks.length > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
                  </button>
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
                  <ReplyItem 
                    key={(reply as any).id} 
                    reply={reply} 
                    navigate={navigate} 
                    currentUserUid={currentUser?.uid} 
                    onEdit={handleEditReply}
                    onDelete={handleDeleteReply}
                  />
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
      {editModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '540px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Editar Discussão</h3>
            <textarea
              defaultValue={editModal.content}
              id="disc-edit-textarea"
              style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'inherit', resize: 'vertical', fontSize: '0.95rem' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditModal({ isOpen: false, content: '' })} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
              <button onClick={() => { const el = document.getElementById('disc-edit-textarea') as HTMLTextAreaElement; handleSaveEditDiscussion(el?.value || ''); }} style={{ padding: '8px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionDetail;