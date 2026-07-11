import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { learnService } from '../../../../../src/services/learnService';
import type { StudyNote } from '../../../../../src/types/learn';
import './styles.css';
import MarkdownRenderer from '../../../../../src/components/MarkdownRenderer';
import Footer from '../../../../menus/Footer';

const NoteDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [noteData, setNoteData] = useState<StudyNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchNote = async () => {
      if (!id) return;
      try {
        const data = await learnService.getNoteById(id);
        if (data) {
          setNoteData(data);
          setLikesCount(data.likes || 0);
        }
      } catch (err) {
        console.error("Erro ao carregar resumo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    const previousLiked = isLiked;
    setIsLiked(!previousLiked);
    setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);

    try {
      if (previousLiked) {
        await learnService.unlikeNote(id);
      } else {
        await learnService.likeNote(id);
      }
    } catch (err) {
      console.error("Erro ao processar like", err);
      // Reverte estado local em caso de erro
      setIsLiked(previousLiked);
      setLikesCount(prev => previousLiked ? prev + 1 : prev - 1);
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Carregando estudo...</div>;
  if (!noteData) return <div style={{ padding: '100px', textAlign: 'center' }}>Resumo não encontrado.</div>;

  return (
    <>
      <div className="note-detail-wrapper">
        <div className="note-detail-container">

          <button className="btn-back-learn" onClick={() => navigate('/learn')}>
            <ArrowLeft size={18} /> Voltar para Central de Estudos
          </button>

          <article className="note-article">
            <header className="note-article-header">
              <span className="note-tag">{noteData.subject}</span>
              <h1>{noteData.title}</h1>

              <div className="note-author-bar">
                <div 
                  className="author-info-left" 
                  onClick={() => navigate(`/profile/${noteData.authorId}`)}
                  style={{ cursor: 'pointer' }}
                  title={`Ver perfil de ${noteData.author}`}
                >
                  <div className="author-avatar"><User size={20} /></div>
                  <div>
                    <strong>{noteData.author}</strong>
                    <div className="note-meta">
                      <span>{noteData.date}</span>
                      <span className="dot">•</span>
                      <span><Clock size={14} /> {noteData.readTime} de leitura</span>
                    </div>
                  </div>
                </div>
                <div className="author-actions">
                  <button className="btn-follow">Seguir</button>
                </div>
              </div>
            </header>

            <div className="note-content-body">
              <MarkdownRenderer content={noteData.content} />
            </div>

            <footer className="note-article-footer">
              <div className="interaction-bar">
                <div className="interaction-left">
                  <button className={`btn-interact ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                    <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} />
                    <span>{likesCount}</span>
                  </button>
                  <button className="btn-interact">
                    <MessageSquare size={20} />
                    <span>12</span>
                  </button>
                </div>
                <div className="interaction-right">
                  <button className="btn-interact-icon" title="Salvar"><Bookmark size={20} /></button>
                  <button className="btn-interact-icon" title="Compartilhar"><Share2 size={20} /></button>
                </div>
              </div>
            </footer>
          </article>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default NoteDetail;