import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  type User, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig'; // Firebase instance

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Setar o provedor de Google Auth
  const googleProvider = new GoogleAuthProvider();
  // Permite select de contas sempre que clicar, para não travar num mesmo email sempre
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  useEffect(() => {
    // onAuthStateChanged detecta estado logado/deslogado persistente do Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirecionamento e salvamento extra podem ser feitos onde o hook for chamado
    } catch (error) {
      console.error("Erro no login com google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Erro durante logout", error);
    }
  };

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
