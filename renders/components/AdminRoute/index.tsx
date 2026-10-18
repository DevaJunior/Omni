import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../src/contexts/AuthContext';

import OmniLoader from '../OmniLoader';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <OmniLoader
        variant="fullscreen"
        size="lg"
        icon="atom"
        message="Verificando Permissões..."
        submessage="Validando nível de acesso administrativo..."
      />
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
