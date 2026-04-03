import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Beaker, LayoutDashboard, Users, BookOpen } from 'lucide-react';
import './styles.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Função auxiliar aprimorada para marcar o link atual como ativo
  const isActive = (path: string) => {
    // Exceção: Se for a aba de Laboratório, ela deve ficar ativa para todas as rotas 
    // dentro de /lab (ex: ferramentas), EXCETO para a Análise P-Fuzzy.
    if (path === '/lab') {
      return location.pathname.startsWith('/lab') && !location.pathname.includes('pfuzzy') ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          Omni
        </Link>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link
            to="/community"
            className={`nav-link ${isActive('/community')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Users size={18} /> Comunidade
          </Link>

          <Link
            to="/lab"
            className={`nav-link ${isActive('/lab')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Beaker size={18} /> Laboratório
          </Link>

          <Link
            to="/lab/pfuzzy-rizofiltracao"
            className={`nav-link ${isActive('/lab/pfuzzy-rizofiltracao')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <LayoutDashboard size={18} /> Análise P-Fuzzy
          </Link>

          <Link
            to="/results"
            className={`nav-link ${isActive('/results')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <BookOpen size={18} /> Resultados
          </Link>
        </div>

        <div className="nav-actions">
          <button className="icon-btn"><Search size={20} /></button>
          <button
            className={`icon-btn profile-btn ${isActive('/profile')}`}
            onClick={() => navigate('/profile')}
            title="Meu Perfil"
          >
            <User size={20} />
          </button>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;