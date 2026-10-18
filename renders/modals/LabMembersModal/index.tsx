import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Users,
  Search,
  ShieldAlert,
  FlaskConical,
  GraduationCap,
  Wrench,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import type { LabMember } from '../../../src/types/lab';
import OmniLoader from '../../components/OmniLoader';
import './styles.css';

interface LabMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: LabMember[];
  labName?: string;
  loading?: boolean;
}

const LabMembersModal: React.FC<LabMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  labName = 'Laboratório',
  loading = false
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fechar no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Filtragem dos membros
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(
      m =>
        m.name?.toLowerCase().includes(term) ||
        m.role?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.headline?.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  const onlineCount = useMemo(() => {
    return members.filter(m => m.isOnline).length;
  }, [members]);

  if (!isOpen) return null;

  const getRoleBadge = (role?: string) => {
    const r = (role || 'Membro').toLowerCase();
    if (r.includes('admin') || r.includes('pi') || r.includes('coordenador')) {
      return (
        <span className="lmm-role-badge admin">
          <ShieldAlert size={13} /> {role || 'Admin / PI'}
        </span>
      );
    }
    if (r.includes('pesquisador') || r.includes('docente') || r.includes('doutor')) {
      return (
        <span className="lmm-role-badge researcher">
          <FlaskConical size={13} /> {role}
        </span>
      );
    }
    if (r.includes('técnico') || r.includes('tecnico') || r.includes('analista')) {
      return (
        <span className="lmm-role-badge tech">
          <Wrench size={13} /> {role}
        </span>
      );
    }
    return (
      <span className="lmm-role-badge student">
        <GraduationCap size={13} /> {role || 'Aluno / Bolsista'}
      </span>
    );
  };

  const handleNavigateProfile = (memberId: string) => {
    onClose();
    navigate(`/profile/${memberId}`);
  };

  return (
    <div className="lmm-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lmm-modal-content" onClick={e => e.stopPropagation()}>
        <button className="lmm-btn-close" onClick={onClose} aria-label="Fechar modal">
          <X size={18} />
        </button>

        {/* CABEÇALHO */}
        <div className="lmm-header">
          <div className="lmm-icon-box">
            <Users size={24} />
          </div>
          <div className="lmm-header-text">
            <h2>Membros do Laboratório</h2>
            <p>{labName} • Equipe e cargos ativos</p>
          </div>
        </div>

        {/* BARRA DE PESQUISA & STATUS */}
        <div className="lmm-toolbar">
          <div className="lmm-search-box">
            <Search size={16} className="lmm-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, cargo ou e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="lmm-search-input"
              autoFocus
            />
          </div>
          <span className="lmm-stats-pill">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'Membro' : 'Membros'} ({onlineCount} online)
          </span>
        </div>

        {/* LISTA DE MEMBROS */}
        <div className="lmm-members-list">
          {loading ? (
            <OmniLoader
              variant="section"
              size="sm"
              icon="atom"
              message="Carregando membros..."
              submessage="Sincronizando equipe do laboratório..."
              showLine={false}
            />
          ) : filteredMembers.length === 0 ? (
            <div className="lmm-empty">
              {searchTerm ? `Nenhum membro encontrado para "${searchTerm}".` : 'Nenhum membro cadastrado neste laboratório.'}
            </div>
          ) : (
            filteredMembers.map(member => {
              const isCurrentUser = userProfile?.id === member.id;
              return (
                <div
                  key={member.id}
                  className="lmm-member-card"
                  onClick={() => handleNavigateProfile(member.id)}
                  title={`Ver perfil de ${member.name}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="lmm-member-left">
                    <div className="lmm-avatar-wrapper">
                      <img
                        src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`}
                        alt={member.name}
                        className="lmm-avatar"
                      />
                      <span
                        className={`lmm-status-dot ${member.isOnline ? 'online' : 'offline'}`}
                        title={member.isOnline ? 'Online agora' : 'Offline'}
                      />
                    </div>
                    <div className="lmm-member-details">
                      <div className="lmm-name-row">
                        <span className="lmm-name">{member.name}</span>
                        {isCurrentUser && <span className="lmm-you-badge">Você</span>}
                      </div>
                      <span className="lmm-headline">
                        {member.headline || member.department || member.email || 'Pesquisador'}
                      </span>
                    </div>
                  </div>

                  <div className="lmm-member-right">
                    {getRoleBadge(member.role)}
                    <button
                      className="lmm-btn-profile"
                      onClick={() => handleNavigateProfile(member.id)}
                      title="Ver Perfil"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RODAPÉ */}
        <div className="lmm-footer">
          <span className="lmm-footer-info">
            Total de {members.length} {members.length === 1 ? 'membro cadastrado' : 'membros cadastrados'}
          </span>
          <button className="lmm-btn-close-action" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabMembersModal;
