import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './styles.css';

interface InventoryAlertProps {
  itemName?: string;
  volumeInfo?: string;
  onRequestRestock?: () => void;
  onOpenInventory?: () => void;
}

const InventoryAlert: React.FC<InventoryAlertProps> = ({
  itemName = 'Tampão TAE 50x',
  volumeInfo = 'volume crítico (restam apenas 2L)',
  onRequestRestock,
  onOpenInventory
}) => {
  return (
    <div className="mybench-card mybench-alert-card">
      <div className="alert-header">
        <div className="alert-title-group">
          <AlertTriangle size={20} className="alert-icon" />
          <h4>Aviso de Estoque</h4>
        </div>
        <button className="view-inventory-btn" onClick={onOpenInventory}>Ver estoque</button>
      </div>
      <p>O {itemName} está com {volumeInfo}.</p>
      <button 
        className="alert-link" 
        onClick={onRequestRestock}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        SOLICITAR REPOSIÇÃO
      </button>
    </div>
  );
};

export default InventoryAlert;
