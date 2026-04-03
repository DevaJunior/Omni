import React, { useState, useMemo } from 'react';
import { ArrowLeft, Database, Search, Plus, AlertTriangle, CheckCircle2, Clock, MapPin, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Footer from '../../menus/Footer';

// Tipagem de um Reagente
type ReagentStatus = 'ok' | 'low' | 'expired';

interface Reagent {
  id: string;
  name: string;
  cas: string;
  quantity: number;
  unit: string;
  location: string;
  expiration: string;
  status: ReagentStatus;
}

// Dados simulados do laboratório
const MOCK_INVENTORY: Reagent[] = [
  { id: '1', name: 'Cloreto de Sódio (NaCl) P.A.', cas: '7647-14-5', quantity: 850, unit: 'g', location: 'Prateleira A2', expiration: '2028-10-15', status: 'ok' },
  { id: '2', name: 'Etanol Absoluto 99,8%', cas: '64-17-5', quantity: 150, unit: 'mL', location: 'Armário Inflamáveis', expiration: '2026-12-01', status: 'low' },
  { id: '3', name: 'Agarose Ultra Pura', cas: '9012-36-6', quantity: 500, unit: 'g', location: 'Geladeira 1 (4°C)', expiration: '2027-05-20', status: 'ok' },
  { id: '4', name: 'Tampão TAE 50x', cas: 'Mistura', quantity: 0, unit: 'mL', location: 'Prateleira B1', expiration: '2024-01-10', status: 'expired' },
  { id: '5', name: 'Brometo de Etídio 10mg/mL', cas: '1239-45-8', quantity: 10, unit: 'mL', location: 'Gaveta Tóxicos', expiration: '2025-11-30', status: 'ok' },
  { id: '6', name: 'Hidróxido de Sódio (NaOH)', cas: '1310-73-2', quantity: 120, unit: 'g', location: 'Prateleira A1', expiration: '2025-08-15', status: 'low' },
];

const Inventory: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ReagentStatus>('all');

  // Lógica de Filtro e Busca
  const filteredReagents = useMemo(() => {
    return MOCK_INVENTORY.filter(reagent => {
      const matchesSearch = reagent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            reagent.cas.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || reagent.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  // Contadores para a Sidebar
  const stats = useMemo(() => {
    return {
      total: MOCK_INVENTORY.length,
      low: MOCK_INVENTORY.filter(r => r.status === 'low').length,
      expired: MOCK_INVENTORY.filter(r => r.status === 'expired').length,
    };
  }, []);

  return (
    <>
      <div className="tool-page-wrapper">
        <div className="tool-container">
          
          <button className="tool-btn-back" onClick={() => navigate('/lab')}>
            <ArrowLeft size={18} />
            Voltar para Bancada
          </button>

          <div className="tool-grid-layout">
            
            {/* Coluna Principal: Lista de Inventário */}
            <div className="tool-main-panel">
              <div className="tool-header">
                <div className="tool-icon-large teal-theme">
                  <Database size={32} />
                </div>
                <div className="tool-header-text">
                  <h1>Inventário de Reagentes</h1>
                  <p>Gerencie o estoque, localização e validade dos compostos do laboratório.</p>
                </div>
                <button className="tool-btn-primary btn-teal add-reagent-btn">
                  <Plus size={18} /> Novo Reagente
                </button>
              </div>

              <div className="tool-card-content inventory-content">
                
                {/* Barra de Busca e Filtros */}
                <div className="inventory-controls">
                  <div className="inventory-search">
                    <Search size={18} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome ou número CAS..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="inventory-filters">
                    <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                      Todos
                    </button>
                    <button className={`filter-btn ${filterStatus === 'ok' ? 'active' : ''}`} onClick={() => setFilterStatus('ok')}>
                      Em Estoque
                    </button>
                    <button className={`filter-btn ${filterStatus === 'low' ? 'active' : ''}`} onClick={() => setFilterStatus('low')}>
                      Acabando
                    </button>
                    <button className={`filter-btn ${filterStatus === 'expired' ? 'active' : ''}`} onClick={() => setFilterStatus('expired')}>
                      Vencidos
                    </button>
                  </div>
                </div>

                {/* Lista de Reagentes */}
                <div className="inventory-list">
                  {filteredReagents.length === 0 ? (
                    <div className="inventory-empty">
                      <FlaskConical size={40} />
                      <p>Nenhum reagente encontrado com estes filtros.</p>
                    </div>
                  ) : (
                    filteredReagents.map(reagent => (
                      <div key={reagent.id} className={`inventory-item-card status-${reagent.status}`}>
                        <div className="reagent-main-info">
                          <h3>{reagent.name}</h3>
                          <span className="reagent-cas">CAS: {reagent.cas}</span>
                        </div>

                        <div className="reagent-meta-grid">
                          <div className="reagent-meta-item">
                            <span className="meta-label">Quantidade</span>
                            <strong className="meta-value">{reagent.quantity} {reagent.unit}</strong>
                          </div>
                          <div className="reagent-meta-item">
                            <span className="meta-label"><MapPin size={14}/> Localização</span>
                            <span className="meta-value">{reagent.location}</span>
                          </div>
                          <div className="reagent-meta-item">
                            <span className="meta-label"><Clock size={14}/> Validade</span>
                            <span className="meta-value">{reagent.expiration}</span>
                          </div>
                        </div>

                        <div className="reagent-status-badge">
                          {reagent.status === 'ok' && <><CheckCircle2 size={16}/> OK</>}
                          {reagent.status === 'low' && <><AlertTriangle size={16}/> Baixo</>}
                          {reagent.status === 'expired' && <><AlertTriangle size={16}/> Vencido</>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            {/* Coluna Lateral: Resumo */}
            <aside className="tool-sidebar-panel">
              <div className="tool-info-card">
                <h3>Resumo do Estoque</h3>
                
                <div className="inventory-stats-container">
                  <div className="inv-stat-box stat-total">
                    <Database size={20} />
                    <div className="inv-stat-texts">
                      <span>Total Registrado</span>
                      <strong>{stats.total} itens</strong>
                    </div>
                  </div>

                  <div className="inv-stat-box stat-warning">
                    <AlertTriangle size={20} />
                    <div className="inv-stat-texts">
                      <span>Estoque Baixo</span>
                      <strong>{stats.low} itens</strong>
                    </div>
                  </div>

                  <div className="inv-stat-box stat-danger">
                    <Clock size={20} />
                    <div className="inv-stat-texts">
                      <span>Vencidos / Zerados</span>
                      <strong>{stats.expired} itens</strong>
                    </div>
                  </div>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Inventory;