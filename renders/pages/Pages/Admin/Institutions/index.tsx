import React, { useEffect, useState } from 'react';
import { Building, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import './styles.css';
import { useConfirmStore } from '../../../../../src/stores/confirmStore';
import type { IInstitution } from '../../../../../src/types';
import { useToastStore } from '../../../../../src/stores/toastStore';
import { adminService } from '../../../../../src/services/adminService';

const AdminInstitutions: React.FC = () => {
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<IInstitution | null>(null);

  const [formData, setFormData] = useState<{ name: string; domain: string; plan: 'free' | 'premium' | 'enterprise' }>({ name: '', domain: '', plan: 'free' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getInstitutions();
      setInstitutions(data);
    } catch (err) {
      addToast("Erro ao buscar instituições.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleOpenModal = (inst?: IInstitution) => {
    if (inst) {
      setEditingInst(inst);
      setFormData({ name: inst.name, domain: inst.domain, plan: inst.plan });
    } else {
      setEditingInst(null);
      setFormData({ name: '', domain: '', plan: 'free' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInst(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.domain) {
      addToast("Preencha os campos obrigatórios.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingInst) {
        await adminService.updateInstitution(editingInst.id, formData);
        addToast("Instituição atualizada!", "success");
      } else {
        await adminService.createInstitution(formData);
        addToast("Instituição criada!", "success");
      }
      handleCloseModal();
      fetchInstitutions();
    } catch (err) {
      addToast("Erro ao salvar instituição.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    requestConfirm({
      title: 'Excluir Instituição',
      message: 'Tem certeza que deseja excluir esta instituição? Ação irreversível.',
      confirmText: 'Sim, excluir',
      onConfirm: async () => {
        try {
          await adminService.deleteInstitution(id);
          addToast("Instituição excluída.", "success");
          fetchInstitutions();
        } catch (err) {
          addToast("Erro ao excluir.", "error");
        }
      }
    });
  };

  const filtered = institutions.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-institutions-container">
      <div className="admin-page-header">
        <div>
          <h1>Gestão de Instituições</h1>
          <p>Cadastre e gerencie universidades, empresas e polos de pesquisa.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nova Instituição
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar instituição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="institutions-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Domínio</th>
              <th>Plano</th>
              <th>Data de Cadastro</th>
              <th className="align-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center">Nenhuma instituição encontrada.</td></tr>
            ) : (
              filtered.map(inst => (
                <tr key={inst.id}>
                  <td>
                    <div className="inst-cell">
                      <div className="inst-avatar-mini"><Building size={16} /></div>
                      <span>{inst.name}</span>
                    </div>
                  </td>
                  <td><code>@{inst.domain}</code></td>
                  <td>
                    <span className={`plan-badge ${inst.plan}`}>{inst.plan.toUpperCase()}</span>
                  </td>
                  <td>{new Date(inst.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="align-right">
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleOpenModal(inst)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(inst.id)} title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingInst ? 'Editar Instituição' : 'Nova Instituição'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nome da Instituição *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Universidade de São Paulo"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Domínio de E-mail *</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={e => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="Ex: usp.br"
                />
              </div>
              <div className="form-group">
                <label>Plano de Acesso *</label>
                <select
                  value={formData.plan}
                  onChange={e => setFormData({ ...formData, plan: e.target.value as any })}
                >
                  <option value="free">Free (Básico)</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Instituição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstitutions;
