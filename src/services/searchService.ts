import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type { Article } from './articleService';
import type { IUser } from '../types';

export interface SearchResult {
  id: string;
  type: 'article' | 'project' | 'user';
  title: string;
  subtitle: string;
  image?: string;
  url: string;
  tags?: string[];
}

export const searchService = {
  // Realiza uma busca simples client-side trazendo dados base
  // Num cenário de produção escalável, usaríamos Algolia, Typesense ou ElasticSearch.
  async globalSearch(queryStr: string): Promise<SearchResult[]> {
    const term = queryStr.toLowerCase().trim();
    if (!term) return [];

    const results: SearchResult[] = [];

    try {
      // 1. Buscar Artigos (articles_home)
      const articlesSnap = await getDocs(collection(db, 'articles_home'));
      articlesSnap.forEach(doc => {
        const data = doc.data() as Article;
        if (
          data.title?.toLowerCase().includes(term) ||
          data.desc?.toLowerCase().includes(term) ||
          data.category?.toLowerCase().includes(term)
        ) {
          results.push({
            id: doc.id,
            type: 'article',
            title: data.title,
            subtitle: data.category,
            image: data.image,
            url: `/article/${doc.id}`
          });
        }
      });

      // 1.5 Buscar Artigos Acadêmicos (articles)
      const academicSnap = await getDocs(collection(db, 'articles'));
      academicSnap.forEach(doc => {
        const data = doc.data() as any;
        if (
          data.title?.toLowerCase().includes(term) ||
          data.abstract?.toLowerCase().includes(term) ||
          (Array.isArray(data.keywords) ? data.keywords.some((k: string) => k.toLowerCase().includes(term)) : (typeof data.keywords === 'string' && data.keywords.toLowerCase().includes(term))) ||
          (Array.isArray(data.authors) ? data.authors.some((a: any) => a.name?.toLowerCase().includes(term) || (typeof a === 'string' && a.toLowerCase().includes(term))) : (typeof data.authors === 'string' && data.authors.toLowerCase().includes(term)))
        ) {
          results.push({
            id: doc.id,
            type: 'article',
            title: data.title,
            subtitle: 'Publicação Científica',
            url: `/article/${doc.id}`
          });
        }
      });

      // 2. Buscar Usuários (users)
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(doc => {
        const data = doc.data() as IUser;
        if (
          data.name?.toLowerCase().includes(term) ||
          data.headline?.toLowerCase().includes(term) ||
          data.bio?.toLowerCase().includes(term)
        ) {
          results.push({
            id: doc.id,
            type: 'user',
            title: data.name || 'Usuário',
            subtitle: data.headline || 'Pesquisador',
            image: data.avatar,
            url: `/profile/${doc.id}`
          });
        }
      });

      // 3. Buscar Projetos (projects - se existir a coleção)
      const projectsSnap = await getDocs(collection(db, 'projects'));
      projectsSnap.forEach(doc => {
        const data = doc.data();
        if (
          data.name?.toLowerCase().includes(term) ||
          data.description?.toLowerCase().includes(term)
        ) {
          results.push({
            id: doc.id,
            type: 'project',
            title: data.name,
            subtitle: data.status || 'Projeto',
            image: data.cover,
            url: `/project/${doc.id}`
          });
        }
      });

    } catch (e) {
      console.error("Erro na busca global:", e);
    }

    // Retorna ordenado aleatoriamente ou por relevância básica
    return results;
  }
};
