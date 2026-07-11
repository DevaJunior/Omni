import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  increment,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../config/routes';
import type { StudyNote } from '../types/learn';

const COLLECTION_NAME = FIREBASE_ROUTES.NOTES;

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
  },

  /**
   * Atualiza uma postagem existente
   */
  async updateNote(id: string, data: Partial<StudyNote>): Promise<void> {
    const noteRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(noteRef, data as any);
  },

  /**
   * Exclui uma postagem
   */
  async deleteNote(id: string): Promise<void> {
    const noteRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(noteRef);
  },

  /**
   * Registra uma denúncia para uma postagem
   */
  async reportNote(id: string, reporterId: string, reason: string): Promise<void> {
    const reportData = {
      noteId: id,
      reporterId,
      reason,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    await addDoc(collection(db, 'reports'), reportData);
  },

  /**
   * Busca todas as denúncias
   */
  async getAllReports(): Promise<any[]> {
    const querySnapshot = await getDocs(collection(db, 'reports'));
    const data: any[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  },

  /**
   * Atualiza o status de uma denúncia
   */
  async updateReportStatus(id: string, status: 'pending' | 'resolved'): Promise<void> {
    const reportRef = doc(db, 'reports', id);
    await updateDoc(reportRef, { status });
  }
};
