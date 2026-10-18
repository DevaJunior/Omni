import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import OmniLoader from '../../renders/components/OmniLoader';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <OmniLoader
        variant="fullscreen"
        size="lg"
        icon="atom"
        message="Verificando Autenticação..."
        submessage="Validando credenciais e acessos do pesquisador..."
      />
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
