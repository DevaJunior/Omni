import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, BookOpen, FileText, Beaker, Settings, LogOut, LayoutGrid, HelpCircle } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import './styles.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!currentUser) return null;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home' ? 'active' : '';
    }
    if (path === '/lab') {
      return location.pathname.startsWith('/lab') && !location.pathname.includes('pfuzzy') ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const userPhoto = userProfile?.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || currentUser.displayName || 'User')}&background=random`;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`sidebar-menu ${isOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="sidebar-top" onClick={() => { onClose(); navigate('/profile'); }}>
          <img src={userPhoto} alt="User Avatar" className="sidebar-avatar" />
          <div className="sidebar-user-info">
            <strong>{userProfile?.name || currentUser.displayName || 'Usuário'}</strong>
            <span>{userProfile?.role || 'Pesquisador'}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="sidebar-content">

          {/* <button className="sidebar-btn-primary" onClick={() => { onClose(); navigate('/publish-article'); }}>
            <Plus size={18} /> Nova Publicação
          </button> */}

          <div className="sidebar-group">
            <span className="sidebar-group-title">PLATAFORMA</span>
            <button onClick={() => { onClose(); navigate('/'); }} className={`sidebar-item ${isActive('/')}`}>
              <LayoutGrid size={20} /> Dashboard
            </button>
            <button onClick={() => { onClose(); navigate('/lab'); }} className={`sidebar-item ${isActive('/lab')}`}>
              <Beaker size={20} /> Workbench
            </button>
          </div>

          <div className="sidebar-group">
            <span className="sidebar-group-title">COLABORAÇÃO</span>
            <button onClick={() => { onClose(); navigate('/community'); }} className={`sidebar-item ${isActive('/community')}`}>
              <Users size={20} /> Community
            </button>
            <button onClick={() => { onClose(); navigate('/learn'); }} className={`sidebar-item ${isActive('/learn')}`}>
              <BookOpen size={20} /> Learn
            </button>
            <button onClick={() => { onClose(); navigate('/articles'); }} className={`sidebar-item ${isActive('/articles')}`}>
              <FileText size={20} /> Articles
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button onClick={async () => { onClose(); await logout(); navigate('/login'); }} className="sidebar-footer-btn" title="Sair">
            <LogOut size={20} />
          </button>
          <button onClick={() => { onClose(); /* Adicione rota se houver */ }} className="sidebar-footer-btn" title="Ajuda">
            <HelpCircle size={20} />
          </button>
          <button onClick={() => { onClose(); navigate('/settings'); }} className="sidebar-footer-btn" title="Configurações">
            <Settings size={20} />
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
