import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './styles.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) return;
    onSubmit(reason);
    setReason('');
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-content anim-fade-in">
        <button className="report-modal-close" onClick={onClose}><X size={20} /></button>
        <div className="report-modal-header">
          <AlertTriangle size={24} className="danger-icon" />
          <h3>Denunciar Publicação</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="report-modal-body">
          <p>Por favor, descreva detalhadamente o motivo da denúncia. Nossa equipe irá analisar o caso o mais rápido possível.</p>
          <textarea
            className="report-textarea"
            placeholder="Qual o motivo da denúncia? (Mínimo 10 caracteres)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            required
            minLength={10}
            autoFocus
          ></textarea>
          
          <div className="report-modal-footer">
            <button type="button" className="report-cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="report-submit-btn"
              disabled={reason.trim().length < 10}
            >
              Enviar Denúncia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
