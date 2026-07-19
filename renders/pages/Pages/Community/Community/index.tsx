import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, AlertCircle, X, Microscope } from 'lucide-react';
import './styles.css';
import ProjectsTab from '../../../../fragments/Community/ProjectsTab';
import FeedTab from '../../../../fragments/Community/FeedTab';
import GlobalFeedTab from '../../../../fragments/Community/GlobalFeedTab';
import Footer from '../../../../menus/Footer';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../../../../../src/services/communityService';
import type { LabPartner } from '../../../../../src/types/community';
import { useAuth } from '../../../../../src/contexts/AuthContext';

const Community: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'projects' | 'feed' | 'global_feed'>(
    (sessionStorage.getItem('omni_current_tab') as 'projects' | 'feed' | 'global_feed') || 'global_feed'
  );

  const { currentUser } = useAuth();
  const [randomLabs, setRandomLabs] = useState<LabPartner[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([
    "Carregando..."
  ]);

  useEffect(() => {
    if (currentUser) {
      communityService.getSuggestedUsers(currentUser.uid).then(setSuggestedUsers);
    }
    communityService.getTrendingTopics(5).then(setTrendingTopics);
  }, [currentUser]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const labsData = await communityService.getLabs();
        const shuffled = labsData.sort(() => 0.5 - Math.random());
        setRandomLabs(shuffled.slice(0, 5));
      } catch (err) {
        console.error("Erro ao buscar laboratórios parceiros", err);
      }
    };
    fetchLabs();
  }, []);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('omni_scroll_pos');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
        sessionStorage.removeItem('omni_scroll_pos');
      }, 50);
    }
  }, [activeTab]);

  const handleTabChange = (tab: 'projects' | 'feed' | 'global_feed') => {
    setActiveTab(tab);
    sessionStorage.setItem('omni_current_tab', tab);
  };

  // 2. ESTADOS DO FILTRO E BARRA DE BUSCA INTELIGENTE
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<boolean>(false);

  const handleSearchClick = () => {
    if (!searchFilter) {
      setSearchError(true);
      setToastMessage("Selecione um filtro antes de pesquisar.");
      setTimeout(() => {
        setSearchError(false);
        setToastMessage(null);
      }, 3500);
    }
  };

  const handleFilterSelect = (filter: string) => {
    setSearchFilter(filter);
    setShowFilterMenu(false);
    setSearchError(false);
    setToastMessage(null);
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;
    const success = await communityService.followUser(currentUser.uid, userId);
    if (success) {
      setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
      setToastMessage("Você começou a seguir este pesquisador!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSearchFilter('');
  };

  const renderSuggestedResearchersWidget = (isMobile: boolean) => (
    <div className={`cmmt-sidebar-widget cmmt-pesq ${isMobile ? 'cmmt-mobile-pesq' : 'cmmt-desktop-pesq'}`}>
      <div className="cmmt-widget-header">
        <h2>Sugestões de Rede</h2>
      </div>
      <p className="cmmt-widget-subtitle">Conecte-se com pares da sua área de pesquisa.</p>
      <div className="cmmt-suggested-users">
        {suggestedUsers.length > 0 ? (
          suggestedUsers.map(user => (
            <div
              key={user.id}
              className="cmmt-user-item"
              onClick={() => navigate(`/profile/${user.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} className="cmmt-user-avatar-img" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="cmmt-user-avatar-placeholder">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
              )}
              <div className="cmmt-user-details">
                <h5>{user.name || 'Usuário Sem Nome'}</h5>
                <span>{user.headline ? user.headline.split('|')[0] : ''}</span>
              </div>
              <button
                className="cmmt-btn-follow"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(user.id);
                }}
              >
                Seguir
              </button>
            </div>
          ))
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Você já segue todos ou a rede está pequena.</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="cmmt-toast-notification">
          <AlertCircle size={20} />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}><X size={16} /></button>
        </div>
      )}

      <div className="cmmt-container">
        <header className="cmmt-header">
          <div className="cmmt-brand">
            <h1>Omni</h1>
            <span>PLATAFORMA INTEGRADA DE PESQUISA</span>
          </div>

          <h2 className="cmmt-promo-text">
            A Omni acredita que a pesquisa deve ser fluida e acessível, capacitando os cientistas a atingir resultados inovadores com maior eficiência.
          </h2>

          <div className="cmmt-partners-list">
            {randomLabs.map(lab => (
              <span
                key={lab.id}
                className="cmmt-partner-link"
                onClick={() => navigate(`/lab/${lab.id}`)}
              >
                {lab.name}
              </span>
            ))}
          </div>
        </header>

        <div className="cmmt-toolbar">
          <div className={`cmmt-search-bar ${searchError ? 'cmmt-search-error' : ''}`}>
            <Search size={20} className="cmmt-search-icon" />
            <input
              type="text"
              placeholder={searchFilter ? `Pesquisar em ${searchFilter}...` : "Pesquisar publicações, projetos ou pesquisadores..."}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClick={handleSearchClick}
              disabled={!searchFilter}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className={`cmmt-btn-outline-icon ${searchFilter ? 'cmmt-filter-active-btn' : ''}`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter size={18} />
              {searchFilter}
            </button>

            {/* Menu Dropdown do Filtro */}
            {showFilterMenu && (
              <div className="cmmt-filter-dropdown-menu">
                <button onClick={() => handleFilterSelect('Todos')}>Todos</button>
                <button onClick={() => handleFilterSelect('Discussões')}>Discussões</button>
                <button onClick={() => handleFilterSelect('Projetos')}>Projetos</button>
                <button onClick={() => handleFilterSelect('Laboratórios')}>Laboratórios</button>
              </div>
            )}
          </div>
        </div>

        <div className="cmmt-layout">
          <main className="cmmt-feed-section">
            <div className="cmmt-tabs">
              <button
                className={`cmmt-tab ${activeTab === 'global_feed' ? 'cmmt-active' : ''}`}
                onClick={() => handleTabChange('global_feed')}
              >
                Início
              </button>
              <button
                className={`cmmt-tab ${activeTab === 'feed' ? 'cmmt-active' : ''}`}
                onClick={() => handleTabChange('feed')}
                style={{ marginLeft: 'auto' }}
              >
                Discussões
              </button>
              <button
                className={`cmmt-tab ${activeTab === 'projects' ? 'cmmt-active' : ''}`}
                onClick={() => handleTabChange('projects')}
              >
                Projetos e Oportunidades
              </button>
            </div>

            {activeTab === 'global_feed' && <GlobalFeedTab searchQuery={searchValue} onClear={handleClearSearch} suggestedResearchersWidget={renderSuggestedResearchersWidget(true)} />}
            {activeTab === 'projects' && <ProjectsTab searchQuery={searchValue} onClear={handleClearSearch} />}
            {activeTab === 'feed' && <FeedTab searchQuery={searchValue} onClear={handleClearSearch} />}

          </main>

          <aside className="cmmt-sidebar">
            <div className="cmmt-sidebar-widget cmmt_display-none">
              <div className="cmmt-widget-header">
                <TrendingUp size={20} className="cmmt-widget-icon" />
                <h2>Tópicos em Alta</h2>
              </div>
              <ul className="cmmt-trending-list">
                {trendingTopics.map((topic, index) => (
                  <li key={index}>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setSearchFilter('Todos');
                      setSearchValue(topic);
                    }}>#{topic}</a>
                  </li>
                ))}
              </ul>
            </div>

            {renderSuggestedResearchersWidget(false)}

            <div className="cmmt-sidebar-widget cmmt_display-none">
              <div className="cmmt-widget-header">
                <Microscope size={20} className="cmmt-widget-icon" />
                <h2>Laboratórios</h2>
              </div>
              <div className="cmmt-suggested-users">
                {randomLabs.length > 0 ? (
                  randomLabs.map(lab => (
                    <div
                      key={lab.id}
                      className="cmmt-user-item"
                      onClick={() => navigate(`/lab/${lab.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="cmmt-user-avatar-placeholder">
                        {lab.name ? lab.name.substring(0, 2).toUpperCase() : 'LB'}
                      </div>
                      <div className="cmmt-user-details">
                        <h5>{lab.name || 'Laboratório Sem Nome'}</h5>
                      </div>
                      <button
                        className="cmmt-btn-follow"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lab/${lab.id}`);
                        }}
                      >
                        Ver
                      </button>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhum laboratório disponível.</span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Community;