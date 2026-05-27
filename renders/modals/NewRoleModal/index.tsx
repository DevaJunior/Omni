import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import './styles.css';

interface NewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleName: string, permissions: string[], originalName?: string) => void;
  initialRole?: { name: string; permissions: string[] } | null;
}

const NewRoleModal: React.FC<NewRoleModalProps> = ({ isOpen, onClose, onSubmit, initialRole }) => {
  const [roleName, setRoleName] = useState('');
  const [manageTeam, setManageTeam] = useState(false);
  const [manageProjects, setManageProjects] = useState(false);
  const [manageInventory, setManageInventory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setRoleName(initialRole.name);
        setManageTeam(initialRole.permissions?.includes('manage_team') || false);
        setManageProjects(initialRole.permissions?.includes('manage_projects') || false);
        setManageInventory(initialRole.permissions?.includes('manage_inventory') || false);
      } else {
        setRoleName('');
        setManageTeam(false);
        setManageProjects(false);
        setManageInventory(false);
      }
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    const permissions: string[] = [];
    if (manageTeam) permissions.push('manage_team');
    if (manageProjects) permissions.push('manage_projects');
    if (manageInventory) permissions.push('manage_inventory');

    onSubmit(roleName, permissions, initialRole?.name);
    setRoleName('');
    setManageTeam(false);
    setManageProjects(false);
    setManageInventory(false);
    onClose();
  };

  return (
    <div className="nrm-modal-overlay" onClick={onClose}>
      <div className="nrm-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="nrm-btn-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="nrm-header">
          <div className="nrm-icon-box nrm-icon-red">
            <ShieldAlert size={24} />
          </div>
          <h2>{initialRole ? 'Editar Cargo' : 'Criar Novo Cargo'}</h2>
          <p>{initialRole ? 'Modifique o nome ou as permissões do cargo existente.' : 'Defina um papel e atribua permissões personalizadas para a equipe.'}</p>
        </div>

        <form className="nrm-form" onSubmit={handleSubmit}>
          <div className="nrm-form-group nrm-text-upper">
            <label>Nome do Cargo / Papel <span className="nrm-required">*</span></label>
            <input
              type="text"
              placeholder="Ex: Bolsista IC, Analista Júnior"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
            />
          </div>

          <div className="nrm-form-group nrm-text-upper">
            <label>Permissões do Sistema</label>
            <div className="nrm-permissions-list">
              <label className="nrm-permission-item">
                <input
                  type="checkbox"
                  checked={manageTeam}
                  onChange={(e) => setManageTeam(e.target.checked)}
                />
                <div className="nrm-perm-info">
                  <p>Gerir Equipe</p>
                  <span>Pode aceitar/recusar convites e gerenciar hierarquia.</span>
                </div>
              </label>

              <label className="nrm-permission-item">
                <input
                  type="checkbox"
                  checked={manageProjects}
                  onChange={(e) => setManageProjects(e.target.checked)}
                />
                <div className="nrm-perm-info">
                  <p>Editar Projetos</p>
                  <span>Permite criar e alterar o status de projetos do lab.</span>
                </div>
              </label>

              <label className="nrm-permission-item">
                <input
                  type="checkbox"
                  checked={manageInventory}
                  onChange={(e) => setManageInventory(e.target.checked)}
                />
                <div className="nrm-perm-info">
                  <p>Gerir Inventário</p>
                  <span>Capacidade de adicionar reagentes e gerir agendamentos.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="nrm-modal-actions-row">
            <button type="button" className="nrm-modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="nrm-modal-btn-submit" disabled={!roleName.trim()}>
              {initialRole ? 'Salvar Alterações' : 'Criar Cargo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRoleModal;
