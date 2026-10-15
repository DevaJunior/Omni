import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastStore } from '../../../src/stores/toastStore';
import { createEquipment, updateEquipment, getErrorMessage } from '../../../src/services/equipmentService';
import type { Equipment, EquipmentStatus } from '../../../src/types/equipment';
import './styles.css';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  equipment?: Equipment | null;
  onSuccess?: () => void;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose, labId, equipment, onSuccess }) => {
  const { addToast } = useToastStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allowConcurrent, setAllowConcurrent] = useState(false);
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState<EquipmentStatus>('Ativo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!equipment;

  useEffect(() => {
    if (isOpen) {
      if (equipment) {
        setName(equipment.name || '');
        setDescription(equipment.description || '');
        setAllowConcurrent(!!equipment.allowConcurrent);
        setCapacity(equipment.capacity || 2);
        setStatus(equipment.status || 'Ativo');
      } else {
        setName('');
        setDescription('');
        setAllowConcurrent(false);
        setCapacity(2);
        setStatus('Ativo');
      }
    }
  }, [isOpen, equipment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Informe o nome do equipamento.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && equipment) {
        await updateEquipment(equipment.id, {
          name,
          description,
          allowConcurrent,
          capacity: allowConcurrent ? Number(capacity) : 1,
          status,
        });
        addToast('Equipamento atualizado com sucesso!', 'success');
      } else {
        await createEquipment(labId, {
          name,
          description,
          allowConcurrent,
          capacity: allowConcurrent ? Number(capacity) : 1,
          status,
        });
        addToast('Equipamento cadastrado com sucesso!', 'success');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
      addToast(getErrorMessage(error, 'Ocorreu um erro ao salvar o equipamento.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="configmod_equipam-equipment-modal-overlay" onClick={() => !isSubmitting && onClose()}>
      <div className="configmod_equipam-equipment-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="configmod_equipam-equipment-modal-close" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        <div className="configmod_equipam-equipment-modal-header">
          <h2>{isEditing ? 'Editar Equipamento' : 'Cadastrar Equipamento'}</h2>
          <p>
            {isEditing
              ? 'Atualize os dados e configurações do equipamento.'
              : 'Adicione um novo equipamento ou ferramenta ao inventário do laboratório.'}
          </p>
        </div>

        <form className="configmod_equipam-equipment-modal-form" onSubmit={handleSubmit}>
          <div className="configmod_equipam-equipment-modal-form-group">
            <label htmlFor="equip-name">
              Nome do Equipamento <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="equip-name"
              type="text"
              placeholder="Ex: Microscópio Confocal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="configmod_equipam-equipment-modal-form-group">
            <label htmlFor="equip-desc">Descrição / Localização</label>
            <input
              id="equip-desc"
              type="text"
              placeholder="Ex: Sala de Microscopia 2, bancada sul"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {isEditing && (
            <div className="configmod_equipam-equipment-modal-form-group">
              <label htmlFor="equip-status">Status Operacional</label>
              <select
                id="equip-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                }}
              >
                <option value="Ativo">Ativo (Disponível para reservas)</option>
                <option value="Em Manutenção">Em Manutenção (Bloqueia novas reservas)</option>
                <option value="Desativado">Desativado</option>
              </select>
            </div>
          )}

          <div className="configmod_equipam-equipment-modal-form-group configmod_equipam-checkbox-group">
            <label className="configmod_equipam-checkbox-label">
              <input
                type="checkbox"
                checked={allowConcurrent}
                onChange={(e) => setAllowConcurrent(e.target.checked)}
              />
              <div className="configmod_equipam-checkbox-text">
                <strong>Permite agendamento simultâneo?</strong>
                <p>Marque se múltiplas pessoas podem reservar este equipamento no mesmo horário.</p>
              </div>
            </label>
          </div>

          {allowConcurrent && (
            <div className="configmod_equipam-equipment-modal-form-group">
              <label htmlFor="equip-cap">Capacidade Simultânea (Nº de pessoas)</label>
              <input
                id="equip-cap"
                type="number"
                min="2"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </div>
          )}

          <div className="configmod_equipam-equipment-modal-footer">
            <button
              type="button"
              className="configmod_equipam-equipment-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="configmod_equipam-equipment-btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;