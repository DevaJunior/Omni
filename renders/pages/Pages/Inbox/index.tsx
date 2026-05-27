import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, Search, MoreVertical, Info, Edit, Phone, Video, X, Paperclip, FileText, Check, CheckCheck, ArrowLeft } from 'lucide-react';
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
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      setShowDetails(false);
      return;
    }
    
    // Marca como lido localmente e no Firebase
    chatService.markAsRead(activeChatId, currentUser.uid);

    const unsubscribe = chatService.subscribeToMessages(activeChatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
    });
    return () => unsubscribe();
  }, [activeChatId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  // Obtem os dados do contato baseado no dicionario de "users" no chatRoom
  const getContactInfo = (chat: ChatRoom) => {
    if (!currentUser || !chat.users) return { name: 'Desconhecido', avatar: '', headline: 'Pesquisador', department: 'Depto. de Biotecnologia' };
    
    // O contato é a chave que não é o currentUser.uid
    const contactId = chat.participants.find(id => id !== currentUser.uid) || currentUser.uid;
    const contactData = chat.users[contactId];
    
    return {
      id: contactId,
      name: contactData?.name || 'Desconhecido',
      avatar: contactData?.avatar || `https://ui-avatars.com/api/?name=User`,
      headline: contactData?.headline || 'Pesquisador Sênior',
      department: 'Depto. de Biotecnologia' // Mockado para UI
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId || !currentUser) return;
    
    const textToSend = inputText.trim();
    setInputText(''); // Limpa o input rápido por UX
    
    const contactId = activeChat?.participants.find(id => id !== currentUser.uid) || currentUser.uid;

    try {
      await chatService.sendMessage(activeChatId, currentUser.uid, contactId, textToSend);
      scrollToBottom();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const formatTime = (dateObj: any) => {
    if (!dateObj) return '';
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return '';
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  };

  const contactInfo = activeChat ? getContactInfo(activeChat) : null;

  return (
    <div className={`inbox-container ${showDetails ? 'showing-details' : ''} ${activeChatId ? 'mobile-chat-active' : 'mobile-sidebar-active'}`}>
      {/* Sidebar - Lista de Conversas */}
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-header">
          <h2>Mensagens</h2>
          <button className="inbox-icon-btn"><Edit size={18} /></button>
        </div>
        <div className="inbox-search-wrapper">
          <div className="inbox-search-box">
            <Search size={16} />
            <input type="text" placeholder="Buscar conversas..." />
          </div>
        </div>
        <div className="inbox-contacts-list">
          {chats.map(chat => {
            const contact = getContactInfo(chat);
            const unreadCount = chat.unreadCount?.[currentUser?.uid || ''] || 0;
            const isActive = activeChatId === chat.id;
            
            return (
              <div 
                key={chat.id} 
                className={`inbox-contact-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="inbox-contact-avatar-wrapper">
                  <img src={contact.avatar} alt={contact.name} className="inbox-contact-avatar" />
                  <span className="inbox-online-dot"></span>
                </div>
                <div className="inbox-contact-info">
                  <div className="inbox-contact-top">
                    <h4>{contact.name}</h4>
                    <span className="inbox-contact-time">
                      {chat.updatedAt ? formatTime(chat.updatedAt) : ''}
                    </span>
                  </div>
                  <div className="inbox-contact-bottom">
                    <p className={`inbox-contact-lastmsg ${unreadCount > 0 ? 'unread' : ''}`}>{chat.lastMessage}</p>
                    {unreadCount > 0 && <span className="inbox-unread-badge">{unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          
          {chats.length === 0 && (
            <p className="inbox-empty-text">
              Nenhuma conversa iniciada. Acesse o perfil de um pesquisador para enviar uma mensagem.
            </p>
          )}
        </div>
      </aside>

      {/* Janela de Chat */}
      <main className="inbox-chat-window">
        {activeChat && contactInfo ? (
          <>
            <header className="inbox-chat-header">
              <div className="inbox-chat-header-user">
                <button className="inbox-mobile-back-btn" onClick={() => { setActiveChatId(null); setShowDetails(false); }}>
                  <ArrowLeft size={20} />
                </button>
                <img src={getContactInfo(activeChat).avatar} alt={getContactInfo(activeChat).name} className="inbox-chat-header-avatar" />
                <div>
                  <h3>{contactInfo.name}</h3>
                  <div className="inbox-chat-status">
                    <span className="inbox-online-dot"></span>
                    Online agora
                  </div>
                </div>
              </div>
              <div className="inbox-chat-header-actions">
                <button className="inbox-icon-btn"><Phone size={18} /></button>
                <button className="inbox-icon-btn"><Video size={18} /></button>
                <button className={`inbox-icon-btn info-btn ${showDetails ? 'active' : ''}`} onClick={() => setShowDetails(!showDetails)}>
                  <Info size={18} />
                </button>
              </div>
            </header>

            <div className="inbox-chat-history">
              {messages.length > 0 && (
                <div className="inbox-date-separator">
                  <span>{formatDate(messages[0].createdAt)}</span>
                </div>
              )}
              
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.uid;
                
                return (
                  <div key={msg.id} className={`inbox-bubble-wrapper ${isMe ? 'me' : 'them'}`}>
                    <div className={`inbox-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                      <p>{msg.text}</p>
                    </div>
                    <span className="inbox-bubble-time">
                      {formatTime(msg.createdAt)} 
                      {isMe && <CheckCheck size={14} className="inbox-read-check" />}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <footer className="inbox-chat-input-area">
              <div className="inbox-input-wrapper">
                <button className="inbox-input-icon"><Paperclip size={18} /></button>
                <input 
                  type="text" 
                  placeholder="Escreva uma mensagem..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="inbox-input-icon"><ImageIcon size={18} /></button>
              </div>
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

      {/* Janela de Detalhes (Opcional) */}
      {showDetails && activeChat && contactInfo && (
        <aside className={`inbox-details-sidebar ${showDetails ? 'mobile-visible' : ''}`}>
          <header className="inbox-details-header">
            <h3>Detalhes</h3>
            <button className="inbox-icon-btn" onClick={() => setShowDetails(false)}><X size={18} /></button>
          </header>
          
          <div className="inbox-details-profile">
            <img src={contactInfo.avatar} alt={contactInfo.name} className="inbox-details-avatar" />
            <h4>{contactInfo.name}</h4>
            <p className="inbox-details-role">{contactInfo.headline}</p>
            <p className="inbox-details-dept">{contactInfo.department}</p>
          </div>

          <div className="inbox-details-files-section">
            <div className="inbox-details-files-header">
              <h5>ARQUIVOS RECENTES</h5>
              <a href="#">Ver todos</a>
            </div>
            
            <div className="inbox-file-item">
              <div className="inbox-file-icon blue"><FileText size={18} /></div>
              <div className="inbox-file-info">
                <h6>Matriz_PFuzzy_v2.csv</h6>
                <span>2.4 MB • Hoje, 10:20</span>
              </div>
            </div>
            
            <div className="inbox-file-item">
              <div className="inbox-file-icon orange"><FileText size={18} /></div>
              <div className="inbox-file-info">
                <h6>Relatorio_Preliminar.pdf</h6>
                <span>1.1 MB • Ontem</span>
              </div>
            </div>
          </div>

          <div className="inbox-details-search">
            <div className="inbox-search-box">
              <input type="text" placeholder="Buscar nesta conversa" />
              <Search size={16} />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Inbox;
