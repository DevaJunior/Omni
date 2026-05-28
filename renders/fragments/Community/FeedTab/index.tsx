import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Send, Trash2 } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import type { Discussion } from '../../../../src/types/community';
import { useAuth } from '../../../../src/contexts/AuthContext';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import ConfirmModal from '../../../../renders/components/ConfirmModal';
import './styles.css';
import ShareMenu from './../../../components/ShareMenu/index';

interface FeedTabProps {
  searchQuery?: string;
  onClear?: () => void;
}

const FeedTab: React.FC<FeedTabProps> = ({ searchQuery = '', onClear }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Recente';
    const postDate = new Date(dateStr);
    const diffInMs = new Date().getTime() - postDate.getTime();
    const diffInSec = Math.floor(diffInMs / 1000);
    
    if (diffInSec < 60) return 'Agora mesmo';
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `Há ${diffInMin} min`;
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    return `Há ${diffInDays} dias`;
  };

  const [posts, setPosts] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const fetchDiscussions = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await communityService.getDiscussionsPaginated(5, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setPosts(prev => {
          const newPosts = response.data.filter(p => !prev.find(ext => ext.id === p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(response.data);
      }
      
      setLastVisible(response.lastDoc);
      setHasMore(response.data.length === 5 && response.lastDoc !== null);
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostText.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      await communityService.createDiscussion({
        author: userProfile?.name || currentUser.displayName || 'Você',
        authorId: currentUser.uid,
        avatar: userProfile?.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=Você`,
        role: userProfile?.role || 'Pesquisador(a)',
        time: 'Agora mesmo', // Mantido por compatibilidade, mas o render usará a data
        content: newPostText.trim(),
        category: 'Geral',
        date: new Date().toISOString(),
        likes: 0,
        comments: 0,
        tags: ['Discussão']
      });
      setNewPostText('');
      await fetchDiscussions();
    } catch (e) {
      console.error("Erro ao criar postagem", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Discussões...</div>;

  const handleOpenThread = (id: string | number) => {
    // Salva scroll antes de ir pro detalhe
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/discussion/${id}`);
  };

  const getSearchScore = (post: any) => {
    if (!searchQuery) return 1;
    const q = searchQuery.toLowerCase();
    let score = 0;
    if (((post as any).title && (post as any).title.toLowerCase()).includes(q)) score += 10;
    if (((post as any).content?.toLowerCase?.() || "").includes(q)) score += 5;
    if (((post as any).author?.toLowerCase?.() || "").includes(q)) score += 3;
    if (((post as any).tags?.some || (() => false))((tag: string) => tag.toLowerCase().includes(q))) score += 1;
    return score;
  };

  const filteredPosts = [...posts]
    .map((p: any) => ({ ...p, _searchScore: getSearchScore(p as any) }))
    .filter(p => p._searchScore > 0)
    .sort((a, b) => {
      if (searchQuery) return b._searchScore - a._searchScore;
      return b.id.localeCompare(a.id);
    });

  const handleLike = async (id: string) => {
    if (!currentUser) return;
    try {
      const { liked, likesCount } = await communityService.voteDiscussion(id, currentUser.uid);
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, likes: likesCount, likedBy: liked ? [...(p.likedBy || []), currentUser.uid] : (p.likedBy || []).filter(u => u !== currentUser.uid) } : p
      ));
    } catch (e) {
      console.error("Erro ao curtir", e);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Discussão',
      message: 'Deseja realmente excluir esta publicação?',
      onConfirm: async () => {
        try {
          await communityService.deleteDiscussion(id);
          setPosts(prev => prev.filter(p => p.id !== id));
        } catch (e) {
          console.error("Erro ao excluir", e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="cmmt-posts-list">

      {/* Formulário de Nova Discussão */}
      <div className="cmmt-create-post">
        <div className="cmmt-create-post-header">
          <img src={userProfile?.avatar || currentUser?.photoURL || `https://ui-avatars.com/api/?name=Você`} alt="Avatar" className="cmmt-author-avatar" />
          <textarea
            className="cmmt-create-post-input"
            placeholder="Inicie uma discussão ou faça uma pergunta..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            rows={3}
          />
        </div>
        <div className="cmmt-create-post-footer">
          <button
            className="cmmt-btn-send"
            disabled={!newPostText.trim() || isSubmitting}
            onClick={handleCreatePost}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'} <Send size={16} />
          </button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyStateSearch
          searchQuery={searchQuery}
          onClear={onClear || (() => { })}
          showTabSuggestion={true}
          suggestions={['Bolsa de Valores', 'Biotecnologia', 'Python', 'Dúvidas']}
        />
      ) : (
        filteredPosts.map(post => (
          <article key={post.id} className="cmmt-post-card">
            <div className="cmmt-post-header">
              <img 
                src={post.avatar} 
                alt={post.author} 
                className="cmmt-author-avatar" 
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.authorId}`); }}
                style={{ cursor: 'pointer' }}
              />
              <div className="cmmt-author-info">
                <h4 onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.authorId}`); }}>
                  {post.author}
                </h4>
                <span>{post.role} • {formatTimeAgo(post.date)}</span>
              </div>

              {currentUser?.uid === post.authorId && (
                <div className="cmmt-post-options">
                  <button className="cmmt-action-btn cmmt-delete-btn" onClick={() => handleDelete(post.id)} title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="cmmt-post-body" onClick={() => handleOpenThread(post.id)}>
              <p>{post.content}</p>
              <div className="cmmt-post-tags">
                {post.tags.map((tag: any) => (
                  <span key={tag} className="cmmt-post-tag-item">{tag}</span>
                ))}
              </div>
            </div>

            <div className="cmmt-post-actions">
              <button
                className={`cmmt-action-btn ${post.likedBy?.includes(currentUser?.uid || '') ? 'cmmt-liked' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                <Heart
                  size={18}
                  fill={post.likedBy?.includes(currentUser?.uid || '') ? 'currentColor' : 'none'}
                  className={post.likedBy?.includes(currentUser?.uid || '') ? 'cmmt-like-anim' : ''}
                />
                {post.likes}
              </button>
              <button className="cmmt-action-btn cmmt-comments-btn" onClick={() => handleOpenThread(post.id)} >
                <MessageSquare size={18} /> {post.comments} Comentários
              </button>
              <div className="cmmt-share">
                <ShareMenu text={`Confira a publicação de ${post.author} na Omni!`}
                  url={`${window.location.origin}/discussion/${post.id}`} />
              </div>
            </div>
          </article>
        ))
      )}
      
      {hasMore && !searchQuery && (
        <button 
          className="btn-primary" 
          onClick={() => fetchDiscussions(true)}
          disabled={loadingMore}
          style={{ width: '100%', padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
        >
          {loadingMore ? 'Carregando...' : 'Carregar Mais'}
        </button>
      )}
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

export default FeedTab;