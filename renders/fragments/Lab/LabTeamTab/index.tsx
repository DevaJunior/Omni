import React, { useState } from 'react';
import { UserPlus, Mail, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import './styles.css';

interface TeamMember {
  id: string;
  name: string;
  role: 'Admin' | 'Pesquisador' | 'Aluno' | 'Técnico';
  email: string;
  avatar: string;
  status: 'Ativo' | 'Pendente';
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Dra. Helena Ribeiro', role: 'Admin', email: 'helena.ribeiro@unifal.edu.br', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', status: 'Ativo' },
  { id: '2', name: 'Devair Junior', role: 'Pesquisador', email: 'contatodevairjunior@gmail.com', avatar: 'https://ui-avatars.com/api/?name=Devair+Junior', status: 'Ativo' },
  { id: '3', name: 'Carlos Eduardo', role: 'Aluno', email: 'carlos.eduardo@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791', status: 'Ativo' },
  { id: '4', name: 'Ana Costa', role: 'Técnico', email: 'ana.costa@lab.com', avatar: '', status: 'Pendente' }
];

const getRoleBadge = (role: TeamMember['role']) => {
  switch (role) {
    case 'Admin': return <span className="lab-role-badge admin"><ShieldAlert size={12} /> PI / Admin</span>;
    case 'Pesquisador': return <span className="lab-role-badge editor"><Edit2 size={12} /> Pesquisador</span>;
    case 'Aluno': return <span className="lab-role-badge viewer">Aluno</span>;
    case 'Técnico': return <span className="lab-role-badge tech">Técnico</span>;
    default: return null;
  }
};

const LabTeamTab: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>(mockTeam);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Aluno');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'Convite Pendente',
      role: inviteRole,
      email: inviteEmail,
      avatar: '',
      status: 'Pendente'
    };
    
    setMembers([...members, newMember]);
    setInviteEmail('');
    setShowInviteForm(false);
    alert('Convite enviado para ' + inviteEmail);
  };

  const handleRemove = (id: string) => {
    if(confirm('Tem certeza que deseja remover este membro do laboratório?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="lab-team-tab anim-fade-up">
      <div className="lab-team-header">
        <div>
          <h3>Membros e Hierarquia</h3>
          <p>Gerencie o acesso ao laboratório, cadernos e repositórios de dados.</p>
        </div>
        <button className="cmmt-btn-primary" onClick={() => setShowInviteForm(!showInviteForm)}>
          <UserPlus size={18} style={{ marginRight: '8px' }} /> Convidar Membro
        </button>
      </div>

      {showInviteForm && (
        <form className="lab-invite-form" onSubmit={handleInvite}>
          <h4>Enviar Convite</h4>
          <div className="invite-inputs">
            <div className="invite-input-group">
              <Mail size={16} />
              <input 
                type="email" 
                placeholder="E-mail institucional ou Omni" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <select 
              value={inviteRole} 
              onChange={e => setInviteRole(e.target.value as TeamMember['role'])}
              className="invite-role-select"
            >
              <option value="Admin">Admin (PI)</option>
              <option value="Pesquisador">Pesquisador (Edição Completa)</option>
              <option value="Técnico">Técnico (Equipamentos/Inventário)</option>
              <option value="Aluno">Aluno (Acesso restrito/Visualizador)</option>
            </select>
            <button type="submit" className="cmmt-btn-primary">Enviar</button>
            <button type="button" className="cmmt-btn-outline" onClick={() => setShowInviteForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="lab-team-list">
        {members.map(member => (
          <div key={member.id} className="lab-team-card">
            <div className="member-avatar">
              <img src={member.avatar || "https://ui-avatars.com/api/?name=" + member.name.replace(' ', '+')} alt={member.name} />
              {member.status === 'Pendente' && <span className="pending-badge">Pendente</span>}
            </div>
            
            <div className="member-info">
              <h4>{member.name}</h4>
              <span>{member.email}</span>
            </div>

            <div className="member-role">
              {getRoleBadge(member.role)}
            </div>

            <div className="member-actions">
              <button className="action-btn-danger" onClick={() => handleRemove(member.id)} title="Remover Membro">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabTeamTab;
