import { collection, getDocs, doc, getDoc, arrayUnion, setDoc } from 'firebase/firestore';
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
    return data;
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
  }
};
