import React from 'react';
import type { LabMember } from '../../../../../src/types/lab';
import { handleImageError, DEFAULT_IMAGES } from '../../../../../src/utils/imageUtils';
import './styles.css';

interface HeaderProps {
  userName?: string;
  labStatus?: 'Aberto' | 'Fechado' | 'Manutenção';
  onlineMembersCount?: number;
  onlineMembers?: LabMember[];
  allMembers?: LabMember[];
  onOpenMembersModal?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName = 'Devair',
  labStatus = 'Aberto',
  onlineMembersCount = 1,
  onlineMembers = [],
  allMembers = [],
  onOpenMembersModal
}) => {
  // Exibir avatares dos membros online (ou dos primeiros membros do lab)
  const membersToDisplay = onlineMembers.length > 0 ? onlineMembers : allMembers;
  const displayAvatars = membersToDisplay.slice(0, 3);
  const remainingCount = membersToDisplay.length - displayAvatars.length;

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
        <div
          className={`mybench-status-members ${onOpenMembersModal ? 'clickable' : ''}`}
          onClick={onOpenMembersModal}
          title={onOpenMembersModal ? "Clique para ver membros e cargos do laboratório" : undefined}
          role={onOpenMembersModal ? "button" : undefined}
          tabIndex={onOpenMembersModal ? 0 : undefined}
          onKeyDown={e => {
            if (onOpenMembersModal && (e.key === 'Enter' || e.key === ' ')) {
              onOpenMembersModal();
            }
          }}
        >
          <span className="members-text">
            {onlineMembersCount} {onlineMembersCount === 1 ? 'Membro Online' : 'Membros Online'}
          </span>
          <div className="members-avatars">
            {displayAvatars.length > 0 ? (
              displayAvatars.map((member) => (
                <img
                  key={member.id}
                  src={member.avatar || DEFAULT_IMAGES.avatar(member.name)}
                  alt={member.name}
                  className="avatar-img"
                  title={`${member.name} (${member.role || 'Membro'})${member.isOnline ? ' - Online' : ''}`}
                  onError={(e) => handleImageError(e, DEFAULT_IMAGES.avatar(member.name))}
                />
              ))
            ) : (
              <div className="avatar-circle"></div>
            )}
            {remainingCount > 0 && (
              <div className="avatar-circle avatar-more" title={`+${remainingCount} membros`}>
                +{remainingCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
