import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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
  }
};
