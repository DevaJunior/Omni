import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import { useAuth } from '../../../../src/contexts/AuthContext';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import ConfirmModal from '../../../../renders/components/ConfirmModal';
import { useCommunityStore } from '../../../../src/store/useCommunityStore';
import CardDiscussion from '../../../../renders/components/Cards/CardDiscussion';
import CardResearch from '../../../../renders/components/Cards/CardResearch';
import CardProjectOportunity from '../../../../renders/components/Cards/CardProjectOportunity';
import CardArticle from '../../../../renders/components/Cards/CardArticle';
import '../ArticlesTab/styles.css';
import '../FeedTab/styles.css';

// Modal simples de edição inline
const EditDiscussionModal: React.FC<{
  isOpen: boolean;
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}> = ({ isOpen, content, onSave, onCancel }) => {
  const [editText, setEditText] = useState(content);
  useEffect(() => { setEditText(content); }, [content]);
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '540px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Editar Discussão</h3>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'inherit', resize: 'vertical', fontSize: '0.95rem' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
          <button onClick={() => onSave(editText)} style={{ padding: '8px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
        </div>
      </div>
    </div>
  );
};

import img1 from '../../../../src/assets/wallapapers/wpp_cience_000.png';
import img2 from '../../../../src/assets/wallapapers/wpp_cience_001.png';

interface GlobalFeedTabProps {
  searchQuery?: string;
  onClear?: () => void;
  suggestedResearchersWidget?: React.ReactNode;
}

const GlobalFeedTab: React.FC<GlobalFeedTabProps> = ({ searchQuery = '', onClear, suggestedResearchersWidget }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { globalFeed, setGlobalFeed, appendGlobalFeed } = useCommunityStore();
  const observer = useRef<IntersectionObserver | null>(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const [editModal, setEditModal] = useState({ isOpen: false, id: '', content: '' });

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

  const handleLikeDiscussion = async (id: string) => {
    if (!currentUser) return;
    try {
      await communityService.voteDiscussion(id, currentUser.uid);
      await fetchGlobalFeed(); // refresh
    } catch (e) {
      console.error('Erro ao curtir', e);
    }
  };

  const handleDeleteDiscussion = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Discussão',
      message: 'Deseja realmente excluir esta publicação?',
      onConfirm: async () => {
        try {
          await communityService.deleteDiscussion(id);
          const newData = globalFeed.data.filter((p: any) => p.id !== id);
          setGlobalFeed(newData, globalFeed.lastDoc, globalFeed.hasMore);
        } catch (e) {
          console.error('Erro ao excluir', e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleEditDiscussion = (id: string) => {
    const post = globalFeed.data.find((p: any) => p.id === id);
    if (post) {
      setEditModal({ isOpen: true, id, content: (post as any).content || '' });
    }
  };

  const handleSaveEditDiscussion = async (newContent: string) => {
    if (!editModal.id || !newContent.trim()) return;
    try {
      await communityService.updateDiscussion(editModal.id, newContent.trim());
      const newData = globalFeed.data.map((p: any) =>
        p.id === editModal.id ? { ...p, content: newContent.trim() } : p
      );
      setGlobalFeed(newData, globalFeed.lastDoc, globalFeed.hasMore);
    } catch (e) {
      console.error('Erro ao editar', e);
    } finally {
      setEditModal({ isOpen: false, id: '', content: '' });
    }
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
          currentUserUid={currentUser?.uid}
          onOpenThread={handleOpenThread}
          onLike={handleLikeDiscussion}
          onDelete={handleDeleteDiscussion}
          onEdit={handleEditDiscussion}
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
                <CardResearch
                  key={article.id}
                  article={article}
                  onReadMore={handleViewArticle}
                />
              ))}
            </div>
          </section>

        </>
      )}

      {suggestedResearchersWidget}

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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
      <EditDiscussionModal
        isOpen={editModal.isOpen}
        content={editModal.content}
        onSave={handleSaveEditDiscussion}
        onCancel={() => setEditModal({ isOpen: false, id: '', content: '' })}
      />
    </div>
  );
};

export default GlobalFeedTab;
