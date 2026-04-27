import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type { Tool, LabProfile } from '../types/lab';

export const labService = {
  // Ferramentas (Bancada)
  async getTools(): Promise<Tool[]> {
    const querySnapshot = await getDocs(collection(db, "tools"));
    const data: Tool[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Tool);
    });
    return data;
  },

  // Perfil de Laboratório
  async getLabById(id: string): Promise<LabProfile | null> {
    const docSnap = await getDoc(doc(db, "labs", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LabProfile;
    }
    return null;
  }
};
