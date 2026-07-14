import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Users, Briefcase, Clock, Calendar, Download, ExternalLink, Bookmark, MessageSquare, Eye } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import { useCommunityStore } from '../../../../src/store/useCommunityStore';
import '../ArticlesTab/styles.css'; 
import '../FeedTab/styles.css'; 

import img1 from '../../../../src/assets/wallapapers/wpp_cience_000.png';
import img2 from '../../../../src/assets/wallapapers/wpp_cience_001.png';

interface GlobalFeedTabProps {
  searchQuery?: string;
  onClear?: () => void;
}

const GlobalFeedTab: React.FC<GlobalFeedTabProps> = ({ searchQuery = '', onClear }) => {
  const navigate = useNavigate();
  const { globalFeed, setGlobalFeed, appendGlobalFeed } = useCommunityStore();
  const observer = useRef<IntersectionObserver | null>(null);

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

  const fetchGlobalFeed = async (isLoadMore = false) => {
    try {
      const response = await communityService.getGlobalFeedPaginated(15, isLoadMore ? globalFeed.lastDoc : null);
      if (isLoadMore) {
        appendGlobalFeed(response.data, response.cursors, response.hasMore);
      } else {
        setGlobalFeed(response.data, response.cursors, response.hasMore);
      }
    } catch (error) {
      console.error("Erro ao carregar feed global:", error);
    }
  };

  useEffect(() => {
    if (!globalFeed.isLoaded) {
      fetchGlobalFeed();
    }
  }, [globalFeed.isLoaded]);

  const lastElementRef = useCallback((node: any) => {
    if (!globalFeed.isLoaded) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && globalFeed.hasMore) {
        fetchGlobalFeed(true);
      }
    });
    if (node) observer.current.observe(node);
  }, [globalFeed.isLoaded, globalFeed.hasMore, globalFeed.lastDoc]);

  const handleViewArticle = (id: string | number) => {
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/article/${id}`);
  };

  const handleOpenThread = (id: string | number) => {
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/discussion/${id}`);
  };

  const getSearchScore = (post: any) => {
    if (!searchQuery) return 1;
    const q = searchQuery.toLowerCase();
    let score = 0;
    if (post.title?.toLowerCase().includes(q)) score += 10;
    if (post.content?.toLowerCase().includes(q) || post.abstract?.toLowerCase().includes(q) || post.description?.toLowerCase().includes(q)) score += 5;
    if (post.author?.toLowerCase().includes(q) || post.authors?.toLowerCase().includes(q)) score += 3;
    if (post.tags?.some((tag: string) => tag.toLowerCase().includes(q))) score += 1;
    return score;
  };

  const filteredData = globalFeed.data
    .map(p => ({ ...p, _searchScore: getSearchScore(p) }))
    .filter(p => p._searchScore > 0)
    .sort((a, b) => {
      if (searchQuery) return b._searchScore - a._searchScore;
      return b._date - a._date; 
    });

  if (!globalFeed.isLoaded && globalFeed.data.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Feed...</div>;
  }

  const renderCard = (item: any, index: number) => {
    // Para disparar no 12º item de uma lista de 15, usamos length - 4
    // Se a lista tem 15 (indices 0 a 14), 15 - 4 = 11. O índice 11 é o 12º elemento real.
    const isTriggerElement = index === filteredData.length - 4;
    const refProps = isTriggerElement ? { ref: lastElementRef } : {};

    if (item._type === 'article') {
      return (
        <article key={`art-${item.id}`} className="cmmt-article-card" {...refProps}>
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
              {item.isFree ? (
                <span className="cmmt-article-status-open">Open Access</span>
              ) : (
                <span className="cmmt-article-status-closed">Paywall</span>
              )}
              <Bookmark size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </div>
          </div>

          <h3
            className="cmmt-article-title"
            onClick={() => handleViewArticle(item.id)}
            style={{ cursor: 'pointer' }}
            title="Ler artigo"
          >
            {item.title}
          </h3>

          <div className="cmmt-article-meta">
            <span><Users size={16} /> {item.authors}</span>
          </div>

          <div className="cmmt-article-meta cmmt-article-source">
            <span><strong>{item.journal}</strong></span>
            <span><Calendar size={16} /> {item.date}</span>
            <span className="cmmt-meta-impact">FI: {item.impactFactor}</span>
          </div>

          <div className="cmmt-article-abstract">
            <strong>Resumo: </strong>{item.abstract}
          </div>

          <div className="cmmt-article-stats-row">
            <div className="cmmt-article-stats-left">
              <span><MessageSquare size={16} /> 35 Citações</span>
              <span><Eye size={16} /> 1.0k Leituras</span>
            </div>
            <span className="cmmt-doi">DOI: {item.doi}</span>
          </div>

          <div className="cmmt-article-footer">
            <div className="cmmt-article-tags">
              {item.tags?.map((tag: any) => (
                <span key={tag} className="cmmt-article-tag-item">{tag}</span>
              ))}
            </div>
            <div className="cmmt-article-actions">
              <div className="cmmt-article-btn-group">
                {item.isFree && (
                  <button className="cmmt-btn-secondary">
                    <Download size={16} /> PDF
                  </button>
                )}
                <button
                  className="cmmt-btn-primary-read"
                  onClick={() => handleViewArticle(item.id)}
                >
                  Ler Artigo <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        </article>
      );
    }

    if (item._type === 'discussion') {
      return (
        <article key={`disc-${item.id}`} className="cmmt-post-card" {...refProps} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-card)' }}>
          <div className="cmmt-post-header">
            <img src={item.avatar || `https://ui-avatars.com/api/?name=${item.author}`} alt={item.author} className="cmmt-author-avatar" />
            <div className="cmmt-author-info">
              <h4>{item.author}</h4>
              <span>{item.role} • Recente</span>
            </div>
          </div>
          <div className="cmmt-post-body" onClick={() => handleOpenThread(item.id)}>
            <p>{item.content}</p>
            <div className="cmmt-post-tags">
              {item.tags?.map((tag: any) => (
                <span key={tag} className="cmmt-post-tag-item">{tag}</span>
              ))}
            </div>
          </div>
        </article>
      );
    }

    if (item._type === 'project') {
      return (
        <article key={`proj-${item.id}`} className="cmmt-article-card" {...refProps} style={{ borderLeft: '4px solid #10b981' }}>
           <div className="cmmt-article-header-top">
            <span className="cmmt-article-type" style={{ color: '#10b981' }}>
              <Briefcase size={16} /> Oportunidade / Projeto
            </span>
          </div>
          <h3 className="cmmt-article-title">{item.title}</h3>
          <div className="cmmt-article-meta">
            <span><Users size={16} /> {item.author || item.institution}</span>
            <span><Clock size={16} /> Prazo: {item.deadline}</span>
          </div>
          <div className="cmmt-article-abstract">
            {item.description}
          </div>
        </article>
      );
    }

    return null;
  };

  return (
    <div className="cmmt-articles-wrapper">
      {!searchQuery && (
        <>
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
        </>
      )}

      <section className="cmmt-technical-list-section">
        <div className="cmmt-list-controls">
          <h3>Feed Global</h3>
        </div>

        <div className="cmmt-articles-list">
          {filteredData.length === 0 && searchQuery ? (
            <EmptyStateSearch
              searchQuery={searchQuery}
              onClear={onClear || (() => { })}
            />
          ) : (
            filteredData.map((item, index) => renderCard(item, index))
          )}
        </div>
      </section>
    </div>
  );
};

export default GlobalFeedTab;
