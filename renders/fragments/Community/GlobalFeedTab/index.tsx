import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import { useCommunityStore } from '../../../../src/store/useCommunityStore';
import CardDiscussion from '../../../../renders/components/CardDiscussion';
import CardFeaturedArticle from '../../../../renders/components/CardFeaturedArticle';
import CardProjectOportunity from '../../../../renders/components/CardProjectOportunity';
import CardArticle from '../../../../renders/components/CardArticle';
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

    if (item._type === 'article') {
      return (
        <CardArticle
          key={`art-${item.id}`}
          article={item}
          onViewArticle={handleViewArticle}
          forwardedRef={isTriggerElement ? lastElementRef : undefined}
        />
      );
    }

    if (item._type === 'discussion') {
      return (
        <CardDiscussion
          key={`disc-${item.id}`}
          post={item}
          onOpenThread={handleOpenThread}
          style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-card)' }}
          forwardedRef={isTriggerElement ? lastElementRef : undefined}
        />
      );
    }

    if (item._type === 'project') {
      return (
        <CardProjectOportunity
          key={`proj-${item.id}`}
          project={{
            id: item.id,
            type: item.projectType || item.type || 'Projeto',
            status: item.status || 'Aberto',
            title: item.title,
            institution: item.institution || item.author || 'Instituição não informada',
            location: item.location || 'Remoto/Híbrido',
            deadline: item.deadline || 'Não informado',
            description: item.description || item.abstract || '',
            tags: item.tags || [],
            scholarship: item.scholarship
          }}
          onViewProject={() => {
            // Se tiver uma rota para projeto, ex: navigate(`/project/${item.id}`)
          }}
          forwardedRef={isTriggerElement ? lastElementRef : undefined}
        />
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
                <CardFeaturedArticle
                  key={article.id}
                  article={article}
                  onReadMore={handleViewArticle}
                />
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
