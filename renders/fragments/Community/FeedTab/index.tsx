import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import './styles.css';
import ShareMenu from './../../../components/ShareMenu/index';

const FeedTab: React.FC = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "discussions"));
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
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

  return (
    <div className="cmmt-posts-list">
      {posts.map(post => (
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
      ))}
    </div>
  );
};

export default FeedTab;