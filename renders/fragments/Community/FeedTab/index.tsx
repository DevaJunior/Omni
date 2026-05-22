import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import type { Discussion } from '../../../../src/types/community';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import './styles.css';
import ShareMenu from './../../../components/ShareMenu/index';

interface FeedTabProps {
  searchQuery?: string;
  onClear?: () => void;
}

const FeedTab: React.FC<FeedTabProps> = ({ searchQuery = '', onClear }) => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const data = await communityService.getDiscussions();
        setPosts(data);
      } catch (error) {
        console.error("Erro ao carregar feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussions();
  }, []);

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
    if (post.title && post.title.toLowerCase().includes(q)) score += 10;
    if (post.content.toLowerCase().includes(q)) score += 5;
    if (post.author.toLowerCase().includes(q)) score += 3;
    if (post.tags.some((tag: string) => tag.toLowerCase().includes(q))) score += 1;
    return score;
  };

  const filteredPosts = [...posts]
    .map(p => ({ ...p, _searchScore: getSearchScore(p) }))
    .filter(p => p._searchScore > 0)
    .sort((a, b) => {
       if (searchQuery) return b._searchScore - a._searchScore;
       return b.id.localeCompare(a.id);
    });

  return (
    <div className="cmmt-posts-list">
      {filteredPosts.length === 0 ? (
        <EmptyStateSearch 
          searchQuery={searchQuery} 
          onClear={onClear || (() => {})} 
          suggestions={['Bolsa de Valores', 'Biotecnologia', 'Python', 'Dúvidas']} 
        />
      ) : (
        filteredPosts.map(post => (
        <article key={post.id} className="cmmt-post-card">
          <div className="cmmt-post-header">
            <img src={post.avatar} alt={post.author} className="cmmt-author-avatar" />
            <div className="cmmt-author-info">
              <h4>{post.author}</h4>
              <span>{post.role} • {post.time}</span>
            </div>
          </div>

          <div className="cmmt-post-body">
            <p>{post.content}</p>
            <div className="cmmt-post-tags">
              {post.tags.map((tag: any) => (
                <span key={tag} className="cmmt-post-tag-item">{tag}</span>
              ))}
            </div>
          </div>

          <div className="cmmt-post-actions">
            <button className="cmmt-action-btn">
              <Heart size={18} /> {post.likes}
            </button>
            <button className="cmmt-action-btn cmmt-comments-btn" onClick={() => handleOpenThread(post.id)} >
              <MessageSquare size={18} /> {post.comments} Comentários
            </button>
            {/* <div className="cmmt-share">
              <ShareMenu image={post.avatar} text={`Confira a publicação de ${post.author} na Omni!`}
                url={`${window.location.origin}/discussion/${post.id}`} />
            </div> */}
            <div className="cmmt-share">
              <ShareMenu text={`Confira a publicação de ${post.author} na Omni!`}
                url={`${window.location.origin}/discussion/${post.id}`} />
            </div>
          </div>
        </article>
        ))
      )}
    </div>
  );
};

export default FeedTab;