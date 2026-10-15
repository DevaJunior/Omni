import React, { useState } from 'react';
import { Plus, Settings2, CheckCircle2, AlertCircle, Edit2, Trash2, Wrench, Power } from 'lucide-react';
import { useToastStore } from '../../../src/stores/toastStore';
import { useConfirmStore } from '../../../src/stores/confirmStore';
import { useLabEquipments, useCanManageLab } from '../../../src/hooks/useLabEquipment';
import { deleteEquipment, setEquipmentStatus, getErrorMessage } from '../../../src/services/equipmentService';
import type { Equipment } from '../../../src/types/equipment';
import EquipmentModal from '../../modals/EquipmentModal/index';
import './styles.css';

interface FragLabEquipamentosProps {
  labId: string;
}

const FragLabEquipamentos: React.FC<FragLabEquipamentosProps> = ({ labId }) => {
  const { addToast } = useToastStore();
  const { requestConfirm } = useConfirmStore();
  const { equipments, loading } = useLabEquipments(labId);
  const canManage = useCanManageLab(labId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedEquipment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsModalOpen(true);
  };

  const handleToggleMaintenance = async (eq: Equipment) => {
    const nextStatus = eq.status === 'Em Manutenção' ? 'Ativo' : 'Em Manutenção';
    setBusyId(eq.id);
    try {
      await setEquipmentStatus(eq.id, nextStatus);
      addToast(
        nextStatus === 'Em Manutenção'
          ? `"${eq.name}" colocado em manutenção.`
          : `"${eq.name}" reativado para agendamentos.`,
        'success'
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      addToast(getErrorMessage(error, 'Erro ao atualizar status do equipamento.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (eq: Equipment) => {
    requestConfirm({
      title: 'Excluir Equipamento',
      message: `Tem certeza que deseja excluir "${eq.name}"? Esta ação é irreversível e só é permitida se não houver reservas futuras ativas.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      isDanger: true,
      onConfirm: async () => {
        setBusyId(eq.id);
        try {
          await deleteEquipment(eq.id);
          addToast(`"${eq.name}" foi excluído com sucesso.`, 'success');
        } catch (error) {
          console.error('Erro ao excluir equipamento:', error);
          addToast(getErrorMessage(error, 'Não foi possível excluir o equipamento.'), 'error');
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const statusClass = (status: Equipment['status']) => {
    switch (status) {
      case 'Ativo':
        return 'status-ativo';
      case 'Em Manutenção':
        return 'status-manutencao';
      case 'Desativado':
        return 'status-desativado';
      default:
        return 'status-ativo';
    }
  };

  return (
    <div className="gestao-equip-tab-container anim-fade-up">
      <div className="gestao-equip-header">
        <div className="header-info">
          <h3>Gestão de Equipamentos e Ferramentas</h3>
          <p>Cadastre, configure e gerencie a disponibilidade dos recursos do laboratório.</p>
        </div>
        {canManage && (
          <button className="btn-add-equip" onClick={handleOpenCreate} id="btn-new-equipment">
            <Plus size={18} />
            Novo Equipamento
          </button>
        )}
      </div>

      <div className="equipments-list-section">
        {loading ? (
          <div className="equip-loading">Carregando equipamentos do laboratório...</div>
        ) : equipments.length > 0 ? (
          <div className="equipments-grid">
            {equipments.map((equip) => {
              const isBusy = busyId === equip.id;
              return (
                <div key={equip.id} className={`equipment-card ${equip.status !== 'Ativo' ? 'card-dimmed' : ''}`}>
                  <div className="equip-card-header">
                    <div className="equip-icon">
                      <Settings2 size={24} />
                    </div>
                    <span className={`equip-status ${statusClass(equip.status)}`}>
                      {equip.status || 'Ativo'}
                    </span>
                  </div>

                  <h4 className="equip-name">{equip.name}</h4>
                  {equip.description ? (
                    <p className="equip-desc">{equip.description}</p>
                  ) : (
                    <p className="equip-desc equip-desc-muted">Sem descrição cadastrada.</p>
                  )}

                  <div className="equip-config">
                    {equip.allowConcurrent ? (
                      <div className="config-item allow-multiple">
                        <CheckCircle2 size={16} />
                        <span>Uso simultâneo (Até {equip.capacity || 2} pessoas)</span>
                      </div>
                    ) : (
                      <div className="config-item single-user">
                        <AlertCircle size={16} />
                        <span>Uso exclusivo (1 pessoa por vez)</span>
                      </div>
                    )}
                  </div>

                  {canManage && (
                    <div className="equip-card-actions">
                      <button
                        className="equip-action-btn"
                        onClick={() => handleOpenEdit(equip)}
                        disabled={isBusy}
                        title="Editar configurações"
                      >
                        <Edit2 size={14} /> Editar
                      </button>

                      <button
                        className={`equip-action-btn ${equip.status === 'Em Manutenção' ? 'btn-reactivate' : 'btn-maintenance'}`}
                        onClick={() => handleToggleMaintenance(equip)}
                        disabled={isBusy}
                        title={equip.status === 'Em Manutenção' ? 'Reativar equipamento' : 'Colocar em manutenção'}
                      >
                        {equip.status === 'Em Manutenção' ? <Power size={14} /> : <Wrench size={14} />}
                        {equip.status === 'Em Manutenção' ? 'Reativar' : 'Manutenção'}
                      </button>

                      <button
                        className="equip-action-btn btn-delete"
                        onClick={() => handleDelete(equip)}
                        disabled={isBusy}
                        title="Excluir equipamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="equip-empty-state">
            <Settings2 size={48} className="empty-icon" />
            <h4>Nenhum equipamento cadastrado</h4>
            <p>Adicione ferramentas e equipamentos para permitir que a equipe realize agendamentos.</p>
            {canManage && (
              <button className="btn-empty-add" onClick={handleOpenCreate}>
                Cadastrar Primeiro Equipamento
              </button>
            )}
          </div>
        )}
      </div>

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labId={labId}
        equipment={selectedEquipment}
      />
    </div>
  );
};

export default FragLabEquipamentos;
