import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import type { Article } from '../../../../src/types/community';
import './styles.css';

import img1 from '../../../../src/assets/wallapapers/wpp_cience_000.png';
import img2 from '../../../../src/assets/wallapapers/wpp_cience_001.png';

type SortOption = 'recent' | 'impact' | 'likes';

const ArticlesTab: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const navigate = useNavigate();

  const featuredArticles = [
    {
      id: "901",
      title: "Inovações em biotecnologia: da bancada ao mercado",
      desc: "Explorando as tendências mais promissoras em biotecnologia e como elas estão sendo traduzidas em práticas de pesquisas de laboratório para aplicações práticas.",
      image: img1,
      category: "Biotecnologia"
    },
    {
      id: "902",
      title: "Medicina personalizada: Otimizando tratamentos",
      desc: "Saiba como a medicina personalizada está utilizando dados genéticos e moleculares para criar tratamentos sob medida para pacientes.",
      image: img2,
      category: "Medicina"
    }
  ];

  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await communityService.getArticles();
        setArticlesList(data);
      } catch (error) {
        console.error("Erro ao carregar artigos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const sortedArticles = [...articlesList].sort((a, b) => {
    if (sortBy === 'impact') return b.impactFactor - a.impactFactor;
    if (sortBy === 'likes') return b.likes - a.likes;
    return b.id.localeCompare(a.id);
  });

  const handleViewArticle = (id: string | number) => {
    // 3. Salva a posição exata da tela antes de navegar
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/article/${id}`);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Artigos...</div>;

  return (
    <div className="cmmt-articles-wrapper">

      <section className="cmmt-featured-section">
        <div className="cmmt-section-header">
          <h3>Publicações em Destaque</h3>
          <div className="cmmt-pagination-controls">
            <button className="cmmt-pag-btn"><ChevronLeft size={18} /></button>
            <button className="cmmt-pag-btn cmmt-pag-active"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="cmmt-featured-grid">
          {featuredArticles.map((article) => (
            <article key={article.id} className="cmmt-visual-card">
              <div className="cmmt-visual-image">
                <img src={article.image} alt={article.title} />
                <span className="cmmt-visual-badge">{article.category}</span>
              </div>
              <div className="cmmt-visual-info">
                <h4>{article.title}</h4>
                <p>{article.desc}</p>
                <button
                  className="cmmt-btn-read-more"
                  onClick={() => handleViewArticle(article.id)}
                >
                  Leia mais &rarr;
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <hr className="cmmt-divider" />

      <section className="cmmt-technical-list-section">
        <div className="cmmt-list-controls">
          <h3>Acervo de Pesquisas</h3>

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
                <span className="cmmt-article-type"><BookOpen size={16} /> Publicação Científica</span>
                {article.isFree ? (
                  <span className="cmmt-article-status-open">Open Access</span>
                ) : (
                  <span className="cmmt-article-status-closed">Paywall</span>
                )}
              </div>

              <h3 className="cmmt-article-title">{article.title}</h3>

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

              <div className="cmmt-article-footer">
                <div className="cmmt-article-tags">
                  {article.tags.map((tag: any) => (
                    <span key={tag} className="cmmt-article-tag-item">{tag}</span>
                  ))}
                </div>
                <div className="cmmt-article-actions">
                  <span className="cmmt-doi">DOI: {article.doi}</span>
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
      </section>

    </div>
  );
};

export default ArticlesTab;