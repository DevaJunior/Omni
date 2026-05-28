import { collection, getDocs, doc, getDoc, query, limit, updateDoc, increment, Timestamp, startAfter } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../config/routes';

export interface Article {
  id: string;
  title: string;
  desc: string;
  image: string;
  category: string;
  createdAt?: Timestamp | Date | string;
  stats?: {
    views: number;
    downloads: number;
    citations: number;
  };
}

const COLLECTION_NAME = FIREBASE_ROUTES.ARTICLES_HOME; 
const ACADEMIC_COLLECTION = FIREBASE_ROUTES.ARTICLES;

export const articleService = {
  // Busca os artigos de destaque mais recentes
  async getLatestArticles(limitCount = 10): Promise<Article[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const data: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Article);
    });
    
    return data;
  },
  
  // Busca um artigo da Home pelo ID
  
  async getArticlesPaginated(limitCount: number = 10, lastDocSnap: any = null): Promise<{ data: Article[], lastDoc: any }> {
    let q = query(collection(db, ACADEMIC_COLLECTION), limit(limitCount));
    if (lastDocSnap) {
      q = query(q, startAfter(lastDocSnap));
    }
    const querySnapshot = await getDocs(q);
    const data: Article[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Article);
    });
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null };
  },

  async getArticleById(id: string): Promise<Article | null> {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Article;
    }
    return null;
  },

  // Incrementa visualização real no banco
  async incrementViewCount(id: string, isHomeArticle: boolean): Promise<void> {
    const collectionToUpdate = isHomeArticle ? COLLECTION_NAME : ACADEMIC_COLLECTION;
    const ref = doc(db, collectionToUpdate, id);
    try {
      await updateDoc(ref, { 'stats.views': increment(1) });
    } catch (e) {
      console.error(e);
    }
  },

  // Incrementa downloads no banco
  async incrementDownloadCount(id: string, isHomeArticle: boolean): Promise<void> {
    const collectionToUpdate = isHomeArticle ? COLLECTION_NAME : ACADEMIC_COLLECTION;
    const ref = doc(db, collectionToUpdate, id);
    try {
      await updateDoc(ref, { 'stats.downloads': increment(1) });
    } catch (e) {
      console.error(e);
    }
  }
};
