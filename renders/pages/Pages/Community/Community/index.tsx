import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Users, AlertCircle, X } from 'lucide-react';
import './styles.css';
import ProjectsTab from '../../../../fragments/Community/ProjectsTab';
import ArticlesTab from '../../../../fragments/Community/ArticlesTab';
import FeedTab from '../../../../fragments/Community/FeedTab';
import Footer from '../../../../menus/Footer';
import { useNavigate } from 'react-router-dom';

// MOCK DE LABORATÓRIOS (Para o header)
const ALL_LABS = [
  { id: '1', name: "Phyton Research" },
  { id: '2', name: "Biogen" },
  { id: '3', name: "Neurolab" },
  { id: '4', name: "Genesis Labs" },
  { id: '5', name: "Acqua Solutions" },
  { id: '6', name: "AgroTech Labs" },
  { id: '7', name: "NanoBio Corp" },
  { id: '8', name: "EcoSys Research" },
];

const Community: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'projects' | 'feed' | 'articles'>(
    (sessionStorage.getItem('omni_current_tab') as 'projects' | 'feed' | 'articles') || 'articles'
  );

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('omni_scroll_pos');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
        sessionStorage.removeItem('omni_scroll_pos');
      }, 50);
    }
  }, [activeTab]);

  const handleTabChange = (tab: 'projects' | 'feed' | 'articles') => {
    setActiveTab(tab);
    sessionStorage.setItem('omni_current_tab', tab);
  };

  // 1. LÓGICA DE PARCEIROS ALEATÓRIOS (Lazy Initializer)
  // Passamos uma função para o useState. O React roda isso apenas UMA VEZ na montagem.
  // Fica 100% puro, não gera renders em cascata e o linter fica feliz!
  const [randomLabs] = useState(() => {
    const shuffled = [...ALL_LABS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  });

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

  const trendingTopics = [
    "Análise de Dados Complexos",
    "Desenvolvimento de Vacinas",
    "Inteligência Artificial na Saúde",
    "Biorreatores Industriais",
    "Controle de Qualidade"
  ];

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
              <Filter size={20} />
              {searchFilter || "FILTRO"}
            </button>

            {/* Menu Dropdown do Filtro */}
            {showFilterMenu && (
              <div className="cmmt-filter-dropdown-menu">
                <button onClick={() => handleFilterSelect('')}>Limpar Filtro</button>
                <button onClick={() => handleFilterSelect('Pesquisas')}>Pesquisas</button>
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
                className={`cmmt-tab ${activeTab === 'articles' ? 'cmmt-active' : ''}`}
                onClick={() => handleTabChange('articles')}
              >
                Pesquisas
              </button>
              <button
                className={`cmmt-tab ${activeTab === 'feed' ? 'cmmt-active' : ''}`}
                onClick={() => handleTabChange('feed')}
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

            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'articles' && <ArticlesTab />}
            {activeTab === 'feed' && <FeedTab />}

          </main>

          <aside className="cmmt-sidebar">
            <div className="cmmt-sidebar-widget">
              <div className="cmmt-widget-header">
                <TrendingUp size={20} className="cmmt-widget-icon" />
                <h3>Tópicos em Alta</h3>
              </div>
              <ul className="cmmt-trending-list">
                {trendingTopics.map((topic, index) => (
                  <li key={index}><a href={`#${topic}`}>{topic}</a></li>
                ))}
              </ul>
            </div>

            <div className="cmmt-sidebar-widget">
              <div className="cmmt-widget-header">
                <Users size={20} className="cmmt-widget-icon" />
                <h3>Pesquisadores Sugeridos</h3>
              </div>
              <div className="cmmt-suggested-users">
                <div className="cmmt-user-item">
                  <div className="cmmt-user-avatar-placeholder">AC</div>
                  <div className="cmmt-user-details">
                    <h5>Ana Costa</h5>
                    <span>Bioquímica</span>
                  </div>
                  <button className="cmmt-btn-follow">Seguir</button>
                </div>
                <div className="cmmt-user-item">
                  <div className="cmmt-user-avatar-placeholder">RM</div>
                  <div className="cmmt-user-details">
                    <h5>Rafael Mendes</h5>
                    <span>Química Analítica</span>
                  </div>
                  <button className="cmmt-btn-follow">Seguir</button>
                </div>
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