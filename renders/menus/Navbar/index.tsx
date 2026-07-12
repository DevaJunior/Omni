import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Beaker, Users, BookOpen, Bell, Heart, MessageSquare, UserPlus, Info, Settings, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { notificationService, type NotificationData } from '../../../src/services/notificationService';
import './styles.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Profile menu state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (isSearchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target as Node) && !(event.target as Element).closest('.search-toggle')) {
        setIsSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, isProfileMenuOpen]);

  // Fetch real-time notifications
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = notificationService.subscribeToNotifications(currentUser.uid, (data: NotificationData[]) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: NotificationData) => {
    if (!notif.read && currentUser) {
      await notificationService.markAsRead(currentUser.uid, notif.id);
    }
    setIsNotificationsOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await notificationService.markAllAsRead(currentUser.uid, unreadIds);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="notif-icon like" />;
      case 'mention': return <MessageSquare size={16} className="notif-icon mention" />;
      case 'invite': return <UserPlus size={16} className="notif-icon invite" />;
      default: return <Info size={16} className="notif-icon info" />;
    }
  };

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
          <Link to="/community" className={`nav-link ${isActive('/community')}`} onClick={() => setIsMenuOpen(false)} > <Users size={18} /> Community </Link>
          {/* <Link to="/lab/pfuzzy-rizofiltracao" className={`nav-link ${isActive('/lab/pfuzzy-rizofiltracao')}`} onClick={() => setIsMenuOpen(false)} > <LayoutDashboard size={18} /> Análise P-Fuzzy </Link> */}
          <Link to="/learn" className={`nav-link ${isActive('/learn')}`} onClick={() => setIsMenuOpen(false)} > <BookOpen size={18} /> Learn </Link>
          <Link to="/articles" className={`nav-link ${isActive('/articles')}`} onClick={() => setIsMenuOpen(false)} > <FileText size={18} /> Articles </Link>
        </div>

        <div className="nav-actions">

          {/* Global Search */}
          <form className={`search-container ${isSearchOpen ? 'open' : ''}`} onSubmit={handleSearchSubmit}>
            <button
              type="button"
              className="icon-btn search-toggle"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
            >
              <Search size={20} />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar artigos, projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {/* Notifications Panel */}
          {currentUser && (
            <div className="notifications-container" ref={notificationsRef}>
              <button
                className="icon-btn notif-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {isNotificationsOpen && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h4>Notificações</h4>
                    {unreadCount > 0 && (
                      <button className="mark-read-btn" onClick={markAllAsRead}>
                        Marcar todas lidas
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <Bell size={32} />
                        <p>Nenhuma notificação no momento</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`notification-item ${!notif.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="notif-icon-wrapper">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="notif-content">
                            <p className="notif-title">{notif.title}</p>
                            <p className="notif-message">{notif.message}</p>
                          </div>
                          {!notif.read && <div className="notif-unread-dot" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inbox / Mensagens Menu */}
          {/* {currentUser && (
            <button
              className={`icon-btn ${isActive('/inbox')}`}
              onClick={() => navigate('/inbox')}
              title="Mensagens Diretas"
            >
              <Mail size={20} />
            </button>
          )} */}

          {/* Profile Menu */}
          {currentUser && (
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button
                className={`icon-btn profile-btn ${isActive('/profile') || isProfileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="Menu do Usuário"
              >
                <Menu size={20} />
              </button>

              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>{userProfile?.name || currentUser.displayName || 'Usuário'}</strong>
                    <span>{userProfile?.role || 'Pesquisador'}</span>
                  </div>
                  <div className="profile-dropdown-list">
                    <button onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }} className="profile-dropdown-item">
                      <User size={16} /> Meu Perfil
                    </button>
                    <button onClick={() => { setIsProfileMenuOpen(false); navigate('/lab'); }} className="profile-dropdown-item">
                      <Beaker size={16} /> Workbench
                    </button>
                    <button onClick={() => { setIsProfileMenuOpen(false); navigate('/settings'); }} className="profile-dropdown-item">
                      <Settings size={16} /> Configurações
                    </button>
                    <div className="profile-dropdown-divider"></div>
                    <button onClick={async () => { setIsProfileMenuOpen(false); await logout(); navigate('/login'); }} className="profile-dropdown-item logout">
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Toggle */}
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;