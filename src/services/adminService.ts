import { collection, getDocs, query, where, getCountFromServer, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../constants/firebaseRoutes';
import type { IInstitution, IUser } from '../types';
import type { LabProfile } from '../types/lab';

export interface AdminMetrics {
  totalUsers: number;
  totalLabs: number;
  pendingLabs: number;
  totalInstitutions: number;
  unresolvedReports: number;
}

export const adminService = {
  async getDashboardMetrics(): Promise<AdminMetrics> {
    try {
      // Get users count
      let totalUsers = 0;
      try {
        const usersSnap = await getCountFromServer(collection(db, FIREBASE_ROUTES.USERS));
        totalUsers = usersSnap.data().count;
      } catch (e) {
        console.warn("Users collection missing or error", e);
      }

      // Get labs count
      let totalLabs = 0;
      let pendingLabs = 0;
      try {
        const labsSnap = await getDocs(collection(db, 'labs'));
        totalLabs = labsSnap.size;
        pendingLabs = labsSnap.docs.filter(d => d.data().status === 'pending').length;
      } catch (e) {
        console.warn("Labs collection missing or error", e);
      }

      // Get institutions count
      let totalInstitutions = 0;
      try {
        const instSnap = await getCountFromServer(collection(db, 'institutions'));
        totalInstitutions = instSnap.data().count;
      } catch (e) {
        console.warn("Institutions collection missing or error", e);
      }

      // Get reports count
      let unresolvedReports = 0;
      try {
        const reportsQuery = query(collection(db, 'reports'), where('status', '==', 'pending'));
        const reportsSnap = await getCountFromServer(reportsQuery);
        unresolvedReports = reportsSnap.data().count;
      } catch (e) {
         console.warn("Reports collection missing or error", e);
      }

      return {
        totalUsers,
        totalLabs,
        pendingLabs,
        totalInstitutions,
        unresolvedReports
      };
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      throw error;
    }
  },

  async getInstitutions(): Promise<IInstitution[]> {
    const snap = await getDocs(collection(db, 'institutions'));
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as IInstitution));
  },

  async createInstitution(data: Omit<IInstitution, 'id' | 'createdAt'>): Promise<string> {
    const newInst = {
      ...data,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'institutions'), newInst);
    return docRef.id;
  },

  async updateInstitution(id: string, data: Partial<IInstitution>): Promise<void> {
    const docRef = doc(db, 'institutions', id);
    await updateDoc(docRef, data);
  },

  async deleteInstitution(id: string): Promise<void> {
    const docRef = doc(db, 'institutions', id);
    await deleteDoc(docRef);
  },

  async getLabs(): Promise<LabProfile[]> {
    const snap = await getDocs(collection(db, 'labs'));
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as LabProfile));
  },

  async updateLabStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    const docRef = doc(db, 'labs', id);
    await updateDoc(docRef, { status });
  },

  async getUsers(): Promise<IUser[]> {
    const snap = await getDocs(collection(db, FIREBASE_ROUTES.USERS));
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as IUser));
  },

  async updateUserRole(id: string, role: string): Promise<void> {
    const docRef = doc(db, FIREBASE_ROUTES.USERS, id);
    await updateDoc(docRef, { role });
  }
};
