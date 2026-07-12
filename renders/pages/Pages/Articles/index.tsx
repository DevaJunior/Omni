import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../menus/Footer';
import { BookOpen, Users, Calendar, ExternalLink, Download } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import type { Article } from '../../../../src/types/community';
import './styles.css';

const Articles: React.FC = () => {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'impact' | 'likes'>('recent');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await communityService.getArticlesPaginated(50);
        setArticlesList(response.data as any);
      } catch (error) {
        console.error("Erro ao carregar artigos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const sortedArticles = useMemo(() => {
    let sorted = [...articlesList];
    if (sortBy === 'recent') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'impact') {
      sorted.sort((a, b) => (b.impactFactor || 0) - (a.impactFactor || 0));
    } else if (sortBy === 'likes') {
      sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return sorted;
  }, [articlesList, sortBy]);

  const handleViewArticle = (id: string | number) => {
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/article/${id}`);
  };

  return (
    <>
      <div className="articles-page-container">
        <header className="articles-page-header">
          <h1>Artigos e Publicações Científicas</h1>
          <p>Explore o acervo completo de artigos da nossa comunidade.</p>
        </header>

        <section className="articles-page-content">
          <div className="articles-controls">
            <h3>Acervo</h3>
            <div className="articles-filter-tabs">
              <button
                className={`articles-filter-tab ${sortBy === 'recent' ? 'active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                Mais Recentes
              </button>
              <button
                className={`articles-filter-tab ${sortBy === 'impact' ? 'active' : ''}`}
                onClick={() => setSortBy('impact')}
              >
                Fator de Impacto
              </button>
              <button
                className={`articles-filter-tab ${sortBy === 'likes' ? 'active' : ''}`}
                onClick={() => setSortBy('likes')}
              >
                Mais Curtidos
              </button>
            </div>
          </div>

          {loading ? (
            <div className="articles-loading">Carregando artigos...</div>
          ) : (
            <div className="articles-grid">
              {sortedArticles.map(article => (
                <article key={article.id} className="articles-card" onClick={() => handleViewArticle(article.id)}>
                  <div className="articles-card-header">
                    <span className="articles-type" onClick={(e) => { e.stopPropagation(); navigate('/learn'); }}>
                      <BookOpen size={16} /> Publicação Científica
                    </span>
                    {article.isFree ? (
                      <span className="articles-status-open">Open Access</span>
                    ) : (
                      <span className="articles-status-closed">Paywall</span>
                    )}
                  </div>

                  <h3 className="articles-title">{article.title}</h3>

                  <div className="articles-meta">
                    <span><Users size={16} /> {article.authors}</span>
                  </div>

                  <div className="articles-meta-source">
                    <span><strong>{article.journal}</strong></span>
                    <span><Calendar size={16} /> {article.date}</span>
                    <span className="articles-impact">FI: {article.impactFactor}</span>
                  </div>

                  <div className="articles-abstract">
                    <strong>Resumo: </strong>{article.abstract.length > 150 ? article.abstract.substring(0, 150) + '...' : article.abstract}
                  </div>

                  <div className="articles-card-footer">
                    <div className="articles-actions">
                      {article.isFree && (
                        <button className="articles-btn-secondary" onClick={(e) => e.stopPropagation()}>
                          <Download size={16} /> PDF
                        </button>
                      )}
                      <button className="articles-btn-primary" onClick={(e) => { e.stopPropagation(); handleViewArticle(article.id); }}>
                        Ler Artigo <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Articles;
