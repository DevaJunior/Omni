import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../menus/Footer';
import { 
  Search, ChevronDown, LockOpen, Lock, 
  ChevronLeft, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import { bookmarkService } from '../../../../src/services/bookmarkService';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useToastStore } from '../../../../src/stores/toastStore';
import type { Article } from '../../../../src/types/community';
import CardArticleResult from '../../../../renders/components/Cards/CardArticleResult';
import './styles.css';

const Articles: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToastStore();
  
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Relevância');
  
  const [accessFilters, setAccessFilters] = useState({ openAccess: true, restricted: false });
  const [pubFilters, setPubFilters] = useState({ original: true, review: false, preprint: false, book: false });
  const [discFilters, setDiscFilters] = useState({ biology: true, genetics: false, bioinformatics: false, pharmacology: false });
  const [yearFilter, setYearFilter] = useState('Qualquer ano');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await communityService.getArticlesPaginated(50);
        // Mocking some extra fields for the UI based on the design
        const enhancedData = response.data.map((art: any, index: number) => ({
          ...art,
          citations: art.impactFactor ? Math.floor(art.impactFactor * 10) : Math.floor(Math.random() * 50),
          reads: art.likes ? art.likes * 25 : Math.floor(Math.random() * 1000) + 100,
          pubType: index % 3 === 0 ? 'Revisão Literária' : (index % 4 === 0 ? 'Preprint' : 'Artigo Original'),
          accessType: index % 5 === 0 ? 'restricted' : 'open'
        }));
        setArticlesList(enhancedData as any);
      } catch (error) {
        console.error("Erro ao carregar artigos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (currentUser) {
      bookmarkService.getUserBookmarks(currentUser.uid).then(bookmarks => {
        const savedIds = new Set(bookmarks.map(b => b.targetId));
        setSavedArticles(savedIds);
      }).catch(err => console.error("Erro ao carregar bookmarks:", err));
    } else {
      setSavedArticles(new Set());
    }
  }, [currentUser]);

  const handleToggleBookmark = async (e: React.MouseEvent, article: any) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Você precisa estar logado para salvar itens.', 'warning');
      return;
    }
    try {
      const isNowSaved = await bookmarkService.toggleBookmark(
        currentUser.uid,
        article.id,
        'article',
        article.title
      );
      
      setSavedArticles(prev => {
        const newSet = new Set(prev);
        if (isNowSaved) {
          newSet.add(article.id);
        } else {
          newSet.delete(article.id);
        }
        return newSet;
      });

      if (isNowSaved) {
        addToast('Artigo salvo nas suas Coleções!', 'success');
      } else {
        addToast('Artigo removido das Coleções.', 'info');
      }
    } catch (error) {
      addToast('Erro ao salvar artigo.', 'error');
    }
  };

  const handleViewArticle = (id: string | number) => {
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/article/${id}`);
  };

  // Mock Pagination logic
  const totalResults = articlesList.length > 0 ? articlesList.length : 4592;
  
  return (
    <div className="articles-page-wrapper">
      
      {/* HERO SECTION */}
      <section className="articles-hero">
        <h1>Pesquise literatura científica</h1>
        <p>Acesse mais de 50.000 artigos revisados por pares, preprints, capítulos de livros e datasets em diversas áreas do conhecimento.</p>
        
        <div className="articles-search-bar">
          <div className="search-dropdown">
            Todos os campos <ChevronDown size={16} />
          </div>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon-input" />
            <input 
              type="text" 
              placeholder="Ex: CRISPR-Cas9, Machine Learning, Devair Junior..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="search-btn-primary">Buscar</button>
        </div>

        <div className="articles-popular-searches">
          <span className="popular-label">Buscas populares:</span>
          <span className="popular-tag">Inteligência Artificial</span>
          <span className="popular-tag">Oncologia</span>
          <span className="popular-tag">Mudanças Climáticas</span>
        </div>
      </section>

      {/* MAIN LAYOUT (GRID) */}
      <main className="articles-main-grid">
        
        {/* SIDEBAR FILTERS */}
        <aside className="articles-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title"><SlidersHorizontal size={18} /> Filtros</div>
            <button className="btn-clear-filters">Limpar</button>
          </div>

          <div className="filter-group">
            <h4>TIPO DE ACESSO</h4>
            <label className="checkbox-label">
              <input type="checkbox" checked={accessFilters.openAccess} onChange={(e) => setAccessFilters({...accessFilters, openAccess: e.target.checked})} />
              <span className="checkbox-custom"></span>
              <LockOpen size={14} className="filter-icon-inline green-icon" /> Acesso Aberto (OA)
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={accessFilters.restricted} onChange={(e) => setAccessFilters({...accessFilters, restricted: e.target.checked})} />
              <span className="checkbox-custom"></span>
              <Lock size={14} className="filter-icon-inline gray-icon" /> Acesso Restrito
            </label>
          </div>

          <div className="filter-group">
            <h4>TIPO DE PUBLICAÇÃO</h4>
            <label className="checkbox-label">
              <input type="checkbox" checked={pubFilters.original} onChange={(e) => setPubFilters({...pubFilters, original: e.target.checked})} />
              <span className="checkbox-custom"></span>
              Artigo Original
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={pubFilters.review} onChange={(e) => setPubFilters({...pubFilters, review: e.target.checked})} />
              <span className="checkbox-custom"></span>
              Revisão Literária
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={pubFilters.preprint} onChange={(e) => setPubFilters({...pubFilters, preprint: e.target.checked})} />
              <span className="checkbox-custom"></span>
              Preprint
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={pubFilters.book} onChange={(e) => setPubFilters({...pubFilters, book: e.target.checked})} />
              <span className="checkbox-custom"></span>
              Capítulo de Livro
            </label>
          </div>

          <div className="filter-group">
            <h4>DISCIPLINA</h4>
            <div className="discipline-search">
              <Search size={14} className="discipline-icon" />
              <input type="text" placeholder="Filtrar disciplina..." />
            </div>
            <div className="discipline-list">
              <label className="checkbox-label space-between">
                <div>
                  <input type="checkbox" checked={discFilters.biology} onChange={(e) => setDiscFilters({...discFilters, biology: e.target.checked})} />
                  <span className="checkbox-custom"></span>
                  Biologia Molecular
                </div>
                <span className="filter-count">1.2k</span>
              </label>
              <label className="checkbox-label space-between">
                <div>
                  <input type="checkbox" checked={discFilters.genetics} onChange={(e) => setDiscFilters({...discFilters, genetics: e.target.checked})} />
                  <span className="checkbox-custom"></span>
                  Genética
                </div>
                <span className="filter-count">845</span>
              </label>
              <label className="checkbox-label space-between">
                <div>
                  <input type="checkbox" checked={discFilters.bioinformatics} onChange={(e) => setDiscFilters({...discFilters, bioinformatics: e.target.checked})} />
                  <span className="checkbox-custom"></span>
                  Bioinformática
                </div>
                <span className="filter-count">620</span>
              </label>
              <label className="checkbox-label space-between">
                <div>
                  <input type="checkbox" checked={discFilters.pharmacology} onChange={(e) => setDiscFilters({...discFilters, pharmacology: e.target.checked})} />
                  <span className="checkbox-custom"></span>
                  Farmacologia
                </div>
                <span className="filter-count">412</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h4>ANO DE PUBLICAÇÃO</h4>
            <label className="radio-label">
              <input type="radio" name="year" checked={yearFilter === 'Qualquer ano'} onChange={() => setYearFilter('Qualquer ano')} />
              <span className="radio-custom"></span>
              Qualquer ano
            </label>
            <label className="radio-label">
              <input type="radio" name="year" checked={yearFilter === '2026'} onChange={() => setYearFilter('2026')} />
              <span className="radio-custom"></span>
              2026
            </label>
            <label className="radio-label">
              <input type="radio" name="year" checked={yearFilter === '2025'} onChange={() => setYearFilter('2025')} />
              <span className="radio-custom"></span>
              2025
            </label>
            <label className="radio-label">
              <input type="radio" name="year" checked={yearFilter === 'Ultimos 5 anos'} onChange={() => setYearFilter('Ultimos 5 anos')} />
              <span className="radio-custom"></span>
              Últimos 5 anos
            </label>
          </div>
        </aside>

        {/* RESULTS AREA */}
        <section className="articles-results-section">
          
          <div className="results-header-bar">
            <span className="results-count">Mostrando <strong>1 - 10</strong> de <strong>{totalResults}</strong> resultados</span>
            <div className="results-sort">
              Ordenar por: 
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="Relevância">Relevância</option>
                <option value="Recentes">Mais Recentes</option>
                <option value="Citados">Mais Citados</option>
              </select>
            </div>
          </div>

          <div className="results-list">
            {loading ? (
              <div className="loading-state">Carregando artigos...</div>
            ) : (
              articlesList.slice(0, 10).map((article: any) => (
                <CardArticleResult
                  key={article.id}
                  article={article}
                  isSaved={savedArticles.has(article.id)}
                  onViewArticle={handleViewArticle}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="results-pagination">
            <button className="page-btn"><ChevronLeft size={16} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">45</button>
            <button className="page-btn"><ChevronRight size={16} /></button>
          </div>

        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Articles;
