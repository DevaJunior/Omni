import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './values/tokens.css';
import Navbar from './../renders/menus/Navbar';
import Home from './../renders/pages/Pages/Home';
import Community from './../renders/pages/Pages/Community/Community';
import ArticleDetail from './../renders/pages/Pages/Community/ArticleDetail';
import ProjectDetail from './../renders/pages/Pages/Community/ProjectDetail';
import DiscussionDetail from './../renders/pages/Pages/Community/DiscussionDetail';

// Laboratório e Ferramentas
import LabProfile from './../renders/pages/Pages/Lab/LabProfile';
import Lab from './../renders/pages/Pages/Lab/Lab';

import ScrollToTop from './config/ScrollToTop';
import MolarityCalc from './../renders/widgets/MolarityCalc/index';

const PFuzzy = () => <div style={{ padding: '100px' }}>Módulo de Rizofiltração P-Fuzzy</div>;

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Rotas do Ecossistema Lab */}
          <Route path="/lab" element={<Lab />} />
          <Route path="/lab/:id" element={<LabProfile />} />
          <Route path="/lab/molarity-calc" element={<MolarityCalc />} />

          <Route path="/p-fuzzy" element={<PFuzzy />} />
          <Route path="/community" element={<Community />} />
          <Route path="/results" element={<div>Resultados de Pesquisa</div>} />

          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/discussion/:id" element={<DiscussionDetail />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;