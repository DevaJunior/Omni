import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Plus,
  Clock,
  User,
  ThumbsUp,
  GraduationCap,
  Filter
} from 'lucide-react';
import './styles.css';
import Footer from '../../../../menus/Footer';

// Tipagem de um Resumo/Estudo
interface StudyNote {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  subject: string;
  date: string;
  likes: number;
  readTime: string;
}

// Dados Simulados
const MOCK_NOTES: StudyNote[] = [
  {
    id: '1',
    title: 'Mapa Mental: Ciclo de Krebs e Fosforilação Oxidativa',
    excerpt: 'Resumo visual completo das etapas da respiração celular, saldo de ATP e principais enzimas envolvidas na matriz mitocondrial.',
    author: 'Maria Clara S.',
    subject: 'Bioquímica',
    date: '02 Abr, 2026',
    likes: 124,
    readTime: '5 min'
  },
  {
    id: '2',
    title: 'Genética de Populações: Equilíbrio de Hardy-Weinberg',
    excerpt: 'Anotações da aula prática abordando o cálculo de frequências alélicas e genotípicas em populações ideais.',
    author: 'Devair Junior',
    subject: 'Genética',
    date: '28 Mar, 2026',
    likes: 89,
    readTime: '8 min'
  },
  {
    id: '3',
    title: 'Estruturas de Dados Básicas em C',
    excerpt: 'Estudo focado na implementação de Pilhas, Filas e Árvores Binárias com exemplos de código comentados.',
    author: 'Carlos E.',
    subject: 'Computação',
    date: '20 Mar, 2026',
    likes: 210,
    readTime: '12 min'
  },
  {
    id: '4',
    title: 'Fitorremediação: Mecanismos de Tolerância a Metais Pesados',
    excerpt: 'Resumo teórico sobre como macrófitas aquáticas acumulam e estabilizam cádmio e chumbo em suas raízes.',
    author: 'Ana Carolina',
    subject: 'Biotecnologia',
    date: '15 Mar, 2026',
    likes: 156,
    readTime: '10 min'
  },
  {
    id: '5',
    title: 'Introdução à Lógica P-Fuzzy',
    excerpt: 'Conceitos iniciais, funções de pertinência e aplicações em bioprocessos baseados em sistemas especialistas.',
    author: 'Devair Junior',
    subject: 'Matemática',
    date: '10 Mar, 2026',
    likes: 342,
    readTime: '15 min'
  }
];

const SUBJECTS = ['Todos', 'Biotecnologia', 'Bioquímica', 'Genética', 'Computação', 'Matemática'];

const Learn: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState('Todos');

  // Filtro Inteligente
  const filteredNotes = useMemo(() => {
    return MOCK_NOTES.filter(note => {
      const matchSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubject = activeSubject === 'Todos' || note.subject === activeSubject;
      return matchSearch && matchSubject;
    });
  }, [searchTerm, activeSubject]);

  // Função para evitar que o clique no "Like" também dispare o redirecionamento do card
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // A lógica de incrementar o Like viria aqui
  };

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
          </div>

          {/* GRID DE RESUMOS */}
          <div className="learn-notes-grid">
            {filteredNotes.length === 0 ? (
              <div className="learn-empty-state">
                <BookOpen size={48} />
                <h3>Nenhum resumo encontrado</h3>
                <p>Tente ajustar os filtros ou pesquisar por outro termo.</p>
              </div>
            ) : (
              filteredNotes.map(note => (
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
                    <div className="note-author-info">
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