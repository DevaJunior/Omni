import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './values/tokens.css';
import Navbar from './../renders/menus/Navbar';
import Home from './../renders/pages/Pages/Home';
import Community from './../renders/pages/Pages/Community/Community';
import ArticleDetail from './../renders/pages/Pages/Community/ArticleDetail';
import ProjectDetail from './../renders/pages/Pages/Community/ProjectDetail';
import DiscussionDetail from './../renders/pages/Pages/Community/DiscussionDetail';

// Importando a nova página de Perfil do Laboratório
import LabProfile from './../renders/pages/Pages/Lab/LabProfile';

import ScrollToTop from './config/ScrollToTop';

const Lab = () => <div style={{ padding: '100px' }}>Área de Ferramentas Laboratoriais</div>;
const PFuzzy = () => <div style={{ padding: '100px' }}>Módulo de Rizofiltração P-Fuzzy</div>;

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop /> {/* <-- Componente global interceptando as rotas */}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/lab/:id" element={<LabProfile />} /> {/* <-- NOVA ROTA DO LAB */}
          <Route path="/p-fuzzy" element={<PFuzzy />} />
          <Route path="/community" element={<Community />} />
          <Route path="/results" element={<div>Resultados de Pesquisa</div>} />

          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/discussion/:id" element={<DiscussionDetail />} />
        </Routes>
      </main>
      {/* O Footer será implementado na sequência (se já não estiver dentro das páginas) */}
    </Router>
  );
};

export default App;