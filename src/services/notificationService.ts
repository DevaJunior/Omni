import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { FIREBASE_ROUTES } from '../config/routes';

export type NotificationType = 'like' | 'mention' | 'invite' | 'comment' | 'system';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  senderId?: string;
  senderAvatar?: string;
  createdAt: Timestamp | Date | string | null;
}

export const notificationService = {
  /**
   * Ouve as notificações em tempo real de um usuário
   * @param userId ID do usuário atual
   * @param callback Função para atualizar o estado do React
   * @param limitCount Limite de notificações para carregar
   * @returns Unsubscribe function
   */
  subscribeToNotifications(userId: string, callback: (notifications: NotificationData[]) => void, limitCount = 20) {
    const notificationsRef = collection(db, FIREBASE_ROUTES.USERS, userId, FIREBASE_ROUTES.NOTIFICATIONS);
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(limitCount));

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationData[];
      callback(notifications);
    });
  },

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(userId: string, notificationId: string) {
    const notifRef = doc(db, FIREBASE_ROUTES.USERS, userId, FIREBASE_ROUTES.NOTIFICATIONS, notificationId);
    await updateDoc(notifRef, { read: true });
  },

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string, notificationIds: string[]) {
    const batch = writeBatch(db);
    notificationIds.forEach(id => {
      const notifRef = doc(db, FIREBASE_ROUTES.USERS, userId, FIREBASE_ROUTES.NOTIFICATIONS, id);
      batch.update(notifRef, { read: true });
    });
    await batch.commit();
  }
};
