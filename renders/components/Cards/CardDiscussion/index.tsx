import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, Edit, Flag } from 'lucide-react';
//import ShareMenu from '../ShareMenu';
import CardButtonOptions from '../CardButtonOptions';
import './styles.css';

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

interface CardDiscussionProps {
  post: PostData;
  currentUserUid?: string;
  onOpenThread: (id: string | number) => void;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReport?: (id: string) => void;
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

const CardDiscussion: React.FC<CardDiscussionProps> = ({
  post,
  currentUserUid,
  onOpenThread,
  onLike,
  onDelete,
  onEdit,
  onReport,
  hideActions = false,
  style,
  forwardedRef,
}) => {
  const navigate = useNavigate();
  const avatarSrc = post.avatar || `https://ui-avatars.com/api/?name=${post.author}`;

  return (
    <article
      className={`cmmt-card-discussion-new ${currentUserUid === post.authorId ? 'cmmt-card-own-post' : ''}`}
      style={style}
      ref={forwardedRef}
    >
      <div className="cmmt-disc-header">
        <div className="cmmt-disc-author-section">
          <img
            src={avatarSrc}
            alt={post.author}
            className="cmmt-disc-avatar"
            onClick={(e) => {
              e.stopPropagation();
              if (post.authorId) navigate(`/profile/${post.authorId}`);
            }}
            style={{ cursor: post.authorId ? 'pointer' : 'default' }}
          />
          <div className="cmmt-disc-author-info">
            <h4
              className="cmmt-disc-author-name"
              onClick={(e) => {
                e.stopPropagation();
                if (post.authorId) navigate(`/profile/${post.authorId}`);
              }}
              style={{ cursor: post.authorId ? 'pointer' : 'default' }}
            >
              {post.author}
            </h4>
            <span className="cmmt-disc-author-role">
              {post.role} &bull; {formatTimeAgo(post.date)}
            </span>
          </div>
        </div>

        <div className="cmmt-disc-header-right">

          {!hideActions && (
            <CardButtonOptions
              options={
                currentUserUid === post.authorId
                  ? [
                    { label: 'Editar', icon: <Edit size={16} />, onClick: () => onEdit && onEdit(post.id) },
                    { label: 'Excluir', icon: <Trash2 size={16} />, onClick: () => onDelete && onDelete(post.id), danger: true }
                  ]
                  : [
                    { label: 'Denunciar', icon: <Flag size={16} />, onClick: () => onReport && onReport(post.id), danger: true }
                  ]
              }
            />
          )}
        </div>
      </div>

      <div className="cmmt-disc-body" onClick={() => onOpenThread(post.id)}>
        <p className="cmmt-disc-content" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>


      </div>

      {!hideActions && (
        <div className="cmmt-disc-footer">

          <div className="cmmt-disc-badge">
            <MessageSquare size={14} /> DISCUSSÃO
          </div>

          <div className="cmmt-disc-actions">
            <button className="cmmt-disc-action-btn" onClick={() => onOpenThread(post.id)} >
              <span className="cmmt-disc-action-count">{post.comments || 0}</span>
              <MessageSquare size={18} />
            </button>
            <button
              className={`cmmt-disc-action-btn ${post.likedBy?.includes(currentUserUid || '') ? 'cmmt-liked' : ''}`}
              onClick={() => onLike && onLike(post.id)}
            >
              <span className="cmmt-disc-action-count">{post.likes || 0}</span>
              <Heart size={18} fill={post.likedBy?.includes(currentUserUid || '') ? 'currentColor' : 'none'}
              />
            </button>


          </div>
        </div>
      )}
    </article>
  );
};

export default CardDiscussion;
