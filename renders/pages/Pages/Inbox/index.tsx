import React, { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Smile, Search, MoreVertical, Info } from 'lucide-react';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { chatService } from '../../../../src/services/chatService';
import type { ChatRoom, ChatMessage } from '../../../../src/services/chatService';
import './styles.css';

const Inbox: React.FC = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // 1. Carregar lista de conversas
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = chatService.subscribeToChats(currentUser.uid, (data) => {
      setChats(data);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 2. Carregar mensagens quando um chat for selecionado
  useEffect(() => {
    if (!activeChatId || !currentUser) {
      setMessages([]);
      return;
    }
    
    // Marca como lido localmente e no Firebase
    chatService.markAsRead(activeChatId, currentUser.uid);

    const unsubscribe = chatService.subscribeToMessages(activeChatId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeChatId, currentUser]);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Obtem os dados do contato baseado no dicionario de "users" no chatRoom
  const getContactInfo = (chat: ChatRoom) => {
    if (!currentUser || !chat.users) return { name: 'Desconhecido', avatar: '' };
    
    // O contato é a chave que não é o currentUser.uid
    const contactId = chat.participants.find(id => id !== currentUser.uid) || currentUser.uid;
    const contactData = chat.users[contactId];
    
    return {
      id: contactId,
      name: contactData?.name || 'Desconhecido',
      avatar: contactData?.avatar || `https://ui-avatars.com/api/?name=User`
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId || !currentUser) return;
    
    const textToSend = inputText.trim();
    setInputText(''); // Limpa o input rápido por UX
    
    const contactId = activeChat?.participants.find(id => id !== currentUser.uid) || currentUser.uid;

    try {
      await chatService.sendMessage(activeChatId, currentUser.uid, contactId, textToSend);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const formatTime = (dateObj: any) => {
    if (!dateObj) return '';
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="inbox-container">
      {/* Sidebar - Lista de Conversas */}
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-header">
          <h2>Mensagens</h2>
        </div>
        <div className="inbox-search-wrapper">
          <Search size={18} />
          <input type="text" placeholder="Buscar nas conversas..." />
        </div>
        <div className="inbox-contacts-list">
          {chats.map(chat => {
            const contact = getContactInfo(chat);
            const unreadCount = chat.unreadCount?.[currentUser?.uid || ''] || 0;
            
            return (
              <div 
                key={chat.id} 
                className={`inbox-contact-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <img src={contact.avatar} alt={contact.name} className="inbox-contact-avatar" />
                <div className="inbox-contact-info">
                  <div className="inbox-contact-top">
                    <h4>{contact.name}</h4>
                    <span className="inbox-contact-time">
                      {chat.updatedAt ? formatTime(chat.updatedAt) : ''}
                    </span>
                  </div>
                  <div className="inbox-contact-bottom">
                    <p className="inbox-contact-lastmsg">{chat.lastMessage}</p>
                    {unreadCount > 0 && <span className="inbox-unread-badge">{unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          
          {chats.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '0.9rem' }}>
              Nenhuma conversa iniciada. Acesse o perfil de um pesquisador para enviar uma mensagem.
            </p>
          )}
        </div>
      </aside>

      {/* Janela de Chat */}
      <main className="inbox-chat-window">
        {activeChat ? (
          <>
            <header className="inbox-chat-header">
              <div className="inbox-chat-header-user">
                <img src={getContactInfo(activeChat).avatar} alt={getContactInfo(activeChat).name} className="inbox-chat-header-avatar" />
                <div>
                  <h3>{getContactInfo(activeChat).name}</h3>
                  <span className="inbox-chat-status">Online agora</span>
                </div>
              </div>
              <div className="inbox-chat-header-actions">
                <button className="inbox-icon-btn"><Info size={20} /></button>
                <button className="inbox-icon-btn"><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className="inbox-chat-history">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.uid;
                const contactInfo = getContactInfo(activeChat);
                
                return (
                  <div key={msg.id} className={`inbox-bubble-wrapper ${isMe ? 'me' : 'them'}`}>
                    {!isMe && (
                      <img src={contactInfo.avatar} alt="Avatar" className="inbox-bubble-avatar" />
                    )}
                    <div className={`inbox-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                      <p>{msg.text}</p>
                      <span className="inbox-bubble-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="inbox-chat-input-area">
              <button className="inbox-icon-btn"><ImageIcon size={20} /></button>
              <button className="inbox-icon-btn"><Smile size={20} /></button>
              <input 
                type="text" 
                placeholder="Escreva uma mensagem..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className="inbox-btn-send"
                onClick={handleSendMessage}
                disabled={inputText.trim().length === 0}
              >
                <Send size={18} />
              </button>
            </footer>
          </>
        ) : (
          <div className="inbox-empty-state">
            <div className="inbox-empty-icon">
               <Send size={48} />
            </div>
            <h2>Suas Mensagens</h2>
            <p>Selecione um contato na lista ao lado ou inicie uma nova conversa.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inbox;
