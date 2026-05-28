import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import './styles.css';

interface EquipmentReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  onSuccess?: () => void;
}

const EquipmentReservationModal: React.FC<EquipmentReservationModalProps> = ({ isOpen, onClose, labId, onSuccess }) => {
  const { userProfile } = useAuth();
  const [equipmentName, setEquipmentName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      alert("Você precisa estar logado para agendar um equipamento.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'equipment_reservations'), {
        labId,
        userId: userProfile.id,
        userName: userProfile.name,
        equipmentName,
        date,
        startTime,
        endTime,
        status: 'Agendado',
        createdAt: serverTimestamp()
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao agendar equipamento:", error);
      alert("Ocorreu um erro ao agendar o equipamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="res-modal-overlay">
      <div className="res-modal-container">
        <button className="res-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="res-modal-header">
          <h2>Agendar Equipamento</h2>
          <p>Reserve um horário para utilizar os equipamentos do laboratório.</p>
        </div>

        <form className="res-modal-form" onSubmit={handleSubmit}>
          <div className="res-modal-form-group">
            <label>Equipamento</label>
            <input
              type="text"
              placeholder="Ex: Microscópio Confocal, Centrífuga..."
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              required
            />
          </div>

          <div className="res-modal-form-group">
            <label>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="res-modal-form-row">
            <div className="res-modal-form-group">
              <label>Horário Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="res-modal-form-group">
              <label>Horário Fim</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="res-modal-footer">
            <button type="button" className="res-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="res-btn-confirm" disabled={isSubmitting}>
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentReservationModal;
