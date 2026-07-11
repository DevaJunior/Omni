import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, ThumbsUp, MessageSquare, Share2, Bookmark, MoreVertical, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { useToastStore } from '../../../../../src/stores/toastStore';
import { useConfirmStore } from '../../../../../src/stores/confirmStore';
import { learnService } from '../../../../../src/services/learnService';
import type { StudyNote } from '../../../../../src/types/learn';
import './styles.css';
import MarkdownRenderer from '../../../../../src/components/MarkdownRenderer';
import Footer from '../../../../menus/Footer';
import ReportModal from '../../../../components/Modals/ReportModal';

const NoteDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [noteData, setNoteData] = useState<StudyNote | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();
  const [showOptions, setShowOptions] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const isAuthor = currentUser?.uid === noteData?.authorId;

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

  const handleDelete = () => {
    requestConfirm({
      title: 'Deletar Publicação',
      message: 'Tem certeza que deseja deletar esta publicação? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, deletar',
      cancelText: 'Cancelar',
      isDanger: true,
      onConfirm: async () => {
        try {
          await learnService.deleteNote(id!);
          addToast("Publicação deletada com sucesso.", "success");
          navigate('/learn');
        } catch (err) {
          addToast("Erro ao deletar publicação.", "error");
        }
      }
    });
  };

  const handleEdit = () => {
    navigate(`/learn/edit/${id}`);
  };

  const handleReportClick = () => {
    setShowOptions(false);
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reason: string) => {
    try {
      await learnService.reportNote(id!, currentUser?.uid || 'anonymous', reason);
      addToast("Denúncia enviada com sucesso. Nossa equipe irá analisar.", "success");
      setIsReportModalOpen(false);
    } catch (err) {
      addToast("Erro ao enviar denúncia.", "error");
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
                <div className="author-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isAuthor && <button className="btn-follow">Seguir</button>}
                  
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn-interact-icon" 
                      onClick={() => setShowOptions(!showOptions)}
                      title="Opções da Publicação"
                      style={{ padding: '4px' }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {showOptions && (
                      <div className="note-options-dropdown anim-fade-in">
                        {isAuthor ? (
                          <>
                            <button className="dropdown-btn" onClick={handleEdit}><Edit2 size={16} /> Editar</button>
                            <button className="dropdown-btn" onClick={handleDelete} style={{ color: '#e53e3e' }}><Trash2 size={16} /> Deletar</button>
                          </>
                        ) : (
                          <button className="dropdown-btn" onClick={handleReportClick} style={{ color: '#e53e3e' }}><AlertTriangle size={16} /> Denunciar</button>
                        )}
                      </div>
                    )}
                  </div>
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
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={handleReportSubmit} 
      />
    </>
  );
};

export default NoteDetail;