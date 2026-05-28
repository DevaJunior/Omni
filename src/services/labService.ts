import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../config/routes';
import type { Tool, LabProfile } from '../types/lab';

export const labService = {
  // Ferramentas (Bancada)
  async getTools(): Promise<Tool[]> {
    const querySnapshot = await getDocs(collection(db, FIREBASE_ROUTES.TOOLS));
    const data: Tool[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Tool);
    });
    return data;
  },

  // Perfil de Laboratório
  async getLabById(id: string): Promise<LabProfile | null> {
    const docSnap = await getDoc(doc(db, FIREBASE_ROUTES.LABS, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LabProfile;
    }
    return null;
  }
};
