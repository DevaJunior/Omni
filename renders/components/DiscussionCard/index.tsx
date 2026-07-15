import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import ShareMenu from '../ShareMenu';

export interface PostData {
  id: string;
  avatar?: string;
  author: string;
  authorId?: string;
  role: string;
  date?: string;
  content: string;
  tags?: string[];
  likedBy?: string[];
  likes?: number;
  comments?: number;
}

interface DiscussionCardProps {
  post: PostData;
  currentUserUid?: string;
  onOpenThread: (id: string | number) => void;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
  hideActions?: boolean;
  style?: React.CSSProperties;
  forwardedRef?: React.Ref<HTMLElement>;
}

export const formatTimeAgo = (dateStr?: string) => {
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

const DiscussionCard: React.FC<DiscussionCardProps> = ({
  post,
  currentUserUid,
  onOpenThread,
  onLike,
  onDelete,
  hideActions = false,
  style,
  forwardedRef,
}) => {
  const navigate = useNavigate();
  const avatarSrc = post.avatar || `https://ui-avatars.com/api/?name=${post.author}`;

  return (
    <article className="cmmt-post-card" style={style} ref={forwardedRef}>
      <div className="cmmt-post-header">
        <img 
          src={avatarSrc} 
          alt={post.author} 
          className="cmmt-author-avatar" 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (post.authorId) navigate(`/profile/${post.authorId}`); 
          }}
          style={{ cursor: post.authorId ? 'pointer' : 'default' }}
        />
        <div className="cmmt-author-info">
          <h4 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (post.authorId) navigate(`/profile/${post.authorId}`); 
            }}
            style={{ cursor: post.authorId ? 'pointer' : 'default' }}
          >
            {post.author}
          </h4>
          <span>{post.role} • {formatTimeAgo(post.date)}</span>
        </div>

        {!hideActions && currentUserUid === post.authorId && onDelete && (
          <div className="cmmt-post-options">
            <button className="cmmt-action-btn cmmt-delete-btn" onClick={() => onDelete(post.id)} title="Excluir">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="cmmt-post-body" onClick={() => onOpenThread(post.id)}>
        <p>{post.content}</p>
        <div className="cmmt-post-tags">
          {post.tags?.map((tag: string) => (
            <span key={tag} className="cmmt-post-tag-item">{tag}</span>
          ))}
        </div>
      </div>

      {!hideActions && (
        <div className="cmmt-post-actions">
          <button
            className={`cmmt-action-btn ${post.likedBy?.includes(currentUserUid || '') ? 'cmmt-liked' : ''}`}
            onClick={() => onLike && onLike(post.id)}
          >
            <Heart
              size={18}
              fill={post.likedBy?.includes(currentUserUid || '') ? 'currentColor' : 'none'}
              className={post.likedBy?.includes(currentUserUid || '') ? 'cmmt-like-anim' : ''}
            />
            {post.likes || 0}
          </button>
          <button className="cmmt-action-btn cmmt-comments-btn" onClick={() => onOpenThread(post.id)} >
            <MessageSquare size={18} /> {post.comments || 0} Comentários
          </button>
          <div className="cmmt-share">
            <ShareMenu text={`Confira a publicação de ${post.author} na Omni!`}
              url={`${window.location.origin}/discussion/${post.id}`} />
          </div>
        </div>
      )}
    </article>
  );
};

export default DiscussionCard;
