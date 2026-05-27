import { collection, doc, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type { IUser } from '../types/index';

export interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: any;
  users?: Record<string, Partial<IUser>>; // Cache de dados dos usuários (nome, avatar) para leitura rápida
  unreadCount?: Record<string, number>;
}

const CHATS_COLLECTION = 'chats';

export const chatService = {
  // Inicializa ou recupera um chat entre dois usuários
  async getOrCreateChat(currentUserId: string, targetUserId: string, currentUserData: Partial<IUser>, targetUserData: Partial<IUser>): Promise<string> {
    const q = query(
      collection(db, CHATS_COLLECTION), 
      where('participants', 'array-contains', currentUserId)
    );
    const snap = await getDocs(q);
    
    // Filtra pelo targetUserId no client (já que o Firestore limita consultas array-contains-any)
    let existingChatId: string | null = null;
    snap.forEach(doc => {
      const data = doc.data() as ChatRoom;
      if (data.participants.includes(targetUserId)) {
        existingChatId = doc.id;
      }
    });

    if (existingChatId) {
      return existingChatId;
    }

    // Cria um novo chat se não existir
    const chatRef = doc(collection(db, CHATS_COLLECTION));
    const newChat: Partial<ChatRoom> = {
      participants: [currentUserId, targetUserId],
      lastMessage: '',
      updatedAt: serverTimestamp(),
      users: {
        [currentUserId]: { name: currentUserData.name, avatar: currentUserData.avatar },
        [targetUserId]: { name: targetUserData.name, avatar: targetUserData.avatar }
      },
      unreadCount: {
        [currentUserId]: 0,
        [targetUserId]: 0
      }
    };
    
    await setDoc(chatRef, newChat);
    return chatRef.id;
  },

  // Escuta a lista de contatos/chats do usuário
  subscribeToChats(userId: string, callback: (chats: ChatRoom[]) => void) {
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const chats: ChatRoom[] = [];
      snap.forEach(doc => {
        chats.push({ id: doc.id, ...doc.data() } as ChatRoom);
      });
      callback(chats);
    });
  },

  // Escuta as mensagens de um chat
  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, CHATS_COLLECTION, chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snap) => {
      const messages: ChatMessage[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      callback(messages);
    });
  },

  // Envia uma nova mensagem
  async sendMessage(chatId: string, senderId: string, targetId: string, text: string) {
    const msgRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
    await addDoc(msgRef, {
      senderId,
      text,
      createdAt: serverTimestamp()
    });

    // Atualiza o lastMessage e unread do chatRoom
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      lastMessage: text,
      updatedAt: serverTimestamp(),
      [`unreadCount.${targetId}`]: increment(1)
    });
  },

  // Marca as mensagens como lidas
  async markAsRead(chatId: string, currentUserId: string) {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${currentUserId}`]: 0
    });
  }
};
