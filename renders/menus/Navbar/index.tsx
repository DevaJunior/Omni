import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X, Beaker, LayoutDashboard, BookOpen, Users } from 'lucide-react';
import './styles.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          Omni
        </Link>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/community" onClick={() => setIsMenuOpen(false)}>
            <Users size={18} /> Comunidade
          </Link>
          <Link to="/lab_hub" onClick={() => setIsMenuOpen(false)}>
            <Beaker size={18} /> Laboratório
          </Link>
          <Link to="/p-fuzzy" onClick={() => setIsMenuOpen(false)}>
            <LayoutDashboard size={18} /> Análise P-Fuzzy
          </Link>
          <Link to="/results" onClick={() => setIsMenuOpen(false)}>
            <BookOpen size={18} /> Resultados
          </Link>
        </div>

        <div className="nav-actions">
          <button className="icon-btn"><Search size={20} /></button>
          <button className="icon-btn profile-btn"><User size={20} /></button>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;