import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../constants/firebaseRoutes';
import type { IUser } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: IUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FUNÇÃO AUXILIAR: CRIAÇÃO INICIAL DO DOCUMENTO DO USUÁRIO ---
  const ensureUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, FIREBASE_ROUTES.USERS, user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const newUser: IUser = {
          uid: user.uid,
          role: 'user',
          personal: {
            name: user.displayName || 'Usuário',
            email: user.email || '',
            username: `@${(user.email || 'user').split('@')[0]}`,
            avatar: user.photoURL || '',
            originalAvatar: user.photoURL || '',
            bio: '',
            phone: '',
            location: '',
            isVerified: false,
            job: '',
            school: '',
            highlights: [],
          },
          assets: {
            events: { organizedEventIds: [] },
            shops: { ownedShopIds: [] },
            realEstate: { ownedPropertyIds: [] },
            jobs: { postedJobIds: [], appliedJobIds: [] }
          },
          activity: { orders: 0, tickets: [], appointments: [], favorites: [] },
          gamification: { xp: 0, level: 1, coins: 0 },
          dating: { isActive: false },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, newUser);
      }
    } catch (error) {
      console.error("Erro ao garantir documento do usuário:", error);
    }
  };

  // --- LOGIN COM GOOGLE (Padrão Spotted: apenas signInWithPopup) ---
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureUserDocument(result.user);
  };

  const logout = async () => {
    setUserProfile(null);
    await firebaseSignOut(auth);
  };

  // --- MONITORAMENTO GLOBAL ---
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await ensureUserDocument(user);

        const userRef = doc(db, FIREBASE_ROUTES.USERS, user.uid);
        unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as IUser);
          }
        });
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, loginWithGoogle, logout }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};