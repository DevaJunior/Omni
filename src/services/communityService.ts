import { collection, getDocs, doc, getDoc, arrayUnion, setDoc, increment, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type { Article, Project, Discussion, LabPartner } from '../types/community';

export const communityService = {
  // Artigos
  async getArticles(): Promise<Article[]> {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const data: Article[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Article);
    });
    return data;
  },

  async getArticleById(id: string): Promise<Article | null> {
    const docSnap = await getDoc(doc(db, "articles", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Article;
    }
    return null;
  },

  // Projetos
  async getProjects(): Promise<Project[]> {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const data: Project[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Project);
    });
    return data;
  },

  // Discussões (Feed)
  async getDiscussions(): Promise<Discussion[]> {
    const querySnapshot = await getDocs(collection(db, "discussions"));
    const data: Discussion[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Discussion);
    });
    // Ordenar por data mais recente
    return data.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  },

  async getDiscussionById(id: string): Promise<any | null> {
    const docSnap = await getDoc(doc(db, "discussions", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async createDiscussion(discussionData: Omit<Discussion, 'id'>): Promise<string> {
    const docRef = doc(collection(db, "discussions"));
    await setDoc(docRef, discussionData);
    return docRef.id;
  },

  async addReply(discussionId: string, replyData: any): Promise<void> {
    const docRef = doc(db, "discussions", discussionId);
    // Para simplificar, vamos colocar os replies dentro do array de replies na própria doc
    // e incrementar a contagem de comentários.
    await setDoc(docRef, {
      replies: arrayUnion(replyData),
      commentsCount: increment(1),
      comments: increment(1) // mantendo a compatibilidade com a tipagem antiga
    }, { merge: true });
  },

  async voteDiscussion(discussionId: string, userId: string): Promise<{liked: boolean, likesCount: number}> {
    const docRef = doc(db, "discussions", discussionId);
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
    await deleteDoc(doc(db, "discussions", discussionId));
  },

  // Laboratórios Parceiros
  async getLabs(): Promise<LabPartner[]> {
    const querySnapshot = await getDocs(collection(db, "labs"));
    const labsData: LabPartner[] = [];
    querySnapshot.forEach(doc => {
      labsData.push({ id: doc.id, name: doc.data().name });
    });
    return labsData;
  },

  // Busca todos os usuários do banco e retorna aleatoriamente 3 que o logado AINDA NÃO segue e não seja ele mesmo
  async getSuggestedUsers(currentUserId: string): Promise<any[]> {
    try {
      // Pega dados do logado para ver a array de seguindo
      const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
      let following: string[] = [];
      if (currentUserDoc.exists() && currentUserDoc.data().following) {
         following = currentUserDoc.data().following;
      }

      // Busca todos os usuários (por ser protótipo; numa base de milhões seria query mais elaborada ou edge functions)
      const usersSnap = await getDocs(collection(db, "users"));
      const allUsers: any[] = [];
      
      usersSnap.forEach(uDoc => {
        const data = uDoc.data();
        if (uDoc.id !== currentUserId && !following.includes(uDoc.id)) {
           allUsers.push({ id: uDoc.id, ...data });
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
      const userRef = doc(db, "users", currentUserId);
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
      
      const addTags = (items: any[]) => {
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
