import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, ShieldAlert, Check, X as XIcon, Plus, Copy, CheckCircle2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import { useAuth } from '../../../../src/contexts/AuthContext';
import NewRoleModal from '../../../modals/NewRoleModal';
import './styles.css';

interface LabTeamTabProps {
  mode?: 'public' | 'manage';
  labId?: string;
}

const LabTeamTab: React.FC<LabTeamTabProps> = ({ mode = 'manage', labId }) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'membros' | 'solicitacoes' | 'hierarquia'>('solicitacoes');

  // Estados de dados
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI (Recusa)
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // Estados de UI (Hierarquia)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  useEffect(() => {
    if (!labId) return;
    fetchData();
  }, [labId, activeTab]);

  const fetchData = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const labDoc = await getDoc(doc(db, 'labs', labId));
      let currentRoles: any[] = [];
      if (labDoc.exists()) {
        currentRoles = labDoc.data().customRoles || [];
        setRoles(currentRoles);
      }

      if (activeTab === 'membros') {
        try {
          const q = query(collection(db, 'users'), where('lab.id', '==', labId));
          const snap = await getDocs(q);
          let mems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Garante que o Admin/Criador apareça na lista caso a query falhe ou não o retorne
          if (userProfile && userProfile.lab?.id === labId) {
            if (!mems.some(m => m.id === userProfile.id)) {
              mems.unshift(userProfile);
            }
          }
          setMembers(mems);
        } catch (e) {
          console.error("Erro ao buscar membros:", e);
          if (userProfile && userProfile.lab?.id === labId) {
            setMembers([userProfile]);
          } else {
            setMembers([]);
          }
        }
      }
      else if (activeTab === 'solicitacoes') {
        const q = query(collection(db, 'lab_requests'), where('labId', '==', labId), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        setRequests(snap.docs.map(d => ({ reqId: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role?.toLowerCase().includes('admin') || role?.toLowerCase() === 'pi') return <span className="lab-role-badge admin"><ShieldAlert size={12} /> {role}</span>;
    if (role?.toLowerCase().includes('pesquisador')) return <span className="lab-role-badge editor"><Edit2 size={12} /> {role}</span>;
    if (role?.toLowerCase().includes('técnico') || role?.toLowerCase().includes('tecnico')) return <span className="lab-role-badge tech">{role}</span>;
    return <span className="lab-role-badge viewer">{role || 'Membro'}</span>;
  };

  // ==============================
  // AÇÕES: SOLICITAÇÕES
  // ==============================
  const handleAcceptRequest = async (req: any) => {
    try {
      await updateDoc(doc(db, 'lab_requests', req.reqId), { status: 'accepted' });
      await updateDoc(doc(db, 'users', req.userId), {
        lab: {
          id: labId,
          name: req.labName,
          role: 'Pesquisador'
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
      await updateDoc(doc(db, 'users', userId), {
        lab: null
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeRole = async (userId: string, newRoleName: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'lab.role': newRoleName
      });
      // Update local state temporarily for immediate feedback
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, lab: { ...m.lab, role: newRoleName } } : m));
    } catch (e) {
      console.error("Erro ao mudar cargo", e);
      alert("Erro ao alterar cargo do membro.");
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/lab/${labId}/join`;
    navigator.clipboard.writeText(link);
    alert('Link de convite copiado!');
  };

  // ==============================
  // AÇÕES: HIERARQUIA
  // ==============================
  const handleCreateRoleFromModal = async (roleName: string, permissions: string[], originalName?: string) => {
    if (!labId) return;
    try {
      const newRole = { name: roleName, permissions: permissions };
      if (originalName) {
        // Edit existing role
        const updatedRoles = roles.map(r => r.name === originalName ? newRole : r);
        await updateDoc(doc(db, 'labs', labId), {
          customRoles: updatedRoles
        });
      } else {
        // Create new role
        await updateDoc(doc(db, 'labs', labId), {
          customRoles: arrayUnion(newRole)
        });
      }
      setIsRoleModalOpen(false);
      setEditingRole(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar cargo.");
    }
  };

  const handleDeleteRole = async (role: any) => {
    if (!labId) return;
    if (!confirm(`Tem certeza que deseja excluir o cargo '${role.name}'?`)) return;
    try {
      await updateDoc(doc(db, 'labs', labId), {
        customRoles: arrayRemove(role)
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Erro ao deletar cargo.");
    }
  };

  // RENDER PÚBLICO
  if (mode === 'public') {
    return (
      <div className="lab-team-tab anim-fade-up">
        <div className="lab-team-header lab-team-header-public">
          <div>
            <h3>Equipe do Laboratório</h3>
            <p>Conheça os pesquisadores e alunos que fazem parte deste hub.</p>
          </div>
        </div>
        <div className="lab-team-list">
          {members.map(member => (
            <div key={member.id} className="lab-team-card public-hover">
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

  // Verificar se o usuário atual é admin (poderia vir de um custom hook ou claims, mas vamos usar a role local)
  const isAdmin = userProfile?.lab?.role?.toLowerCase().includes('admin') || userProfile?.lab?.role?.toLowerCase() === 'pi';

  // RENDER MANAGE
  return (
    <div className="lab-team-tab anim-fade-up">
      <div className="lab-team-header">
        <div>
          <h3>Gestão da Equipe</h3>
          <p>Gerencie membros, solicitações de entrada e defina as permissões de acesso.</p>
        </div>
      </div>

      <div className="lab-team-nav-tabs">
        <button className={activeTab === 'solicitacoes' ? 'active' : ''} onClick={() => setActiveTab('solicitacoes')}>Solicitações {requests.length > 0 && <span className="badge">{requests.length}</span>}</button>
        <button className={activeTab === 'membros' ? 'active' : ''} onClick={() => setActiveTab('membros')}>Membros</button>
        <button className={activeTab === 'hierarquia' ? 'active' : ''} onClick={() => setActiveTab('hierarquia')}>Hierarquia de Cargos</button>
      </div>

      <div className="lab-team-content">
        {loading ? (
          <p className="loading-msg">Carregando dados...</p>
        ) : (
          <>
            {/* ABA MEMBROS */}
            {activeTab === 'membros' && (
              <div className="lab-team-list-wrapper">
                {isAdmin && (
                  <div className="invite-link-section">
                    <p>Convite direto para novos membros ingressarem e enviarem solicitação:</p>
                    <div className="invite-link-box">
                      <input type="text" readOnly value={`${window.location.origin}/lab/${labId}/join`} />
                      <button onClick={copyInviteLink}><Copy size={16} /> Copiar Link</button>
                    </div>
                  </div>
                )}
                
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
                        {isAdmin && member.id !== userProfile?.id ? (
                          <select 
                            className="role-select"
                            value={member.lab?.role || 'Membro'}
                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          >
                            {roles.map(r => (
                              <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                            {/* Fallback caso a role atual do membro não esteja na lista */}
                            {!roles.some(r => r.name === member.lab?.role) && (
                              <option value={member.lab?.role}>{member.lab?.role}</option>
                            )}
                          </select>
                        ) : (
                          getRoleBadge(member.lab?.role)
                        )}
                      </div>
                      {isAdmin && member.id !== userProfile?.id && (
                        <div className="member-actions">
                          <button className="action-btn-danger" onClick={() => handleRemoveMember(member.id)} title="Remover Membro">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                          <button className="cmmt-btn-primary btn-reject-confirm" onClick={() => handleRejectConfirm(req.reqId)}>Confirmar Recusa</button>
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
                  <button className="btn-create-role" onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }}>
                    <Plus size={16} /> Gerenciar Cargos
                  </button>
                </div>

                <table className="hierarchy-table">
                  <thead>
                    <tr>
                      <th>Cargo / Papel</th>
                      <th className="perm-cell">Gerir Equipe</th>
                      <th className="perm-cell">Editar Projetos</th>
                      <th className="perm-cell">Gerir Inventário</th>
                      {isAdmin && <th className="perm-cell">Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Linha imutável do Administrador/Criador */}
                    <tr>
                      <td><strong>PI / Admin</strong></td>
                      <td className="perm-cell"><CheckCircle2 size={18} className="perm-check-icon" /></td>
                      <td className="perm-cell"><CheckCircle2 size={18} className="perm-check-icon" /></td>
                      <td className="perm-cell"><CheckCircle2 size={18} className="perm-check-icon" /></td>
                      {isAdmin && <td className="perm-cell"><span className="perm-dash" title="Acesso irrestrito">-</span></td>}
                    </tr>

                    {roles.map((role, idx) => (
                      <tr key={idx}>
                        <td><strong>{role.name}</strong></td>
                        <td className="perm-cell">{role.permissions?.includes('manage_team') ? <CheckCircle2 size={18} className="perm-check-icon" /> : <span className="perm-dash">-</span>}</td>
                        <td className="perm-cell">{role.permissions?.includes('manage_projects') ? <CheckCircle2 size={18} className="perm-check-icon" /> : <span className="perm-dash">-</span>}</td>
                        <td className="perm-cell">{role.permissions?.includes('manage_inventory') ? <CheckCircle2 size={18} className="perm-check-icon" /> : <span className="perm-dash">-</span>}</td>
                        {isAdmin && (
                          <td className="perm-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              className="icon-btn-ghost" 
                              onClick={() => { setEditingRole(role); setIsRoleModalOpen(true); }}
                              title="Editar Cargo"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="icon-btn-ghost text-red" 
                              onClick={() => handleDeleteRole(role)}
                              title="Excluir Cargo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
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

      <NewRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => { setIsRoleModalOpen(false); setEditingRole(null); }}
        onSubmit={handleCreateRoleFromModal}
        initialRole={editingRole}
      />
    </div>
  );
};

export default LabTeamTab;
