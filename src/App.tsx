import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './values/tokens.css';

// Menus e Configurações
import Navbar from './../renders/menus/Navbar';
import ScrollToTop from './config/ScrollToTop';

// Páginas Principais
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingOverlay from './components/LoadingOverlay'; // Valid path?
import ToastContainer from '../renders/components/ToastContainer';
import GlobalConfirm from '../renders/components/GlobalConfirm';
import Login from '../renders/pages/Auth/Login/index';

import Home from './../renders/pages/Pages/Home';
import Community from './../renders/pages/Pages/Community/Community';

// Detalhes da Comunidade
import ArticleDetail from './../renders/pages/Pages/Community/ArticleDetail';
import ProjectDetail from './../renders/pages/Pages/Community/ProjectDetail';
import DiscussionDetail from './../renders/pages/Pages/Community/DiscussionDetail';
import PublishArticle from './../renders/pages/Pages/Community/PublishArticle';
import Articles from './../renders/pages/Pages/Articles';

// Ecossistema do Laboratório
import Lab from './../renders/pages/Pages/Lab/Lab';
import LabProfile from './../renders/pages/Pages/Lab/LabProfile';
// import LabWorkspace from './../renders/pages/Pages/Lab/LabWorkspace';

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
import Settings from '../renders/pages/Pages/Settings';
import SearchPage from '../renders/pages/Pages/Search';
import Inbox from '../renders/pages/Pages/Inbox';
import AdminRoute from '../renders/components/AdminRoute';
import AdminReports from '../renders/pages/Pages/Admin/Reports';
import MyBench from '../renders/pages/Pages/MyBench';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Rota de Login: Isolada, sem Navbar */}
          <Route path="/login" element={<Login />} />

          {/* Todas as outras rotas: Protegidas e com Navbar */}
          <Route path="*" element={
            <>
              <LoadingOverlay />
              <ToastContainer />
              <GlobalConfirm />
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/home" element={<Navigate to="/" replace />} />


                  <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                  {/* Detalhes da Comunidade */}
                  <Route path="/article/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
                  <Route path="/publish-article" element={<ProtectedRoute><PublishArticle /></ProtectedRoute>} />
                  <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                  <Route path="/discussion/:id" element={<ProtectedRoute><DiscussionDetail /></ProtectedRoute>} />
                  <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />

                  {/* Ecossistema Lab e Ferramentas */}
                  <Route path="/lab" element={<ProtectedRoute><Lab /></ProtectedRoute>} />
                  <Route path="/lab/molarity-calc" element={<ProtectedRoute><MolarityCalc /></ProtectedRoute>} />
                  <Route path="/lab/dilution" element={<ProtectedRoute><DilutionCalc /></ProtectedRoute>} />
                  <Route path="/lab/lab-timer" element={<ProtectedRoute><LabTimer /></ProtectedRoute>} />
                  <Route path="/lab/unit-converter" element={<ProtectedRoute><UnitConverter /></ProtectedRoute>} />
                  <Route path="/lab/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />

                  {/* Learn e Artigos */}
                  <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
                  <Route path="/learn/new" element={<ProtectedRoute><PublishNote /></ProtectedRoute>} />
                  <Route path="/learn/edit/:id" element={<ProtectedRoute><PublishNote /></ProtectedRoute>} />
                  <Route path="/learn/:id" element={<ProtectedRoute><NoteDetail /></ProtectedRoute>} />

                  {/* P-Fuzzy */}
                  <Route path="/lab/pfuzzy-rizofiltracao" element={<ProtectedRoute><PFuzzyRizofiltracao /></ProtectedRoute>} />
                  <Route path="/lab/p-fuzzy-engine" element={<ProtectedRoute><PFuzzyEngine /></ProtectedRoute>} />

                  {/* Perfis Dinâmicos */}
                  <Route path="/lab/:id" element={<ProtectedRoute><LabProfile /></ProtectedRoute>} />
                  {/* <Route path="/lab/:id/workspace" element={<ProtectedRoute><LabWorkspace /></ProtectedRoute>} /> */}
                  <Route path="/lab/:id/workspace" element={<ProtectedRoute><MyBench /></ProtectedRoute>} />

                  {/* Rotas Administrativas */}
                  <Route path="/admin/reports" element={<ProtectedRoute><AdminRoute><AdminReports /></AdminRoute></ProtectedRoute>} />

                  {/* Rota de Migração */}
                  <Route path="/run-seed" element={
                    <div style={{ padding: '100px', textAlign: 'center' }}>
                      <h2>Migração do Firebase</h2>
                      <button onClick={async () => {
                        const { seedFirebaseDatabase } = await import('./lib/firebase/seed');
                        await seedFirebaseDatabase();
                        alert("Migração Concluída!");
                      }}>Executar Carga do Firebase</button>
                    </div>
                  } />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;