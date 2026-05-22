import React, { useState } from 'react';
import { Send, Image as ImageIcon, Smile, Search, MoreVertical, Info } from 'lucide-react';
import './styles.css';

// Interfaces mockadas (em breve Firebase)
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const mockContacts: ChatContact[] = [
  { id: '1', name: 'Ana Costa', avatar: 'https://ui-avatars.com/api/?name=Ana+Costa', lastMessage: 'Você pode me mandar o link do repositório?', time: '10:30', unread: 2 },
  { id: '2', name: 'Dr. Rafael Mendes', avatar: 'https://ui-avatars.com/api/?name=Rafael+Mendes', lastMessage: 'Muito interessante a abordagem fuzzy!', time: 'Ontem', unread: 0 },
];

const mockHistory: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: '1', text: 'Olá! Vi sua última publicação sobre Rizofiltração.', timestamp: '10:15' },
    { id: 'm2', senderId: 'me', text: 'Oi Ana! Muito obrigado.', timestamp: '10:20' },
    { id: 'm3', senderId: '1', text: 'Você pode me mandar o link do repositório?', timestamp: '10:30' },
  ],
  '2': [
    { id: 'm4', senderId: 'me', text: 'Acha que o P-Fuzzy resolve?', timestamp: '14:00' },
    { id: 'm5', senderId: '2', text: 'Muito interessante a abordagem fuzzy!', timestamp: 'Ontem' },
  ]
};

const Inbox: React.FC = () => {
  const [activeContactId, setActiveContactId] = useState<string | null>(mockContacts[0].id);
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState(mockHistory);

  const activeContact = mockContacts.find(c => c.id === activeContactId);
  const activeChat = activeContactId ? history[activeContactId] || [] : [];

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeContactId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me', // currentUser.uid
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));
    setInputText('');
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
          {mockContacts.map(contact => (
            <div 
              key={contact.id} 
              className={`inbox-contact-item ${activeContactId === contact.id ? 'active' : ''}`}
              onClick={() => setActiveContactId(contact.id)}
            >
              <img src={contact.avatar} alt={contact.name} className="inbox-contact-avatar" />
              <div className="inbox-contact-info">
                <div className="inbox-contact-top">
                  <h4>{contact.name}</h4>
                  <span className="inbox-contact-time">{contact.time}</span>
                </div>
                <div className="inbox-contact-bottom">
                  <p className="inbox-contact-lastmsg">{contact.lastMessage}</p>
                  {contact.unread > 0 && <span className="inbox-unread-badge">{contact.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Janela de Chat */}
      <main className="inbox-chat-window">
        {activeContact ? (
          <>
            <header className="inbox-chat-header">
              <div className="inbox-chat-header-user">
                <img src={activeContact.avatar} alt={activeContact.name} className="inbox-chat-header-avatar" />
                <div>
                  <h3>{activeContact.name}</h3>
                  <span className="inbox-chat-status">Online agora</span>
                </div>
              </div>
              <div className="inbox-chat-header-actions">
                <button className="inbox-icon-btn"><Info size={20} /></button>
                <button className="inbox-icon-btn"><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className="inbox-chat-history">
              {activeChat.map((msg) => {
                const isMe = msg.senderId === 'me'; // comparar com currentUser.uid futuramente
                return (
                  <div key={msg.id} className={`inbox-bubble-wrapper ${isMe ? 'me' : 'them'}`}>
                    {!isMe && (
                      <img src={activeContact.avatar} alt="Avatar" className="inbox-bubble-avatar" />
                    )}
                    <div className={`inbox-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                      <p>{msg.text}</p>
                      <span className="inbox-bubble-time">{msg.timestamp}</span>
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
