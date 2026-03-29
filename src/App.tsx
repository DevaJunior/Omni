import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './values/tokens.css';
import Navbar from './../renders/menus/Navbar/index';
import Home from './..//renders/pages/Pages/Home';
import Community from './../renders/pages/Pages/Community/Community';
import ArticleDetail from './../renders/pages/Pages/Community/ArticleDetail/index';

// Placeholder para as outras páginas que desenvolveremos
const Lab = () => <div style={{ padding: '100px' }}>Área de Ferramentas Laboratoriais</div>;
const PFuzzy = () => <div style={{ padding: '100px' }}>Módulo de Rizofiltração P-Fuzzy</div>;

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/p-fuzzy" element={<PFuzzy />} />
          <Route path="/community" element={<Community />} />
          <Route path="/results" element={<div>Resultados de Pesquisa</div>} />

          <Route path="/article/:id" element={<ArticleDetail />} />

        </Routes>
      </main>
      {/* O Footer será implementado na sequência */}
    </Router>
  );
};

export default App;