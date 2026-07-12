import { collection, doc, setDoc, deleteDoc, getDoc, getDocs, query, orderBy,  Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../config/routes';

export interface IBookmark {
  id?: string;
  targetId: string;
  type: 'article' | 'project' | 'discussion' | 'note';
  title: string;
  savedAt: Timestamp | Date | string | null;
}

export const bookmarkService = {
  // Verifica se um item está salvo
  async checkIsBookmarked(userId: string, targetId: string): Promise<boolean> {
    const bookmarkRef = doc(db, FIREBASE_ROUTES.USERS, userId, FIREBASE_ROUTES.BOOKMARKS, targetId);
    const snap = await getDoc(bookmarkRef);
    return snap.exists();
  },

  // Alterna o estado de salvamento (salva se não estiver salvo, remove se estiver)
  async toggleBookmark(userId: string, targetId: string, type: 'article' | 'project' | 'discussion' | 'note', title: string): Promise<boolean> {
    const bookmarkRef = doc(db, FIREBASE_ROUTES.USERS, userId, FIREBASE_ROUTES.BOOKMARKS, targetId);
    const snap = await getDoc(bookmarkRef);

    if (snap.exists()) {
      await deleteDoc(bookmarkRef);
      return false; // Retorna false indicando que foi removido
    } else {
      const bookmarkData: IBookmark = {
        targetId,
        type,
        title,
        savedAt: Date.now() as any
      };
      await setDoc(bookmarkRef, bookmarkData);
      return true; // Retorna true indicando que foi salvo
    }
  },

  // Retorna todos os itens salvos pelo usuário
  async getUserBookmarks(userId: string): Promise<IBookmark[]> {
    const q = query(
      collection(db, FIREBASE_ROUTES.USERS, userId, FIREBASE_ROUTES.BOOKMARKS),
      orderBy('savedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as IBookmark));
  }
};
