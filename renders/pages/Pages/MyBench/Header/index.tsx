import React from 'react';
import './styles.css';

interface HeaderProps {
  userName?: string;
  labStatus?: 'Aberto' | 'Fechado' | 'Manutenção';
  onlineMembersCount?: number;
  // TODO: Add avatars or online members list when the API is ready
}

const Header: React.FC<HeaderProps> = ({
  userName = 'Devair',
  labStatus = 'Aberto',
  onlineMembersCount = 4
}) => {
  return (
    <header className="mybench-header">
      <span className="mybench-header-kicker">VISÃO GERAL</span>
      <h1 className="mybench-header-title">Bem-vindo de volta ao<br />Laboratório, {userName}.</h1>
      <p className="mybench-header-subtitle">
        Seu espaço de trabalho está pronto. Você tem agendamentos próximos e<br />experimentos aguardando atualização na bancada.
      </p>

      <div className="mybench-status-badge">
        <div className="mybench-status-indicator">
          <span className={`status-dot ${labStatus.toLowerCase()}`}></span>
          <span className="status-text">Lab {labStatus}</span>
        </div>
        <div className="mybench-status-divider"></div>
        <div className="mybench-status-members">
          <span className="members-text">{onlineMembersCount} Membros Online</span>
          <div className="members-avatars">
            <div className="avatar-circle"></div>
            <div className="avatar-circle"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
