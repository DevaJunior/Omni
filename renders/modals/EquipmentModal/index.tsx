import { useToastStore } from '../../../src/stores/toastStore';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import './styles.css';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  onSuccess?: () => void;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose, labId, onSuccess }) => {
  const { addToast } = useToastStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allowConcurrent, setAllowConcurrent] = useState(false);
  const [capacity, setCapacity] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'equipments'), {
        labId,
        name,
        description,
        allowConcurrent,
        capacity: allowConcurrent ? Number(capacity) : 1,
        status: 'Ativo',
        createdAt: serverTimestamp()
      });

      addToast("Equipamento cadastrado com sucesso!", 'success');
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setAllowConcurrent(false);
      setCapacity(2);
    } catch (error) {
      console.error("Erro ao cadastrar equipamento:", error);
      addToast("Ocorreu um erro ao cadastrar o equipamento.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="configmod_equipam-equipment-modal-overlay">
      <div className="configmod_equipam-equipment-modal-container">
        <button className="configmod_equipam-equipment-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="configmod_equipam-equipment-modal-header">
          <h2>Cadastrar Equipamento</h2>
          <p>Adicione um novo equipamento ou ferramenta ao inventário do laboratório.</p>
        </div>

        <form className="configmod_equipam-equipment-modal-form" onSubmit={handleSubmit}>
          <div className="configmod_equipam-equipment-modal-form-group">
            <label>Nome do Equipamento <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              placeholder="Ex: Microscópio Confocal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="configmod_equipam-equipment-modal-form-group">
            <label>Descrição Breve</label>
            <input
              type="text"
              placeholder="Ex: Lente 40x, localizado na sala 2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

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
            <div className="configmod_equipam-equipment-modal-form-group configmod_equipam-anim-fade-up">
              <label>Capacidade Simultânea (Nº de pessoas)</label>
              <input
                type="number"
                min="2"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </div>
          )}

          <div className="configmod_equipam-equipment-modal-footer">
            <button type="button" className="configmod_equipam-equipment-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="configmod_equipam-equipment-btn-confirm" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Equipamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;