import { collection, getDocs, doc, getDoc, query, limit, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface Article {
  id: string;
  title: string;
  desc: string;
  image: string;
  category: string;
  createdAt?: any;
  stats?: {
    views: number;
    downloads: number;
    citations: number;
  };
}

const COLLECTION_NAME = 'articles_home'; 
const ACADEMIC_COLLECTION = 'articles';

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
      // Como o setDoc no seed pode não ter criado o stats, vamos fazer um fetch antes ou assumir que o Firebase mergeia. 
      // Para evitar erros de "nested path not found", faremos via setDoc merge ou getDoc + update.
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const currentViews = data.stats?.views || 0;
        await setDoc(ref, { stats: { views: currentViews + 1 } }, { merge: true });
      }
    } catch (e) {
      console.error(e);
    }
  },

  // Incrementa downloads no banco
  async incrementDownloadCount(id: string, isHomeArticle: boolean): Promise<void> {
    const collectionToUpdate = isHomeArticle ? COLLECTION_NAME : ACADEMIC_COLLECTION;
    const ref = doc(db, collectionToUpdate, id);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const currentDowns = data.stats?.downloads || 0;
        await setDoc(ref, { stats: { downloads: currentDowns + 1 } }, { merge: true });
      }
    } catch (e) {
      console.error(e);
    }
  }
};
