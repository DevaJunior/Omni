import React from 'react';
import { ArrowRight, Beaker, Users, Database, BookOpen } from 'lucide-react';
import './styles.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <span className="badge">OMNI | PLATAFORMA INTEGRADA DE PESQUISA</span>
          <h1>Simplifique a pesquisa. <br /><span>Otimize a ciência.</span></h1>
          <p>
            A Omni é sua suíte completa de ferramentas para análise de dados, 
            colaboração e gerenciamento de experimentos, construída para especialistas e pesquisadores.
          </p>
          <button className="cta-button">
            COMEÇAR ANÁLISE <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-visual">
          <div className="gradient-sphere"></div>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <Database className="icon" />
          <h3>Análise P-Fuzzy</h3>
          <p>Ferramentas avançadas para análise de dados laboratoriais de rizofiltração.</p>
        </div>
        <div className="feature-card">
          <Users className="icon" />
          <h3>Comunidade</h3>
          <p>Conecte-se com outros pesquisadores e compartilhe descobertas.</p>
        </div>
        <div className="feature-card">
          <Beaker className="icon" />
          <h3>Lab Tools</h3>
          <p>Calculadoras científicas e geradores de modelos de dados.</p>
        </div>
        <div className="feature-card">
          <BookOpen className="icon" />
          <h3>Biblioteca</h3>
          <p>Acesso curado a artigos e atualizações científicas.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;