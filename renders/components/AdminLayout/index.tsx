import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building, FlaskConical, ShieldAlert, LogOut } from 'lucide-react';
import './styles.css';
import { useAuth } from '../../../src/contexts/AuthContext';
import { handleImageError, DEFAULT_IMAGES } from '../../../src/utils/imageUtils';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userProfile } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Instituições', path: '/admin/institutions', icon: <Building size={20} /> },
    { label: 'Laboratórios', path: '/admin/labs', icon: <FlaskConical size={20} /> },
    { label: 'Usuários', path: '/admin/users', icon: <Users size={20} /> },
    { label: 'Moderação', path: '/admin/reports', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <div className="admin-layout-container">
      <aside className="admin-sidebar">
        <div className="admin-brand" onClick={() => navigate('/home')}>
          <div className="brand-logo">OMNI</div>
          <span className="brand-badge">ADMIN</span>
        </div>
        
        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`admin-nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-footer">
          <div className="admin-user-info">
            <img
              src={userProfile?.avatar || DEFAULT_IMAGES.avatar(userProfile?.name)}
              alt="Avatar"
              className="admin-avatar"
              onError={(e) => handleImageError(e, DEFAULT_IMAGES.avatar(userProfile?.name))}
            />
            <div className="admin-details">
              <span className="admin-name">{userProfile?.name}</span>
              <span className="admin-role">Super Admin</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          <h2>Omni Governance</h2>
          <button className="btn-outline" onClick={() => navigate('/home')}>Voltar ao App</button>
        </header>
        <div className="admin-scroll-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
