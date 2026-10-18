import { collection, getDocs, doc, getDoc, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../config/routes';
import type { Tool, LabProfile, LabMember } from '../types/lab';
import type { IUser } from '../types';

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
  },

  // Atualizar presença do usuário
  async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    if (!userId) return;
    try {
      const userRef = doc(db, FIREBASE_ROUTES.USERS, userId);
      await updateDoc(userRef, {
        isOnline,
        lastActive: Date.now()
      });
    } catch (err) {
      // Falhas silenciosas de presença não devem interromper o app
      console.warn('Erro ao atualizar presença do usuário:', err);
    }
  },

  // Buscar membros reais do laboratório
  async getLabMembers(
    labId: string,
    labAdminId?: string,
    currentUserProfile?: IUser | null
  ): Promise<LabMember[]> {
    if (!labId) return [];

    try {
      const q = query(collection(db, FIREBASE_ROUTES.USERS), where('lab.id', '==', labId));
      const snap = await getDocs(q);

      const membersMap = new Map<string, LabMember>();

      // 1. Processar membros encontrados pela query
      snap.docs.forEach(d => {
        const data = d.data();
        const memberId = d.id;
        const role = data.lab?.role || data.role || (memberId === labAdminId ? 'Admin / PI' : 'Pesquisador');
        const lastActiveTime = typeof data.lastActive === 'number'
          ? data.lastActive
          : data.lastActive?.toMillis ? data.lastActive.toMillis() : 0;
        const isRecentlyActive = (Date.now() - lastActiveTime) < 15 * 60 * 1000;
        const isOnline = Boolean(
          (currentUserProfile && memberId === currentUserProfile.id) ||
          data.isOnline === true ||
          isRecentlyActive
        );

        membersMap.set(memberId, {
          id: memberId,
          name: data.name || 'Pesquisador',
          email: data.email || '',
          avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
          headline: data.headline || data.bio || '',
          role,
          department: data.department || '',
          isOnline,
          isAdmin: Boolean(memberId === labAdminId || role.toLowerCase().includes('admin') || role.toLowerCase().includes('pi')),
          lastActive: data.lastActive
        });
      });

      // 2. Se o Admin do Lab não estiver no mapa, buscá-lo diretamente
      if (labAdminId && !membersMap.has(labAdminId)) {
        try {
          const adminDoc = await getDoc(doc(db, FIREBASE_ROUTES.USERS, labAdminId));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            const lastActiveTime = typeof data.lastActive === 'number'
              ? data.lastActive
              : data.lastActive?.toMillis ? data.lastActive.toMillis() : 0;
            const isRecentlyActive = (Date.now() - lastActiveTime) < 15 * 60 * 1000;
            const isOnline = Boolean(
              (currentUserProfile && labAdminId === currentUserProfile.id) ||
              data.isOnline === true ||
              isRecentlyActive
            );

            membersMap.set(labAdminId, {
              id: labAdminId,
              name: data.name || 'Coordenador do Lab',
              email: data.email || '',
              avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Admin')}&background=random`,
              headline: data.headline || 'Coordenador / PI do Laboratório',
              role: data.lab?.role || 'Admin / PI',
              department: data.department || '',
              isOnline,
              isAdmin: true,
              lastActive: data.lastActive
            });
          }
        } catch (err) {
          console.warn('Erro ao carregar adminId do lab:', err);
        }
      }

      // 3. Garantir inclusão do usuário logado se ele pertencer ao laboratório
      if (currentUserProfile && (currentUserProfile.lab?.id === labId || currentUserProfile.id === labAdminId)) {
        const myId = currentUserProfile.id;
        if (!membersMap.has(myId)) {
          const myRole = currentUserProfile.lab?.role || currentUserProfile.role || (myId === labAdminId ? 'Admin / PI' : 'Pesquisador');
          membersMap.set(myId, {
            id: myId,
            name: currentUserProfile.name || 'Você',
            email: currentUserProfile.email || '',
            avatar: currentUserProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserProfile.name || 'User')}&background=random`,
            headline: currentUserProfile.headline || currentUserProfile.bio || '',
            role: myRole,
            department: currentUserProfile.department || '',
            isOnline: true,
            isAdmin: Boolean(myId === labAdminId || myRole.toLowerCase().includes('admin') || myRole.toLowerCase().includes('pi'))
          });
        } else {
          // Atualiza online status para o usuário logado
          const existing = membersMap.get(myId)!;
          existing.isOnline = true;
          membersMap.set(myId, existing);
        }
      }

      // 4. Ordenar membros: Admins/PIs primeiro, depois online, depois alfabético
      const sortedMembers = Array.from(membersMap.values()).sort((a, b) => {
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return a.name.localeCompare(b.name);
      });

      return sortedMembers;
    } catch (error) {
      console.error('Erro ao buscar membros do laboratório:', error);
      return [];
    }
  },

  // Inscrição em tempo real para membros do laboratório
  subscribeLabMembers(
    labId: string,
    currentUserProfile: IUser | null,
    callback: (members: LabMember[]) => void,
    labAdminId?: string
  ): () => void {
    if (!labId) {
      callback([]);
      return () => {};
    }

    const q = query(collection(db, FIREBASE_ROUTES.USERS), where('lab.id', '==', labId));

    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        const membersMap = new Map<string, LabMember>();

        snap.docs.forEach((d) => {
          const data = d.data();
          const memberId = d.id;
          const role = data.lab?.role || data.role || (memberId === labAdminId ? 'Admin / PI' : 'Pesquisador');
          const lastActiveTime = typeof data.lastActive === 'number'
            ? data.lastActive
            : data.lastActive?.toMillis ? data.lastActive.toMillis() : 0;
          const isRecentlyActive = (Date.now() - lastActiveTime) < 15 * 60 * 1000;
          const isOnline = Boolean(
            (currentUserProfile && memberId === currentUserProfile.id) ||
            data.isOnline === true ||
            isRecentlyActive
          );

          membersMap.set(memberId, {
            id: memberId,
            name: data.name || 'Pesquisador',
            email: data.email || '',
            avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
            headline: data.headline || data.bio || '',
            role,
            department: data.department || '',
            isOnline,
            isAdmin: Boolean(memberId === labAdminId || role.toLowerCase().includes('admin') || role.toLowerCase().includes('pi')),
            lastActive: data.lastActive
          });
        });

        // Garantir inclusão do Admin se não estiver na query
        if (labAdminId && !membersMap.has(labAdminId)) {
          try {
            const adminDoc = await getDoc(doc(db, FIREBASE_ROUTES.USERS, labAdminId));
            if (adminDoc.exists()) {
              const data = adminDoc.data();
              const lastActiveTime = typeof data.lastActive === 'number'
                ? data.lastActive
                : data.lastActive?.toMillis ? data.lastActive.toMillis() : 0;
              const isRecentlyActive = (Date.now() - lastActiveTime) < 15 * 60 * 1000;
              const isOnline = Boolean(
                (currentUserProfile && labAdminId === currentUserProfile.id) ||
                data.isOnline === true ||
                isRecentlyActive
              );

              membersMap.set(labAdminId, {
                id: labAdminId,
                name: data.name || 'Coordenador do Lab',
                email: data.email || '',
                avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Admin')}&background=random`,
                headline: data.headline || 'Coordenador / PI do Laboratório',
                role: data.lab?.role || 'Admin / PI',
                department: data.department || '',
                isOnline,
                isAdmin: true,
                lastActive: data.lastActive
              });
            }
          } catch (e) {
            console.warn('Erro ao carregar admin no snapshot:', e);
          }
        }

        // Garantir inclusão do usuário logado se for do laboratório
        if (currentUserProfile && (currentUserProfile.lab?.id === labId || currentUserProfile.id === labAdminId)) {
          const myId = currentUserProfile.id;
          if (!membersMap.has(myId)) {
            const myRole = currentUserProfile.lab?.role || currentUserProfile.role || (myId === labAdminId ? 'Admin / PI' : 'Pesquisador');
            membersMap.set(myId, {
              id: myId,
              name: currentUserProfile.name || 'Você',
              email: currentUserProfile.email || '',
              avatar: currentUserProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserProfile.name || 'User')}&background=random`,
              headline: currentUserProfile.headline || currentUserProfile.bio || '',
              role: myRole,
              department: currentUserProfile.department || '',
              isOnline: true,
              isAdmin: Boolean(myId === labAdminId || myRole.toLowerCase().includes('admin') || myRole.toLowerCase().includes('pi'))
            });
          } else {
            const existing = membersMap.get(myId)!;
            existing.isOnline = true;
            membersMap.set(myId, existing);
          }
        }

        const sorted = Array.from(membersMap.values()).sort((a, b) => {
          if (a.isAdmin && !b.isAdmin) return -1;
          if (!a.isAdmin && b.isAdmin) return 1;
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          return a.name.localeCompare(b.name);
        });

        callback(sorted);
      },
      (error) => {
        console.error('Erro ao escutar membros do laboratório:', error);
      }
    );

    return unsubscribe;
  }
};
