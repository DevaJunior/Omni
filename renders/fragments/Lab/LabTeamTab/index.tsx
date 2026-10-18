import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, ShieldAlert, Check, X as XIcon, Plus, Copy, CheckCircle2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useToastStore } from '../../../../src/stores/toastStore';
import { useConfirmStore } from '../../../../src/stores/confirmStore';
import Skeleton from '../../../components/Skeleton';
import NewRoleModal from '../../../modals/NewRoleModal';
import { labService } from '../../../../src/services/labService';
import './styles.css';

interface LabTeamTabProps {
  mode?: 'public' | 'manage';
  labId?: string;
}

const LabTeamTab: React.FC<LabTeamTabProps> = ({ mode = 'manage', labId }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();
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
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  useEffect(() => {
    if (!labId) return;
    fetchData();
  }, [labId, activeTab, mode]);

  const fetchData = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const labDoc = await getDoc(doc(db, 'labs', labId));
      let currentRoles: Record<string, unknown>[] = [];
      let adminId = '';
      if (labDoc.exists()) {
        const labData = labDoc.data();
        currentRoles = labData.customRoles || [];
        adminId = labData.adminId || '';
        setRoles(currentRoles);
      }

      // Sempre busca membros se estiver no modo público OU se a aba for membros
      if (mode === 'public' || activeTab === 'membros') {
        const mems = await labService.getLabMembers(labId, adminId, userProfile);
        setMembers(mems);
      }

      // Busca solicitações no modo de gestão para atualizar badge
      if (mode !== 'public') {
        const q = query(collection(db, 'lab_requests'), where('labId', '==', labId), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        setRequests(snap.docs.map(d => ({ reqId: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error("Erro ao carregar equipe do laboratório:", err);
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
      addToast('Usuário aceito com sucesso!', 'success');
      fetchData();
    } catch (e) {
      console.error(e);
      addToast('Erro ao aceitar solicitação.', 'error');
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
  const handleRemoveMember = (userId: string) => {
    requestConfirm({
      title: 'Remover Membro',
      message: 'Tem certeza que deseja remover este usuário do laboratório?',
      isDanger: true,
      confirmText: 'Remover',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'users', userId), {
            lab: null
          });
          fetchData();
          addToast('Usuário removido', 'success');
        } catch (e) {
          console.error(e);
          addToast('Erro ao remover usuário', 'error');
        }
      }
    });
  };

  const handleChangeRole = async (userId: string, newRoleName: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'lab.role': newRoleName
      });
      // Update local state temporarily for immediate feedback
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, lab: { ...m.lab, role: newRoleName } } : m));
      addToast('Cargo alterado com sucesso', 'success');
    } catch (e) {
      console.error("Erro ao mudar cargo", e);
      addToast('Erro ao alterar cargo do membro.', 'error');
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/lab/${labId}/join`;
    navigator.clipboard.writeText(link);
    addToast('Link de convite copiado!', 'success');
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
      addToast('Cargo salvo com sucesso', 'success');
    } catch (e) {
      console.error(e);
      addToast('Erro ao salvar cargo.', 'error');
    }
  };

  const handleDeleteRole = (role: Record<string, unknown>) => {
    if (!labId) return;
    requestConfirm({
      title: 'Excluir Cargo',
      message: `Tem certeza que deseja excluir o cargo '${role.name}'?`,
      isDanger: true,
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'labs', labId), {
            customRoles: arrayRemove(role)
          });
          fetchData();
          addToast('Cargo deletado com sucesso', 'success');
        } catch (e) {
          console.error(e);
          addToast('Erro ao deletar cargo.', 'error');
        }
      }
    });
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
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
              <Skeleton type="card" height="75px" />
              <Skeleton type="card" height="75px" />
            </div>
          ) : members.length === 0 ? (
            <p className="empty-msg" style={{ padding: '2rem 0', color: '#64748b' }}>
              Nenhum membro listado no momento.
            </p>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="lab-team-card public-hover"
                onClick={() => navigate(`/profile/${member.id}`)}
                title={`Ver perfil de ${member.name}`}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/profile/${member.id}`);
                  }
                }}
              >
                <div className="member-avatar">
                  <img
                    src={member.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.name || 'User')}
                    alt={member.name}
                  />
                </div>
                <div className="member-info">
                  <h4>{member.name}</h4>
                  <span>{member.headline || member.department || member.email}</span>
                </div>
                <div className="member-role">
                  {getRoleBadge(member.role || member.lab?.role)}
                </div>
              </div>
            ))
          )}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 0' }}>
            <Skeleton type="card" height="100px" />
            <Skeleton type="card" height="100px" />
            <Skeleton type="card" height="100px" />
          </div>
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
                      <div
                        className="member-avatar"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${member.id}`)}
                        title={`Ver perfil de ${member.name}`}
                      >
                        <img src={member.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.name || 'User')} alt={member.name} />
                      </div>
                      <div
                        className="member-info"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${member.id}`)}
                        title={`Ver perfil de ${member.name}`}
                      >
                        <h4>{member.name}</h4>
                        <span>{member.email}</span>
                      </div>
                      <div className="member-role">
                        {isAdmin && member.id !== userProfile?.id ? (
                          <select 
                            className="role-select"
                            value={member.role || member.lab?.role || 'Membro'}
                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          >
                            {roles.map(r => (
                              <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                            {/* Fallback caso a role atual do membro não esteja na lista */}
                            {!roles.some(r => r.name === (member.role || member.lab?.role)) && (
                              <option value={member.role || member.lab?.role}>{member.role || member.lab?.role || 'Membro'}</option>
                            )}
                          </select>
                        ) : (
                          getRoleBadge(member.role || member.lab?.role)
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
