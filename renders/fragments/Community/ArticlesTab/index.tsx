import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, Download, ExternalLink, Bookmark, MessageSquare, Eye } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import { useCommunityStore } from '../../../../src/store/useCommunityStore';
import './styles.css';

type SortOption = 'recent' | 'impact' | 'likes';

interface ArticlesTabProps {
  searchQuery?: string;
  onClear?: () => void;
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({ searchQuery = '', onClear }) => {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const navigate = useNavigate();

  const { articles, setArticles, appendArticles } = useCommunityStore();
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchArticles = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);

    try {
      const response = await communityService.getArticlesPaginated(6, isLoadMore ? articles.lastDoc : null);
      if (isLoadMore) {
        appendArticles(response.data, response.lastDoc, response.data.length === 6 && response.lastDoc !== null);
      } else {
        setArticles(response.data, response.lastDoc, response.data.length === 6 && response.lastDoc !== null);
      }
    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!articles.isLoaded) {
      fetchArticles();
    }
  }, [articles.isLoaded]);

  const getSearchScore = (article: any) => {
    if (!searchQuery) return 1;
    const q = searchQuery.toLowerCase();
    let score = 0;
    if (article.title.toLowerCase().includes(q)) score += 10;
    if (article.abstract.toLowerCase().includes(q)) score += 5;
    if (article.tags.some((tag: string) => tag.toLowerCase().includes(q))) score += 1;
    return score;
  };

  const sortedArticles = [...articles.data]
    .map(a => ({ ...a, _searchScore: getSearchScore(a) }))
    .filter(a => a._searchScore > 0)
    .sort((a, b) => {
      if (searchQuery) return b._searchScore - a._searchScore;
      if (sortBy === 'impact') return b.impactFactor - a.impactFactor;
      if (sortBy === 'likes') return b.likes - a.likes;
      return b.id.localeCompare(a.id);
    });

  const handleViewArticle = (id: string | number) => {
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/article/${id}`);
  };

  if (!articles.isLoaded && articles.data.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Artigos...</div>;

  if (sortedArticles.length === 0 && searchQuery !== '') {
    return (
      <EmptyStateSearch
        searchQuery={searchQuery}
        onClear={onClear || (() => { })}
        showTabSuggestion={true}
        suggestions={['Lógica P-Fuzzy', 'Rizofiltração', 'Vacinas', 'Modelagem']}
      />
    );
  }

  return (
    <div className="cmmt-articles-wrapper">

      <section className="cmmt-technical-list-section">
        <div className="cmmt-list-controls">
          <h3
            onClick={() => navigate('/articles')}
            style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
            title="Acessar Acervo de Artigos"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
          >
            Artigos
          </h3>

          <div className="cmmt-filter-tabs-container">
            <div className="cmmt-filter-tabs">
              <button
                className={`cmmt-filter-tab ${sortBy === 'recent' ? 'cmmt-filter-active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                Mais Recentes
              </button>
              <button
                className={`cmmt-filter-tab ${sortBy === 'impact' ? 'cmmt-filter-active' : ''}`}
                onClick={() => setSortBy('impact')}
              >
                Fator de Impacto
              </button>
              <button
                className={`cmmt-filter-tab ${sortBy === 'likes' ? 'cmmt-filter-active' : ''}`}
                onClick={() => setSortBy('likes')}
              >
                Mais Curtidos
              </button>
            </div>
          </div>
        </div>

        <div className="cmmt-articles-list">
          {sortedArticles.map(article => (
            <article key={article.id} className="cmmt-article-card">
              <div className="cmmt-article-header-top">
                <span
                  className="cmmt-article-type"
                  onClick={() => navigate('/learn')}
                  style={{ cursor: 'pointer' }}
                  title="Ir para trilhas de aprendizado"
                >
                  <BookOpen size={16} /> Publicação Científica
                </span>
                <div className="cmmt-article-status-container">
                  {article.isFree ? (
                    <span className="cmmt-article-status-open">Open Access</span>
                  ) : (
                    <span className="cmmt-article-status-closed">Paywall</span>
                  )}
                  <Bookmark size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                </div>
              </div>

              <h3
                className="cmmt-article-title"
                onClick={() => handleViewArticle(article.id)}
                style={{ cursor: 'pointer' }}
                title="Ler artigo"
              >
                {article.title}
              </h3>

              <div className="cmmt-article-meta">
                <span><Users size={16} /> {article.authors}</span>
              </div>

              <div className="cmmt-article-meta cmmt-article-source">
                <span><strong>{article.journal}</strong></span>
                <span><Calendar size={16} /> {article.date}</span>
                <span className="cmmt-meta-impact">FI: {article.impactFactor}</span>
              </div>

              <div className="cmmt-article-abstract">
                <strong>Resumo: </strong>{article.abstract}
              </div>

              <div className="cmmt-article-stats-row">
                <div className="cmmt-article-stats-left">
                  <span><MessageSquare size={16} /> 35 Citações</span>
                  <span><Eye size={16} /> 1.0k Leituras</span>
                </div>
                <span className="cmmt-doi">DOI: {article.doi}</span>
              </div>

              <div className="cmmt-article-footer">
                <div className="cmmt-article-tags">
                  {article.tags.map((tag: any) => (
                    <span key={tag} className="cmmt-article-tag-item">{tag}</span>
                  ))}
                </div>
                <div className="cmmt-article-actions">
                  <div className="cmmt-article-btn-group">
                    {article.isFree && (
                      <button className="cmmt-btn-secondary">
                        <Download size={16} /> PDF
                      </button>
                    )}
                    <button
                      className="cmmt-btn-primary-read"
                      onClick={() => handleViewArticle(article.id)}
                    >
                      Ler Artigo <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {articles.hasMore && !searchQuery && (
          <button
            className="btn-primary"
            onClick={() => fetchArticles(true)}
            disabled={loadingMore}
            style={{ width: '100%', padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
          >
            {loadingMore ? 'Carregando...' : 'Carregar Mais Artigos'}
          </button>
        )}
      </section>

    </div>
  );
};

export default ArticlesTab;