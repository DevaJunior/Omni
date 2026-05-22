import { collection, getDocs, doc, getDoc, query, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface Article {
  id: string;
  title: string;
  desc: string;
  image: string;
  category: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'articles_home'; // Diferenciando de 'articles' acadêmicos (papers) para Artigos de Capa/Blog.

export const articleService = {
  /**
   * Busca os artigos de destaque mais recentes para exibir na Home
   * @param limitCount Quantidade máxima de artigos (default: 10)
   */
  async getLatestArticles(limitCount = 10): Promise<Article[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      // orderBy('createdAt', 'desc'), // Por enquanto não vamos usar orderBy, pois a seed não terá timestamp em todos.
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const data: Article[] = [];
    
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Article);
    });
    
    return data;
  },
  
  /**
   * Busca um artigo específico pelo ID
   */
  async getArticleById(id: string): Promise<Article | null> {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Article;
    }
    return null;
  }
};
