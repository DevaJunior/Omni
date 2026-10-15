import React, { useEffect, useState } from 'react';
import { Search, Shield, ShieldAlert, User } from 'lucide-react';
import { adminService } from '../../../../../src/services/adminService';
import type { IUser } from '../../../../../src/types';
import { useToastStore } from '../../../../../src/stores/toastStore';
import { useConfirmStore } from '../../../../../src/stores/confirmStore';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import './styles.css';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();
  const { userProfile } = useAuth(); // Para não removermos a nós mesmos do admin

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      addToast("Erro ao buscar usuários.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = (id: string, newRole: string, userName: string) => {
    if (id === userProfile?.id) {
      addToast("Você não pode alterar seu próprio nível de permissão por aqui.", "error");
      return;
    }

    const actionDesc = newRole === 'admin' ? 'promover para Administrador' : 'rebaixar para Usuário Padrão';

    requestConfirm({
      title: 'Alterar Permissão',
      message: `Tem certeza que deseja ${actionDesc} o usuário ${userName}?`,
      confirmText: 'Sim, alterar',
      onConfirm: async () => {
        try {
          await adminService.updateUserRole(id, newRole);
          addToast("Permissão atualizada com sucesso.", "success");
          fetchUsers();
        } catch (err) {
          addToast("Erro ao atualizar permissão.", "error");
        }
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-users-container">
      <div className="admin-page-header">
        <div>
          <h1>Gestão de Usuários</h1>
          <p>Gerencie as contas da plataforma, níveis de acesso e bloqueios.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="users-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Cargo / Nível</th>
              <th className="align-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center">Carregando usuários...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="text-center">Nenhum usuário encontrado.</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <img src={u.avatar || 'https://via.placeholder.com/40'} alt={u.name} className="user-avatar" />
                      <div className="user-meta">
                        <span className="user-name">{u.name}</span>
                        <span className="user-headline">{u.headline || 'Sem biografia'}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="user-email">{u.email || 'Não informado'}</span></td>
                  <td>
                    {u.role === 'admin' ? (
                      <span className="role-badge admin"><ShieldAlert size={12} /> Admin</span>
                    ) : (
                      <span className="role-badge user"><User size={12} /> Padrão</span>
                    )}
                  </td>
                  <td className="align-right">
                    <div className="action-buttons">
                      {u.role === 'admin' ? (
                        <button 
                          className="btn-outline" 
                          onClick={() => handleUpdateRole(u.id, 'user', u.name)}
                          title="Remover Admin"
                          disabled={u.id === userProfile?.id}
                        >
                          <Shield size={16} style={{marginRight: '6px'}} /> 
                          Remover Admin
                        </button>
                      ) : (
                        <button 
                          className="btn-outline danger" 
                          onClick={() => handleUpdateRole(u.id, 'admin', u.name)}
                          title="Tornar Admin"
                        >
                          <ShieldAlert size={16} style={{marginRight: '6px'}} />
                          Tornar Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
