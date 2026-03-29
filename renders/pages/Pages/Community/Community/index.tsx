import React, { useState } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  Users,
} from 'lucide-react';
import './styles.css';
import ProjectsTab from '../../../../fragments/Community/ProjectsTab';
import ArticlesTab from '../../../../fragments/Community/ArticlesTab';
import FeedTab from '../../../../fragments/Community/FeedTab';
import Footer from '../../../../menus/Footer';

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'feed' | 'articles'>('articles');

  const trendingTopics = [
    "Análise de Dados Complexos",
    "Desenvolvimento de Vacinas",
    "Inteligência Artificial na Saúde",
    "Biorreatores Industriais",
    "Controle de Qualidade"
  ];

  return (
    <>
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
            <span>Phyton Research</span>
            <span>Biogen</span>
            <span>Neurolab</span>
            <span>Genesis Labs</span>
            <span>Acqua Solutions</span>
          </div>
        </header>

        <div className="cmmt-toolbar">
          <div className="cmmt-search-bar">
            <Search size={20} className="cmmt-search-icon" />
            <input type="text" placeholder="Pesquisar publicações, projetos ou pesquisadores..." />
          </div>
          <button className="cmmt-btn-outline-icon">
            <Filter size={20} />
            Filtros
          </button>
        </div>

        <div className="cmmt-layout">
          <main className="cmmt-feed-section">
            <div className="cmmt-tabs">
              <button
                className={`cmmt-tab ${activeTab === 'articles' ? 'cmmt-active' : ''}`}
                onClick={() => setActiveTab('articles')}
              >
                Pesquisas
              </button>
              <button
                className={`cmmt-tab ${activeTab === 'feed' ? 'cmmt-active' : ''}`}
                onClick={() => setActiveTab('feed')}
              >
                Discussões
              </button>
              <button
                className={`cmmt-tab ${activeTab === 'projects' ? 'cmmt-active' : ''}`}
                onClick={() => setActiveTab('projects')}
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