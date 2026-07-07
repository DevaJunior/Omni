import { useToastStore } from '../../../src/stores/toastStore';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import './styles.css';

interface EquipmentReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  onSuccess?: () => void;
}

const EquipmentReservationModal: React.FC<EquipmentReservationModalProps> = ({ isOpen, onClose, labId, onSuccess }) => {
  const { addToast } = useToastStore();
  const { userProfile } = useAuth();
  
  const [equipments, setEquipments] = useState<any[]>([]);
  const [equipmentId, setEquipmentId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);

  useEffect(() => {
    if (isOpen && labId) {
      fetchEquipments();
    }
  }, [isOpen, labId]);

  const fetchEquipments = async () => {
    setIsLoadingEquipments(true);
    try {
      const q = query(collection(db, 'equipments'), where('labId', '==', labId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEquipments(data);
      if (data.length > 0 && !equipmentId) {
        setEquipmentId(data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
      addToast("Erro ao carregar lista de equipamentos", "error");
    } finally {
      setIsLoadingEquipments(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      addToast("Você precisa estar logado para agendar um equipamento.", 'info');
      return;
    }

    if (!equipmentId) {
      addToast("Selecione um equipamento válido.", 'warning');
      return;
    }

    if (startTime >= endTime) {
      addToast("O horário de início deve ser menor que o horário de fim.", 'warning');
      return;
    }

    const selectedEquipment = equipments.find(eq => eq.id === equipmentId);
    if (!selectedEquipment) return;

    setIsSubmitting(true);
    try {
      // Fetch reservations for this lab to avoid composite index requirements
      const q = query(collection(db, 'equipment_reservations'), where('labId', '==', labId));
      const snap = await getDocs(q);
      const allReservations = snap.docs.map(doc => doc.data());
      
      const overlappingReservations = allReservations.filter(res => {
        return (
          res.equipmentId === equipmentId &&
          res.date === date &&
          res.status !== 'Cancelado' &&
          // Overlap logic: StartA < EndB and EndA > StartB
          (startTime < res.endTime && endTime > res.startTime)
        );
      });

      const maxCapacity = selectedEquipment.allowConcurrent ? (selectedEquipment.capacity || 2) : 1;

      if (overlappingReservations.length >= maxCapacity) {
        addToast(
          selectedEquipment.allowConcurrent 
            ? `A capacidade máxima simultânea (${maxCapacity} pessoas) deste equipamento já foi atingida para este horário.`
            : `Este equipamento é de uso exclusivo e já possui reserva entre os horários solicitados.`, 
          'error'
        );
        setIsSubmitting(false);
        return; // Block submission
      }

      await addDoc(collection(db, 'equipment_reservations'), {
        labId,
        userId: userProfile.id,
        userName: userProfile.name,
        equipmentId: selectedEquipment.id,
        equipmentName: selectedEquipment.name,
        date,
        startTime,
        endTime,
        status: 'Agendado',
        createdAt: serverTimestamp()
      });

      addToast("Agendamento realizado com sucesso!", "success");
      if (onSuccess) onSuccess();
      
      // Reset
      setDate('');
      setStartTime('');
      setEndTime('');
      onClose();
    } catch (error) {
      console.error("Erro ao agendar equipamento:", error);
      addToast("Ocorreu um erro ao agendar o equipamento.", 'error');
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
            {isLoadingEquipments ? (
              <div style={{color: '#94a3b8', padding: '0.5rem 0'}}>Carregando...</div>
            ) : equipments.length > 0 ? (
              <select 
                value={equipmentId} 
                onChange={(e) => setEquipmentId(e.target.value)}
                required
              >
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} {eq.allowConcurrent ? '(Simultâneo)' : '(Exclusivo)'}</option>
                ))}
              </select>
            ) : (
              <div style={{color: '#f8fafc', background: '#334155', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem'}}>
                Nenhum equipamento cadastrado. Acesse a aba "Gestão de Equipamentos".
              </div>
            )}
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
            <button type="submit" className="res-btn-confirm" disabled={isSubmitting || equipments.length === 0}>
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentReservationModal;
