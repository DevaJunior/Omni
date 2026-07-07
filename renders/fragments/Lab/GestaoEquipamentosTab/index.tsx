import React, { useState, useEffect } from 'react';
import { Plus, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import EquipmentModal from '../../../modals/EquipmentModal/index';
import './styles.css';

interface GestaoEquipamentosTabProps {
  labId: string;
}

const GestaoEquipamentosTab: React.FC<GestaoEquipamentosTabProps> = ({ labId }) => {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEquipments = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'equipments'),
        where('labId', '==', labId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEquipments(data);
    } catch (error) {
      console.error("Erro ao buscar equipamentos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [labId]);

  return (
    <div className="gestao-equip-tab-container anim-fade-up">
      <div className="gestao-equip-header">
        <div className="header-info">
          <h3>Gestão de Equipamentos e Ferramentas</h3>
          <p>Cadastre e gerencie as configurações dos recursos do laboratório.</p>
        </div>
        <button className="btn-add-equip" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Novo Equipamento
        </button>
      </div>

      <div className="equipments-list-section">
        {loading ? (
          <div className="equip-loading">Carregando equipamentos...</div>
        ) : equipments.length > 0 ? (
          <div className="equipments-grid">
            {equipments.map((equip) => (
              <div key={equip.id} className="equipment-card">
                <div className="equip-card-header">
                  <div className="equip-icon">
                    <Settings2 size={24} />
                  </div>
                  <span className={`equip-status ${equip.status === 'Ativo' ? 'status-ativo' : 'status-manutencao'}`}>
                    {equip.status || 'Ativo'}
                  </span>
                </div>
                
                <h4 className="equip-name">{equip.name}</h4>
                {equip.description && <p className="equip-desc">{equip.description}</p>}
                
                <div className="equip-config">
                  {equip.allowConcurrent ? (
                    <div className="config-item allow-multiple">
                      <CheckCircle2 size={16} />
                      <span>Uso simultâneo (Máx: {equip.capacity || 2} pessoas)</span>
                    </div>
                  ) : (
                    <div className="config-item single-user">
                      <AlertCircle size={16} />
                      <span>Uso exclusivo (1 pessoa por vez)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="equip-empty-state">
            <Settings2 size={48} className="empty-icon" />
            <h4>Nenhum equipamento cadastrado</h4>
            <p>Adicione ferramentas e equipamentos para permitir que a equipe realize agendamentos.</p>
            <button className="btn-empty-add" onClick={() => setIsModalOpen(true)}>
              Cadastrar Primeiro Equipamento
            </button>
          </div>
        )}
      </div>

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labId={labId}
        onSuccess={fetchEquipments}
      />
    </div>
  );
};

export default GestaoEquipamentosTab;
