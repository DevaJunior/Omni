import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, X } from 'lucide-react';
import './styles.css';
import ProjectsTab from '../../../../fragments/Community/ProjectsTab';
import FeedTab from '../../../../fragments/Community/FeedTab';
import GlobalFeedTab from '../../../../fragments/Community/GlobalFeedTab';
import Footer from '../../../../menus/Footer';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../../../../../src/services/communityService';
import type { LabPartner } from '../../../../../src/types/community';
import NetworkSuggestions from '../../../../components/NetworkSuggestions';
import TrendingTopicsWidget from '../../../../components/TrendingTopicsWidget';
import LabsWidget from '../../../../components/LabsWidget';

const Community: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'projects' | 'feed' | 'global_feed'>(
    (sessionStorage.getItem('omni_current_tab') as 'projects' | 'feed' | 'global_feed') || 'global_feed'
  );


  const [randomLabs, setRandomLabs] = useState<LabPartner[]>([]);


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

  const handleFollowSuccess = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSearchFilter('');
  };

  // renderSuggestedResearchersWidget extracted to NetworkSuggestions component

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

            {activeTab === 'global_feed' && <GlobalFeedTab searchQuery={searchValue} onClear={handleClearSearch} suggestedResearchersWidget={<NetworkSuggestions isMobile={true} onFollowSuccess={handleFollowSuccess} />} />}
            {activeTab === 'projects' && <ProjectsTab searchQuery={searchValue} onClear={handleClearSearch} />}
            {activeTab === 'feed' && <FeedTab searchQuery={searchValue} onClear={handleClearSearch} />}

          </main>

          <aside className="cmmt-sidebar">
            <TrendingTopicsWidget 
              onTopicClick={(topic) => {
                setSearchFilter('Todos');
                setSearchValue(topic);
              }} 
            />

            <NetworkSuggestions isMobile={false} onFollowSuccess={handleFollowSuccess} />

            <LabsWidget labs={randomLabs} />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Community;