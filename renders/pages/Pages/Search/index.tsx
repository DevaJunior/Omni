import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Compass, BookOpen, Users, ArrowRight } from 'lucide-react';
import './styles.css';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('all');

  // Mock temporário para forçar o empty state e mostrar a UI de sugestões pedida.
  const results: any[] = []; 

  return (
    <div className="search-page-container">
      <div className="search-page-header">
        <h1>Resultados da busca para <span>"{query}"</span></h1>
        <div className="search-tabs">
          <button className={`search-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tudo</button>
          <button className={`search-tab ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}>Artigos</button>
          <button className={`search-tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projetos</button>
          <button className={`search-tab ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>Pessoas</button>
        </div>
      </div>
      
      {results.length === 0 ? (
        <div className="empty-search-state">
          <div className="empty-search-hero">
            <div className="empty-search-icon-wrapper">
              <SearchIcon size={56} className="empty-search-icon" />
            </div>
            <h2>Nenhum resultado encontrado para "{query}"</h2>
            <p>Verifique a ortografia, tente palavras mais genéricas ou navegue pelas nossas sugestões em alta.</p>
          </div>
          
          <div className="search-suggestions-section">
            <div className="suggestions-header">
              <h3><Compass size={22} className="compass-icon" /> Tópicos Populares na Omni</h3>
            </div>
            <div className="suggestions-grid">
              
              <div className="suggestion-card">
                <div className="suggestion-card-header">
                  <div className="suggestion-icon-bg purple">
                    <BookOpen size={20} />
                  </div>
                  <span className="suggestion-badge">Artigo em Alta</span>
                </div>
                <h4>Fitorremediação de Efluentes Têxteis</h4>
                <p>Estudo completo sobre uso de macrófitas aquáticas e lógica p-fuzzy no monitoramento de bacias.</p>
                <button className="suggestion-link-btn">Acessar <ArrowRight size={16} /></button>
              </div>

              <div className="suggestion-card">
                <div className="suggestion-card-header">
                  <div className="suggestion-icon-bg blue">
                    <Users size={20} />
                  </div>
                  <span className="suggestion-badge">Laboratório Destaque</span>
                </div>
                <h4>Acqua Solutions Lab</h4>
                <p>Comunidade de pesquisadores desenvolvendo técnicas inovadoras de purificação hídrica e química ambiental.</p>
                <button className="suggestion-link-btn">Acessar <ArrowRight size={16} /></button>
              </div>

              <div className="suggestion-card">
                <div className="suggestion-card-header">
                  <div className="suggestion-icon-bg pink">
                    <BookOpen size={20} />
                  </div>
                  <span className="suggestion-badge">Discussão Relevante</span>
                </div>
                <h4>Lógica P-Fuzzy em Modelos Biológicos</h4>
                <p>Fórum aberto com 45 especialistas debatendo métricas e mitigação de incertezas em biologia computacional.</p>
                <button className="suggestion-link-btn">Acessar <ArrowRight size={16} /></button>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="search-results-list">
          {/* A renderização dos resultados de pesquisa real vai aqui */}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
