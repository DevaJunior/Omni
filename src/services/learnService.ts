import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type { StudyNote } from '../types/learn';

const COLLECTION_NAME = 'notes';

export const learnService = {
  /**
   * Busca todos os resumos da coleção
   */
  async getAllNotes(): Promise<StudyNote[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const data: StudyNote[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as StudyNote);
    });
    return data;
  },

  /**
   * Busca um resumo específico pelo ID
   */
  async getNoteById(id: string): Promise<StudyNote | null> {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StudyNote;
    }
    return null;
  },

  /**
   * Cria um novo resumo
   */
  async createNote(note: Omit<StudyNote, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), note);
    return docRef.id;
  },

  /**
   * Incrementa o contador de likes de um resumo
   */
  async likeNote(id: string): Promise<void> {
    const noteRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(noteRef, {
      likes: increment(1)
    });
  },

  /**
   * Decrementa o contador de likes (opcional)
   */
  async unlikeNote(id: string): Promise<void> {
    const noteRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(noteRef, {
      likes: increment(-1)
    });
  }
};
