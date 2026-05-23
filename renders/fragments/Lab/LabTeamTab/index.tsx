import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, ShieldAlert, Check, X as XIcon, Plus } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
// import { useAuth } from '../../../../src/contexts/AuthContext';
import './styles.css';

interface LabTeamTabProps {
  mode?: 'public' | 'manage';
  labId?: string;
}

const LabTeamTab: React.FC<LabTeamTabProps> = ({ mode = 'manage', labId }) => {
  // const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'membros' | 'solicitacoes' | 'hierarquia'>('membros');

  // Estados de dados
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI (Recusa)
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // Estados de UI (Hierarquia)
  const [newRoleName, setNewRoleName] = useState('');
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  useEffect(() => {
    if (!labId) return;
    fetchData();
  }, [labId, activeTab]); // Recarrega ao trocar aba para dados sempre frescos

  const fetchData = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      if (activeTab === 'membros') {
        // Busca usuários afiliados a este lab
        const q = query(collection(db, 'users'), where('lab.id', '==', labId));
        const snap = await getDocs(q);
        const mems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMembers(mems);
      } 
      else if (activeTab === 'solicitacoes') {
        const q = query(collection(db, 'lab_requests'), where('labId', '==', labId), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        setRequests(snap.docs.map(d => ({ reqId: d.id, ...d.data() })));
      }
      else if (activeTab === 'hierarquia') {
        const labDoc = await getDoc(doc(db, 'labs', labId));
        if (labDoc.exists()) {
          setRoles(labDoc.data().customRoles || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if(role?.toLowerCase().includes('admin') || role?.toLowerCase() === 'pi') return <span className="lab-role-badge admin"><ShieldAlert size={12} /> {role}</span>;
    if(role?.toLowerCase().includes('pesquisador')) return <span className="lab-role-badge editor"><Edit2 size={12} /> {role}</span>;
    if(role?.toLowerCase().includes('técnico') || role?.toLowerCase().includes('tecnico')) return <span className="lab-role-badge tech">{role}</span>;
    return <span className="lab-role-badge viewer">{role || 'Membro'}</span>;
  };

  // ==============================
  // AÇÕES: SOLICITAÇÕES
  // ==============================
  const handleAcceptRequest = async (req: any) => {
    try {
      // 1. Atualizar request
      await updateDoc(doc(db, 'lab_requests', req.reqId), { status: 'accepted' });
      // 2. Atualizar user profile
      await updateDoc(doc(db, 'users', req.userId), {
        lab: {
          id: labId,
          name: req.labName,
          role: 'Pesquisador' // Cargo padrão ao entrar
        }
      });
      alert('Usuário aceito com sucesso!');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Erro ao aceitar solicitação.');
    }
  };

  const handleRejectConfirm = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'lab_requests', reqId), { 
        status: 'rejected',
        feedback: rejectFeedback 
      });
      setRejectingId(null);
      setRejectFeedback('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // ==============================
  // AÇÕES: MEMBROS
  // ==============================
  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário do laboratório?')) return;
    try {
      // Remove o vínculo no perfil do usuário
      await updateDoc(doc(db, 'users', userId), {
        lab: null
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // ==============================
  // AÇÕES: HIERARQUIA
  // ==============================
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newRoleName || !labId) return;
    try {
      const newRole = { name: newRoleName, permissions: [] };
      await updateDoc(doc(db, 'labs', labId), {
        customRoles: arrayUnion(newRole)
      });
      setNewRoleName('');
      setIsCreatingRole(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // RENDER PÚBLICO (Apenas Membros)
  if (mode === 'public') {
    return (
      <div className="lab-team-tab anim-fade-up">
        <div className="lab-team-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div>
            <h3>Equipe do Laboratório</h3>
            <p>Conheça os pesquisadores e alunos que fazem parte deste hub.</p>
          </div>
        </div>
        <div className="lab-team-list">
          {members.map(member => (
            <div key={member.id} className="lab-team-card public-hover" style={{cursor: 'pointer'}}>
              <div className="member-avatar">
                <img src={member.avatar || "https://ui-avatars.com/api/?name=" + member.name.replace(' ', '+')} alt={member.name} />
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <span>{member.email}</span>
              </div>
              <div className="member-role">
                {getRoleBadge(member.lab?.role)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // RENDER MANAGE (Workspace)
  return (
    <div className="lab-team-tab anim-fade-up">
      <div className="lab-team-header">
        <div>
          <h3>Gestão da Equipe</h3>
          <p>Gerencie membros, solicitações de entrada e defina as permissões de acesso.</p>
        </div>
      </div>

      <div className="lab-team-nav-tabs">
        <button className={activeTab === 'membros' ? 'active' : ''} onClick={() => setActiveTab('membros')}>Membros</button>
        <button className={activeTab === 'solicitacoes' ? 'active' : ''} onClick={() => setActiveTab('solicitacoes')}>Solicitações {requests.length > 0 && <span className="badge">{requests.length}</span>}</button>
        <button className={activeTab === 'hierarquia' ? 'active' : ''} onClick={() => setActiveTab('hierarquia')}>Hierarquia de Cargos</button>
      </div>

      <div className="lab-team-content">
        {loading ? (
          <p className="loading-msg">Carregando dados...</p>
        ) : (
          <>
            {/* ABA MEMBROS */}
            {activeTab === 'membros' && (
              <div className="lab-team-list">
                {members.length === 0 ? <p className="empty-msg">Nenhum membro encontrado.</p> : members.map(member => (
                  <div key={member.id} className="lab-team-card">
                    <div className="member-avatar">
                      <img src={member.avatar || "https://ui-avatars.com/api/?name=" + member.name.replace(' ', '+')} alt={member.name} />
                    </div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <span>{member.email}</span>
                    </div>
                    <div className="member-role">
                      {getRoleBadge(member.lab?.role)}
                    </div>
                    <div className="member-actions">
                      <button className="action-btn-danger" onClick={() => handleRemoveMember(member.id)} title="Remover Membro">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ABA SOLICITAÇÕES */}
            {activeTab === 'solicitacoes' && (
              <div className="lab-requests-list">
                {requests.length === 0 ? <p className="empty-msg">Nenhuma solicitação pendente no momento.</p> : requests.map(req => (
                  <div key={req.reqId} className="lab-request-card">
                    <div className="req-header">
                      <h4>{req.userName}</h4>
                      <span>RA: {req.ra} • {req.course}</span>
                    </div>
                    <p className="req-letter">"{req.coverLetter}"</p>
                    
                    {rejectingId === req.reqId ? (
                      <div className="req-reject-box">
                        <textarea 
                          placeholder="Digite o motivo da recusa (feedback ao candidato)..."
                          value={rejectFeedback}
                          onChange={e => setRejectFeedback(e.target.value)}
                        />
                        <div className="req-reject-actions">
                          <button className="cmmt-btn-primary" style={{background: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleRejectConfirm(req.reqId)}>Confirmar Recusa</button>
                          <button className="cmmt-btn-outline" onClick={() => setRejectingId(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="req-actions">
                        <button className="btn-accept" onClick={() => handleAcceptRequest(req)}>
                          <Check size={16} /> Aceitar
                        </button>
                        <button className="btn-reject" onClick={() => setRejectingId(req.reqId)}>
                          <XIcon size={16} /> Recusar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ABA HIERARQUIA */}
            {activeTab === 'hierarquia' && (
              <div className="lab-hierarchy-list">
                <div className="hierarchy-toolbar">
                  {isCreatingRole ? (
                    <form className="create-role-form" onSubmit={handleCreateRole}>
                      <input type="text" placeholder="Nome do Cargo (Ex: Bolsista IC)" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} required />
                      <button type="submit" className="cmmt-btn-primary">Salvar</button>
                      <button type="button" className="cmmt-btn-outline" onClick={() => setIsCreatingRole(false)}>Cancelar</button>
                    </form>
                  ) : (
                    <button className="cmmt-btn-outline" onClick={() => setIsCreatingRole(true)}>
                      <Plus size={16} /> Criar Novo Cargo
                    </button>
                  )}
                </div>

                <table className="hierarchy-table">
                  <thead>
                    <tr>
                      <th>Cargo / Papel</th>
                      <th>Gerir Equipe</th>
                      <th>Editar Projetos</th>
                      <th>Gerir Inventário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.length === 0 ? (
                      <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>Nenhum cargo configurado.</td></tr>
                    ) : roles.map((role, idx) => (
                      <tr key={idx}>
                        <td><strong>{role.name}</strong></td>
                        <td><input type="checkbox" defaultChecked={role.permissions?.includes('manage_team')} disabled /></td>
                        <td><input type="checkbox" defaultChecked={role.permissions?.includes('manage_projects')} disabled /></td>
                        <td><input type="checkbox" defaultChecked={role.permissions?.includes('manage_inventory')} disabled /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="hierarchy-note">* A edição de permissões via checkboxes será liberada na próxima atualização de segurança.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LabTeamTab;
