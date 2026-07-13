import Navbar from '../../../../menus/Navbar';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Plus, Clock, User, ThumbsUp, GraduationCap, Filter, LayoutGrid, List
} from 'lucide-react';
import { learnService } from '../../../../../src/services/learnService';
import type { StudyNote } from '../../../../../src/types/learn';
import Skeleton from '../../../../components/Skeleton';
import './styles.css';
import Footer from '../../../../menus/Footer';

const SUBJECTS = ['Todos', 'Biotecnologia', 'Bioquímica', 'Genética', 'Computação', 'Matemática'];

const Learn: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState('Todos');
  const [notesState, setNotesState] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await learnService.getAllNotes();
        setNotesState(data);
      } catch (error) {
        console.error("Erro ao buscar notas/resumos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Filtro Inteligente
  const filteredNotes = useMemo(() => {
    return notesState.filter(note => {
      const matchSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubject = activeSubject === 'Todos' || note.subject === activeSubject;
      return matchSearch && matchSubject;
    });
  }, [searchTerm, activeSubject, notesState]);

  // Função para evitar que o clique no "Like" também dispare o redirecionamento do card
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // A lógica de incrementar o Like viria aqui
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ padding: '100px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton type="title" width="40%" height="40px" />
        <Skeleton type="text" width="60%" height="20px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
           <Skeleton type="card" height="200px" />
           <Skeleton type="card" height="200px" />
           <Skeleton type="card" height="200px" />
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <div className="learn-page-wrapper">
        <div className="learn-container">

          {/* HEADER (HERO) */}
          <div className="learn-hero-section">
            <div className="learn-hero-content">
              <div className="learn-badge"><GraduationCap size={16} /> Central de Estudos</div>
              <h1>Aprenda, crie e <span>compartilhe.</span></h1>
              <p>
                Explore resumos acadêmicos, mapas mentais e anotações de aulas criadas por outros estudantes e pesquisadores. O conhecimento cresce quando é dividido.
              </p>
            </div>
            <div className="learn-hero-action">
              <button className="btn-publish-note" onClick={() => navigate('/learn/new')}>
                <Plus size={20} /> Publicar Resumo
              </button>
            </div>
          </div>

          {/* CONTROLES (BUSCA E FILTROS) */}
          <div className="learn-controls-bar">
            <div className="learn-search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar assunto, aula ou tema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="learn-filters-row">
              <div className="learn-filters-scroll">
                <div className="learn-filter-pills">
                  <span className="filter-label"><Filter size={16} /> Filtrar:</span>
                  {SUBJECTS.map(subject => (
                    <button
                      key={subject}
                      className={`filter-pill ${activeSubject === subject ? 'active' : ''}`}
                      onClick={() => setActiveSubject(subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className="view-toggle-btn"
                onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                title={viewMode === 'grid' ? "Alternar para visualização em lista" : "Alternar para visualização em grade"}
              >
                {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
              </button>
            </div>
          </div>

          {/* GRID DE RESUMOS */}
          <div className={`learn-notes-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredNotes.length === 0 ? (
              <div className="learn-empty-state">
                <BookOpen size={48} />
                <h3>Nenhum resumo encontrado</h3>
                <p>Tente ajustar os filtros ou pesquisar por outro termo.</p>
              </div>
            ) : (
              filteredNotes.map((note: any) => (
                <article
                  key={note.id}
                  className="study-note-card"
                  onClick={() => navigate(`/learn/${note.id}`)}
                >
                  <div className="note-card-header">
                    <span className="note-subject-tag">{note.subject}</span>
                    <button className="btn-like-icon" title="Curtir este resumo" onClick={handleLikeClick}>
                      <ThumbsUp size={16} /> {note.likes}
                    </button>
                  </div>

                  <div className="note-card-body">
                    <h2>{note.title}</h2>
                    <p>{note.excerpt}</p>
                  </div>

                  <div className="note-card-footer">
                    <div 
                      className="note-author-info"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (note.authorId) navigate(`/profile/${note.authorId}`);
                      }}
                      style={{ cursor: 'pointer' }}
                      title={`Ver perfil de ${note.author}`}
                    >
                      <User size={16} />
                      <span>{note.author}</span>
                    </div>
                    <div className="note-meta-info">
                      <span className="meta-date">{note.date}</span>
                      <span className="meta-dot">•</span>
                      <span className="meta-time"><Clock size={14} /> {note.readTime}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Learn;