import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Compass, BookOpen, Users, ArrowRight, Loader2 } from 'lucide-react';
import { searchService, type SearchResult } from '../../../../src/services/searchService';
import './styles.css';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      const data = await searchService.globalSearch(query);
      setResults(data);
      setLoading(false);
    };
    
    fetchResults();
  }, [query]);

  // Filtra de acordo com a tab
  const filteredResults = results.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'articles' && r.type === 'article') return true;
    if (activeTab === 'projects' && r.type === 'project') return true;
    if (activeTab === 'people' && r.type === 'user') return true;
    return false;
  }); 

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
      
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={40} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p>Buscando na base Omni...</p>
        </div>
      ) : filteredResults.length === 0 ? (
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
                <Link to="/article/fitorremediacao" className="suggestion-link-btn" style={{ textDecoration: 'none' }}>Acessar <ArrowRight size={16} /></Link>
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
                <Link to="/lab/acqua" className="suggestion-link-btn" style={{ textDecoration: 'none' }}>Acessar <ArrowRight size={16} /></Link>
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
                <Link to="/discussion/pfuzzy-bio" className="suggestion-link-btn" style={{ textDecoration: 'none' }}>Acessar <ArrowRight size={16} /></Link>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="search-results-list" style={{ padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredResults.map(res => (
            <Link key={res.id + res.type} to={res.url} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#6c5ce7'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                {res.image ? (
                  <img src={res.image} alt={res.title} style={{ width: '64px', height: '64px', borderRadius: res.type === 'user' ? '50%' : '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: res.type === 'user' ? '50%' : '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    {res.type === 'user' ? <Users size={32} /> : <BookOpen size={32} />}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6c5ce7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {res.type === 'user' ? 'Pesquisador' : res.type === 'article' ? 'Publicação' : 'Projeto'}
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '1.2rem', color: '#1e293b' }}>{res.title}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{res.subtitle}</p>
                </div>
                <ArrowRight size={20} color="#94a3b8" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
