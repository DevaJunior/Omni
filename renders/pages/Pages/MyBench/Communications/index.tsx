import React from 'react';
import './styles.css';

export interface Message {
  id: string;
  senderName: string;
  senderInitials?: string;
  senderAvatarUrl?: string;
  time: string;
  content: string;
}

interface CommunicationsProps {
  messages?: Message[];
  hasUnread?: boolean;
}

const defaultMessages: Message[] = [
  {
    id: '1',
    senderName: 'Grupo Lab',
    senderInitials: 'G',
    time: 'Agora',
    content: 'Carlos: As fotos já estão na pasta partilhada.'
  },
  {
    id: '2',
    senderName: 'Ana Silva',
    senderAvatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=8b0000&color=fff',
    time: '10:42',
    content: 'Deixei os reagentes na tua bancada.'
  }
];

const Communications: React.FC<CommunicationsProps> = ({
  messages = defaultMessages,
  hasUnread = true
}) => {
  return (
    <div className="mybench-card mybench-comms-card">
      <div className="comms-header">
        <h4>Comunicações</h4>
        {hasUnread && <span className="comms-dot"></span>}
      </div>

      <div className="comms-list">
        {messages.map(msg => (
          <div key={msg.id} className="comm-item">
            {msg.senderAvatarUrl ? (
              <div className="comm-avatar avatar-img">
                <img src={msg.senderAvatarUrl} alt={msg.senderName} />
              </div>
            ) : (
              <div className="comm-avatar avatar-gray">
                {msg.senderInitials || msg.senderName.charAt(0)}
              </div>
            )}
            <div className="comm-content">
              <div className="comm-meta">
                <h5>{msg.senderName}</h5>
                <span className="comm-time">{msg.time}</span>
              </div>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Communications;
