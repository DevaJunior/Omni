import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useConfirmStore } from '../../../src/stores/confirmStore';
import './styles.css';

const GlobalConfirm: React.FC = () => {
  const { isOpen, title, message, confirmText, cancelText, isDanger, onConfirm, onCancel, close } = useConfirmStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    close();
  };

  const handleCancel = () => {
    onCancel();
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="confirm-modal-content">
        <div className="confirm-modal-header">
          {isDanger ? <AlertTriangle size={24} className="danger-icon" /> : <AlertCircle size={24} className="info-icon" />}
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>

        <div className="confirm-modal-footer">
          <button className="confirm-cancel-btn" onClick={handleCancel}>
            {cancelText}
          </button>
          <button 
            className={`confirm-action-btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalConfirm;
