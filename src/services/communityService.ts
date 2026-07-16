import { collection, getDocs, doc, getDoc, arrayUnion, setDoc, increment, deleteDoc, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../config/routes';
import type { Article, Project, Discussion, LabPartner } from '../types/community';
import type { IUser } from '../types/index';

export const communityService = {
  // Artigos
  async getArticles(): Promise<Article[]> {
    const querySnapshot = await getDocs(collection(db, FIREBASE_ROUTES.ARTICLES));
    const data: Article[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Article);
    });
    return data;
  },

  async getArticlesPaginated(limitCount: number = 10, lastDocSnap: any = null): Promise<{ data: Article[], lastDoc: any }> {
    let q = query(collection(db, FIREBASE_ROUTES.ARTICLES), limit(limitCount));
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
    const docSnap = await getDoc(doc(db, FIREBASE_ROUTES.ARTICLES, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Article;
    }
    return null;
  },

  async createArticle(articleData: Omit<Article, 'id'>): Promise<string> {
    const docRef = doc(collection(db, FIREBASE_ROUTES.ARTICLES));
    await setDoc(docRef, articleData);
    return docRef.id;
  },

  // Projetos
  async getProjects(): Promise<Project[]> {
    const querySnapshot = await getDocs(collection(db, FIREBASE_ROUTES.PROJECTS));
    const data: Project[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Project);
    });
    return data;
  },

  // Discussões (Feed)
  
  async getProjectsPaginated(limitCount: number = 10, lastDocSnap: any = null): Promise<{ data: Project[], lastDoc: any }> {
    let q = query(collection(db, FIREBASE_ROUTES.PROJECTS), limit(limitCount));
    if (lastDocSnap) {
      q = query(q, startAfter(lastDocSnap));
    }
    const querySnapshot = await getDocs(q);
    const data: Project[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Project);
    });
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null };
  },

  async getDiscussions(): Promise<Discussion[]> {
    const querySnapshot = await getDocs(collection(db, FIREBASE_ROUTES.DISCUSSIONS));
    const data: Discussion[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Discussion);
    });
    // Ordenar por data mais recente
    return data.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  },

  
  async getDiscussionsPaginated(limitCount: number = 10, lastDocSnap: any = null): Promise<{ data: Discussion[], lastDoc: any }> {
    let q = query(collection(db, FIREBASE_ROUTES.DISCUSSIONS), orderBy('date', 'desc'), limit(limitCount));
    if (lastDocSnap) {
      q = query(q, startAfter(lastDocSnap));
    }
    const querySnapshot = await getDocs(q);
    const data: Discussion[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Discussion);
    });
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null };
  },

  async getGlobalFeedPaginated(limitCount: number = 15, cursors: any = null): Promise<{ data: any[], cursors: any, hasMore: boolean }> {
    // Divide the limit across the 3 collections to always return ~15 items per scroll
    const limitPerCollection = Math.ceil(limitCount / 3);
    
    const [arts, projs, discs] = await Promise.all([
      this.getArticlesPaginated(limitPerCollection, cursors?.articles),
      this.getProjectsPaginated(limitPerCollection, cursors?.projects),
      this.getDiscussionsPaginated(limitPerCollection, cursors?.discussions)
    ]);
    
    const combined = [
      ...arts.data.map(a => ({ ...a, _type: 'article', _date: new Date(a.date || 0).getTime() })),
      ...projs.data.map(p => ({ ...p, _type: 'project', _date: new Date(p.deadline || 0).getTime() })),
      ...discs.data.map(d => ({ ...d, _type: 'discussion', _date: new Date(d.date || 0).getTime() }))
    ];
    
    // Sort combined results for this page by date descending
    combined.sort((a, b) => b._date - a._date);
    
    const hasMore = (arts.lastDoc !== null) || (projs.lastDoc !== null) || (discs.lastDoc !== null);

    return {
      data: combined,
      cursors: {
        articles: arts.lastDoc,
        projects: projs.lastDoc,
        discussions: discs.lastDoc
      },
      hasMore
    };
  },

  async getDiscussionById(id: string): Promise<Discussion | null> {
    const docSnap = await getDoc(doc(db, FIREBASE_ROUTES.DISCUSSIONS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Discussion;
    }
    return null;
  },

  async createDiscussion(discussionData: Omit<Discussion, 'id'>): Promise<string> {
    const docRef = doc(collection(db, FIREBASE_ROUTES.DISCUSSIONS));
    await setDoc(docRef, discussionData);
    return docRef.id;
  },

  async addReply(discussionId: string, replyData: Record<string, unknown>): Promise<void> {
    const docRef = doc(db, FIREBASE_ROUTES.DISCUSSIONS, discussionId);
    // Para simplificar, vamos colocar os replies dentro do array de replies na própria doc
    // e incrementar a contagem de comentários.
    await setDoc(docRef, {
      replies: arrayUnion(replyData),
      commentsCount: increment(1),
      comments: increment(1) // mantendo a compatibilidade com a tipagem antiga
    }, { merge: true });
  },

  async deleteReply(discussionId: string, replyId: string): Promise<void> {
    const docRef = doc(db, FIREBASE_ROUTES.DISCUSSIONS, discussionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const data = docSnap.data();
    const replies = data.replies || [];
    const updatedReplies = replies.filter((r: any) => r.id !== replyId);
    
    await setDoc(docRef, {
      replies: updatedReplies,
      commentsCount: increment(-1),
      comments: increment(-1)
    }, { merge: true });
  },

  async updateReply(discussionId: string, replyId: string, newContent: string, newLinks?: {title: string, url: string}[]): Promise<void> {
    const docRef = doc(db, FIREBASE_ROUTES.DISCUSSIONS, discussionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const data = docSnap.data();
    const replies = data.replies || [];
    const updatedReplies = replies.map((r: any) => {
      if (r.id === replyId) {
        return { ...r, content: newContent, ...(newLinks ? { links: newLinks } : {}) };
      }
      return r;
    });
    
    await setDoc(docRef, {
      replies: updatedReplies
    }, { merge: true });
  },

  async voteDiscussion(discussionId: string, userId: string): Promise<{liked: boolean, likesCount: number}> {
    const docRef = doc(db, FIREBASE_ROUTES.DISCUSSIONS, discussionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Discussão não encontrada");
    
    const data = docSnap.data();
    const likedBy = data.likedBy || [];
    const hasLiked = likedBy.includes(userId);
    
    let newLikesCount = data.likes || 0;
    
    if (hasLiked) {
      await setDoc(docRef, {
        likedBy: likedBy.filter((id: string) => id !== userId),
        likes: increment(-1)
      }, { merge: true });
      newLikesCount--;
      return { liked: false, likesCount: newLikesCount };
    } else {
      await setDoc(docRef, {
        likedBy: arrayUnion(userId),
        likes: increment(1)
      }, { merge: true });
      newLikesCount++;
      return { liked: true, likesCount: newLikesCount };
    }
  },

  async deleteDiscussion(discussionId: string): Promise<void> {
    await deleteDoc(doc(db, FIREBASE_ROUTES.DISCUSSIONS, discussionId));
  },

  async updateDiscussion(discussionId: string, newContent: string): Promise<void> {
    const docRef = doc(db, FIREBASE_ROUTES.DISCUSSIONS, discussionId);
    await setDoc(docRef, { content: newContent }, { merge: true });
  },

  // Laboratórios Parceiros
  async getLabs(): Promise<LabPartner[]> {
    const querySnapshot = await getDocs(collection(db, FIREBASE_ROUTES.LABS));
    const labsData: LabPartner[] = [];
    querySnapshot.forEach(doc => {
      labsData.push({ id: doc.id, name: doc.data().name });
    });
    return labsData;
  },

  // Busca todos os usuários do banco e retorna aleatoriamente 3 que o logado AINDA NÃO segue e não seja ele mesmo
  async getSuggestedUsers(currentUserId: string): Promise<IUser[]> {
    try {
      // Pega dados do logado para ver a array de seguindo
      const currentUserDoc = await getDoc(doc(db, FIREBASE_ROUTES.USERS, currentUserId));
      let following: string[] = [];
      if (currentUserDoc.exists() && currentUserDoc.data().following) {
         following = currentUserDoc.data().following;
      }

      // Busca todos os usuários (por ser protótipo; numa base de milhões seria query mais elaborada ou edge functions)
      const usersSnap = await getDocs(collection(db, FIREBASE_ROUTES.USERS));
      const allUsers: IUser[] = [];
      
      usersSnap.forEach(uDoc => {
        const data = uDoc.data();
        if (uDoc.id !== currentUserId && !following.includes(uDoc.id)) {
           allUsers.push({ id: uDoc.id, ...data } as IUser);
        }
      });

      // Retorna 3 aleatórios
      return allUsers.sort(() => 0.5 - Math.random()).slice(0, 3);

    } catch (e) {
      console.error("Erro ao buscar usuários sugeridos", e);
      return [];
    }
  },

  // Seguir um usuário real no firebase
  async followUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const userRef = doc(db, FIREBASE_ROUTES.USERS, currentUserId);
      await setDoc(userRef, { following: arrayUnion(targetUserId) }, { merge: true });
      return true;
    } catch (e) {
      console.error("Erro ao seguir usuário", e);
      return false;
    }
  },

  // Busca tags de discussões, projetos e artigos para gerar Trending Topics
  async getTrendingTopics(limitCount: number = 5): Promise<string[]> {
    try {
      const [discussions, projects, articles] = await Promise.all([
        this.getDiscussions(),
        this.getProjects(),
        this.getArticles()
      ]);
      
      const tagCounts: Record<string, number> = {};
      
      const addTags = (items: Array<Article | Project | Discussion>) => {
        items.forEach(item => {
          if (Array.isArray(item.tags)) {
            item.tags.forEach((tag: string) => {
              // Normalizar: remover # inicial se houver
              const t = tag.trim().replace(/^#/, '');
              if (t) {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
              }
            });
          }
        });
      };
      
      addTags(discussions);
      addTags(projects);
      addTags(articles);
      
      // Ordenar por frequência (decrescente)
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
        
      const results = sortedTags.slice(0, limitCount);
      
      if (results.length === 0) {
        return [
          "Análise de Dados Complexos",
          "Desenvolvimento de Vacinas",
          "Inteligência Artificial na Saúde",
          "Biorreatores Industriais",
          "Controle de Qualidade"
        ];
      }
      return results;
    } catch (e) {
      console.error("Erro ao buscar trending topics", e);
      return [
        "Análise de Dados Complexos",
        "Desenvolvimento de Vacinas",
        "Inteligência Artificial na Saúde",
        "Biorreatores Industriais",
        "Controle de Qualidade"
      ];
    }
  }
};
