import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2,
  MessageSquare,
  Trash2,
  Send
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import { useAuth } from '../../../../src/contexts/AuthContext';
import NewPostModal from '../../../modals/NewPostModal';
import ConfirmModal from '../../../../components/ConfirmModal';
import './styles.css';

interface AreaComumTabProps {
  labId: string;
}

const AreaComumTab: React.FC<AreaComumTabProps> = ({ labId }) => {
  const { currentUser, userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!labId) return;
    
    // We fetch posts for the current lab, ordered by creation date descending
    const q = query(
      collection(db, 'lab_posts'),
      where('labId', '==', labId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar posts:", error);
      // Fallback se não houver índice criado no firestore ainda (orderBy require index)
      // Se falhar o orderBy, podemos tentar sem ele:
      if (error.message.includes('index')) {
        const fallbackQ = query(collection(db, 'lab_posts'), where('labId', '==', labId));
        onSnapshot(fallbackQ, (fallbackSnap) => {
          const fallbackPosts = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          // sort locally
          fallbackPosts.sort((a: any, b: any) => b.createdAt - a.createdAt);
          setPosts(fallbackPosts);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [labId]);

  const handleCreatePost = async (content: string) => {
    if (!currentUser || !userProfile) return;
    try {
      await addDoc(collection(db, 'lab_posts'), {
        labId,
        content,
        authorId: currentUser.uid,
        authorName: userProfile.name,
        authorRole: userProfile.lab?.role || 'Membro',
        authorAvatar: userProfile.avatar || '',
        createdAt: Date.now(),
        likes: [],
        comments: []
      });
    } catch (e) {
      console.error("Erro ao criar post:", e);
      alert('Ocorreu um erro ao criar o post.');
    }
  };

  const handleDeletePost = (postId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Apagar Post',
      message: 'Tem certeza que deseja apagar este post?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'lab_posts', postId));
        } catch (e) {
          console.error("Erro ao deletar:", e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleToggleLike = async (post: any) => {
    if (!currentUser) return;
    const postRef = doc(db, 'lab_posts', post.id);
    const hasLiked = post.likes?.includes(currentUser.uid);
    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (e) {
      console.error("Erro ao dar like:", e);
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || !userProfile) return;

    try {
      const postRef = doc(db, 'lab_posts', postId);
      const newComment = {
        id: crypto.randomUUID(),
        authorId: currentUser.uid,
        authorName: userProfile.name,
        authorAvatar: userProfile.avatar || '',
        content: commentText.trim(),
        createdAt: Date.now()
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      setCommentText('');
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  const handleDeleteComment = (postId: string, comment: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Apagar Comentário',
      message: 'Deseja realmente apagar este comentário?',
      onConfirm: async () => {
        try {
          const postRef = doc(db, 'lab_posts', postId);
          await updateDoc(postRef, {
            comments: arrayRemove(comment)
          });
        } catch (error) {
          console.error("Erro ao apagar comentário:", error);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const formatTime = (ts: number) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)}d`;
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="area-comum-tab-container anim-fade-up">
      <div className="area-comum-header-simple">
        <div className="header-text">
          <h3>Mural da Equipe</h3>
          <p>Comunicações e discussões compartilhadas no laboratório.</p>
        </div>
        <button className="btn-novo-post" onClick={() => setIsModalOpen(true)}>
          + Novo Post
        </button>
      </div>

      <div className="mural-posts-list">
        {loading ? (
          <p className="loading-msg">Carregando posts...</p>
        ) : posts.length === 0 ? (
          <p className="empty-msg">Nenhum post no mural ainda. Seja o primeiro a publicar!</p>
        ) : (
          posts.map((post) => {
            const hasLiked = post.likes?.includes(currentUser?.uid);
            const isAuthor = currentUser?.uid === post.authorId;
            const isAdmin = userProfile?.lab?.role?.toLowerCase().includes('admin') || userProfile?.lab?.role?.toLowerCase() === 'pi';
            const canDelete = isAuthor || isAdmin;

            return (
              <div key={post.id} className="mural-post-card">
                <div className="post-header">
                  <div className="post-author-info">
                    {post.authorAvatar ? (
                      <div className="author-avatar"><img src={post.authorAvatar} alt={post.authorName} /></div>
                    ) : (
                      <div className="author-avatar avatar-purple">{getInitials(post.authorName)}</div>
                    )}
                    <div className="author-details">
                      <span className="author-name">{post.authorName}</span>
                      <span className="author-meta">
                        <span className="role-blue">{post.authorRole}</span> • {formatTime(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  {canDelete && (
                    <button className="icon-btn-ghost text-red" onClick={() => handleDeletePost(post.id)} title="Excluir Post">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="post-body">
                  <p>{post.content}</p>
                </div>
                
                <div className="post-footer">
                  <div 
                    className={`post-action ${hasLiked ? 'liked' : ''}`} 
                    onClick={() => handleToggleLike(post)}
                  >
                    <CheckCircle2 size={16} />
                    <span>{post.likes?.length || 0} Cientes</span>
                  </div>
                  <div 
                    className="post-action" 
                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  >
                    <MessageSquare size={16} />
                    <span>{post.comments?.length || 0} Comentários</span>
                  </div>
                </div>

                {/* Seção de Comentários */}
                {expandedPostId === post.id && (
                  <div className="post-comments-section">
                    <div className="comments-list">
                      {post.comments?.map((comment: any) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">
                            {comment.authorAvatar ? (
                              <img src={comment.authorAvatar} alt={comment.authorName} />
                            ) : (
                              <div className="avatar-placeholder">{getInitials(comment.authorName)}</div>
                            )}
                          </div>
                          <div className="comment-content-box">
                            <div className="comment-header">
                              <span className="comment-author">{comment.authorName}</span>
                              <span className="comment-time">{formatTime(comment.createdAt)}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                          </div>
                          {(currentUser?.uid === comment.authorId || isAdmin) && (
                            <button className="icon-btn-ghost text-red comment-delete" onClick={() => handleDeleteComment(post.id, comment)}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <form className="comment-input-form" onSubmit={(e) => handleAddComment(e, post.id)}>
                      <input 
                        type="text" 
                        placeholder="Escreva um comentário..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <button type="submit" disabled={!commentText.trim()}><Send size={16}/></button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <NewPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
      
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

export default AreaComumTab;
