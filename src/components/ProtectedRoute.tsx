import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg)',
        color: 'var(--primary)'
      }}>
        <div className="loading-spinner">Verificando autenticação...</div>
      </div>
    );
  }

  if (!currentUser) {
    // Redireciona para o login caso não tenha autorização, salvando de onde veio
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se tudo certo (Auth OK como ALLOW), exibe componente interno
  return <>{children}</>;
};


export default ProtectedRoute;
