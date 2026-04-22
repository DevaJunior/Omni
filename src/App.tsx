import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './values/tokens.css';

// Menus e Configurações
import Navbar from './../renders/menus/Navbar';
import ScrollToTop from './config/ScrollToTop';

// Páginas Principais
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from '../renders/pages/Auth/Login/index';

import Home from './../renders/pages/Pages/Home';
import Community from './../renders/pages/Pages/Community/Community';

// Detalhes da Comunidade
import ArticleDetail from './../renders/pages/Pages/Community/ArticleDetail';
import ProjectDetail from './../renders/pages/Pages/Community/ProjectDetail';
import DiscussionDetail from './../renders/pages/Pages/Community/DiscussionDetail';

// Ecossistema do Laboratório
import Lab from './../renders/pages/Pages/Lab/Lab';
import LabProfile from './../renders/pages/Pages/Lab/LabProfile';

// Ferramentas da LabBancada
import MolarityCalc from './../renders/widgets/MolarityCalc/index';
import DilutionCalc from './../renders/widgets/DilutionCalc/index';
import LabTimer from './../renders/widgets/LabTimer/index';
import UnitConverter from './../renders/widgets/UnitConverter/index';
import Inventory from './../renders/widgets/Inventory/index';

// Módulos P-Fuzzy
import PFuzzyRizofiltracao from './../renders/pages/Pages/PFuzzy/PFuzzyRizofiltracao';
import PFuzzyEngine from './../renders/widgets/PFuzzyEngine/index';
import UserProfile from '../renders/pages/Init/UserProfile/index';
import Learn from './../renders/pages/Pages/Learn/Learn/index';
import PublishNote from './../renders/pages/Pages/Learn/PublishNote/index';
import NoteDetail from './../renders/pages/Pages/Learn/NoteDetail/index';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          {/* ROTA TEMPORÁRIA DE MIGRAÇÃO FIREBASE */}
          <Route path="/run-seed" element={
            <div style={{ padding: '100px', textAlign: 'center' }}>
              <h2>Migração do Firebase</h2>
              <p>Clique no botão abaixo para popular todos os dados mockados no seu banco do Firestore.</p>
              <button 
                onClick={async () => {
                  try {
                    const { seedFirebaseDatabase } = await import('./lib/firebase/seed');
                    await seedFirebaseDatabase();
                    alert("Migração Concluída com sucesso! Verifique o console do Firebase.");
                  } catch (e) {
                    alert("Erro na migração: " + e);
                  }
                }}
                style={{ padding: '10px 20px', fontSize: '18px', background: '#2563eb', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
              >
                Executar Carga do Firebase
              </button>
            </div>
          } />

          {/* Rotas Gerais */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />

          {/* Rota de Perfil (User Profile) */}
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Rotas da Comunidade (Detalhes) */}
          <Route path="/article/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/discussion/:id" element={<ProtectedRoute><DiscussionDetail /></ProtectedRoute>} />

          {/* Rotas do Ecossistema Lab */}
          <Route path="/lab" element={<ProtectedRoute><Lab /></ProtectedRoute>} />

          {/* Rotas das Ferramentas (Widgets) */}
          <Route path="/lab/molarity-calc" element={<ProtectedRoute><MolarityCalc /></ProtectedRoute>} />
          <Route path="/lab/dilution" element={<ProtectedRoute><DilutionCalc /></ProtectedRoute>} />
          <Route path="/lab/lab-timer" element={<ProtectedRoute><LabTimer /></ProtectedRoute>} />
          <Route path="/lab/unit-converter" element={<ProtectedRoute><UnitConverter /></ProtectedRoute>} />
          <Route path="/lab/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />

          {/* Rotas da Learn (Aprendendo) */}
          <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="/learn/new" element={<ProtectedRoute><PublishNote /></ProtectedRoute>} />
          <Route path="/learn/:id" element={<ProtectedRoute><NoteDetail /></ProtectedRoute>} />

          {/* Rotas Avançadas P-Fuzzy (Devem vir ANTES da rota dinâmica /lab/:id) */}
          <Route path="/lab/pfuzzy-rizofiltracao" element={<ProtectedRoute><PFuzzyRizofiltracao /></ProtectedRoute>} />
          <Route path="/lab/p-fuzzy-engine" element={<ProtectedRoute><PFuzzyEngine /></ProtectedRoute>} />

          {/* Rota Dinâmica de Perfil de Laboratório */}
          <Route path="/lab/:id" element={<ProtectedRoute><LabProfile /></ProtectedRoute>} />

        </Routes>
      </main>
      {/* O Footer já está sendo renderizado individualmente no final de cada página */}
    </Router>
      </AuthProvider>
  );
};

export default App;