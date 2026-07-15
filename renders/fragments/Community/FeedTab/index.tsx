import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useCommunityStore } from '../../../../src/store/useCommunityStore';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import ConfirmModal from '../../../../renders/components/ConfirmModal';
import DiscussionCard from '../../../../renders/components/DiscussionCard';
import './styles.css';

interface FeedTabProps {
  searchQuery?: string;
  onClear?: () => void;
}

const FeedTab: React.FC<FeedTabProps> = ({ searchQuery = '', onClear }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { discussions, setDiscussions, appendDiscussions } = useCommunityStore();


  const [loadingMore, setLoadingMore] = useState(false);
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

    try {
      const response = await communityService.getDiscussionsPaginated(5, isLoadMore ? discussions.lastDoc : null);
      if (isLoadMore) {
        appendDiscussions(response.data, response.lastDoc, response.data.length === 5 && response.lastDoc !== null);
      } else {
        setDiscussions(response.data, response.lastDoc, response.data.length === 5 && response.lastDoc !== null);
      }
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!discussions.isLoaded) {
      fetchDiscussions();
    }
  }, [discussions.isLoaded]);

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

  if (!discussions.isLoaded && discussions.data.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Discussões...</div>;

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

  const filteredPosts = [...discussions.data]
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
      
      const newData = discussions.data.map((p: any) =>
        p.id === id ? { ...p, likes: likesCount, likedBy: liked ? [...(p.likedBy || []), currentUser.uid] : (p.likedBy || []).filter((u: string) => u !== currentUser.uid) } : p
      );
      setDiscussions(newData, discussions.lastDoc, discussions.hasMore);
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
          const newData = discussions.data.filter((p: any) => p.id !== id);
          setDiscussions(newData, discussions.lastDoc, discussions.hasMore);
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
          <DiscussionCard
            key={post.id}
            post={post}
            currentUserUid={currentUser?.uid}
            onOpenThread={handleOpenThread}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        ))
      )}
      
      {discussions.hasMore && !searchQuery && (
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