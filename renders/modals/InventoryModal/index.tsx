import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search, Plus, Edit2, Trash2, Info, Package, Tag, ChevronLeft, ChevronRight, Circle, ChevronUp, ChevronDown, Check } from 'lucide-react';
import './styles.css';

interface InventoryItem {
  id: string;
  refId: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  status: 'Normal' | 'Atenção' | 'Esgotado';
}

const mockInventory: InventoryItem[] = [
  { id: '1', refId: '#REF-001', name: 'Tampão TAE 50x', description: 'Reagente para eletroforese em gel de agarose.', quantity: 2, unit: 'L', status: 'Atenção' },
  { id: '2', refId: '#REF-042', name: 'Etanol Absoluto', description: 'Grau analítico P.A. 99.8%', quantity: 15, unit: 'L', status: 'Normal' },
  { id: '3', refId: '#REF-015', name: 'Agarose', description: 'Alta resolução para géis de DNA.', quantity: 500, unit: 'g', status: 'Normal' },
  { id: '4', refId: '#REF-112', name: 'Ponteiras 10ul', description: 'Com filtro, esterilizadas.', quantity: 0, unit: 'cx', status: 'Esgotado' }
];

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [quantityFilter, setQuantityFilter] = useState('Todos');
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'category' | null>(null);

  // States for mini-form (Add / Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // Click outside for dropdowns
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Todos' || item.status === statusFilter;

      let matchQuantity = true;
      if (quantityFilter === 'Com Estoque') matchQuantity = item.quantity > 0;
      if (quantityFilter === 'Sem Estoque') matchQuantity = item.quantity === 0;

      return matchSearch && matchStatus && matchQuantity;
    });

    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (sortConfig.key === 'name') {
          return sortConfig.direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortConfig.key === 'quantity' || sortConfig.key === 'stock') {
          return sortConfig.direction === 'asc'
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        }
        if (sortConfig.key === 'status') {
          return sortConfig.direction === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        }
        return 0;
      });
    }

    return result;
  }, [items, search, statusFilter, quantityFilter, sortConfig]);

  // Check if form name matches an existing item (case insensitive) for "New Entry" logic
  const existingItemMatch = useMemo(() => {
    if (!formData.name || editId) return null; // If editing an explicit ID, don't trigger "New Entry" match
    return items.find(i => i.name.toLowerCase() === formData.name?.toLowerCase());
  }, [formData.name, items, editId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return '#10b981'; // Green
      case 'Atenção': return '#f59e0b'; // Yellow/Orange
      case 'Esgotado': return '#ef4444'; // Red
      default: return '#cbd5e1';
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditId(null);
    setFormData({ name: '', description: '', quantity: 0, unit: 'un', status: 'Normal' });
  };

  const handleEdit = (item: InventoryItem) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormData({ ...item });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este item do estoque?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editId) {
      // Update existing explicit
      setItems(prev => prev.map(item => item.id === editId ? { ...item, ...formData } as InventoryItem : item));
    } else if (existingItemMatch) {
      // Smart Add (New Entry for existing product)
      const addedQuantity = Number(formData.quantity) || 0;
      setItems(prev => prev.map(item =>
        item.id === existingItemMatch.id
          ? { ...item, quantity: item.quantity + addedQuantity }
          : item
      ));
    } else {
      // Create entirely new product
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        refId: `#REF-${Math.floor(Math.random() * 900) + 100}`,
        name: formData.name || '',
        description: formData.description || '',
        quantity: Number(formData.quantity) || 0,
        unit: formData.unit || 'un',
        status: (formData.status as any) || 'Normal'
      };
      setItems(prev => [newItem, ...prev]);
    }

    setIsEditing(false);
    setEditId(null);
    setFormData({});
  };

  if (!isOpen) return null;

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal-container" onClick={e => e.stopPropagation()}>

        {/* HEADER MODAL */}
        <div className="inventory-modal-header">
          <div className="inventory-header-left">
            <div className="inventory-icon-box">
              <Package size={24} color="#0284c7" />
            </div>
            <div className="inventory-modal-title">
              <h2>Inventário Geral</h2>
              <p>Gerencie reagentes, vidrarias e consumíveis do laboratório.</p>
            </div>
          </div>

          <div className="inventory-header-actions">
            {/* <button className="inventory-btn-icon">
              <SlidersHorizontal size={18} />
            </button> */}
            <button className="btn-add-item-pill" onClick={handleAddNew}>
              <Plus size={18} /> Adicionar Item
            </button>
            <button className="inventory-btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* TOOLBAR (FILTROS E BUSCA) */}
        <div className="inventory-modal-toolbar">
          <div className="inventory-filters-left" ref={dropdownRef}>
            {/* STATUS DROPDOWN */}
            <div className="custom-dropdown-container">
              <div
                className="inventory-filter-pill"
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              >
                <Circle size={10} fill="#94a3b8" color="#94a3b8" />
                <span>{statusFilter === 'Todos' ? 'Status' : statusFilter}</span>
              </div>

              {activeDropdown === 'status' && (
                <div className="custom-dropdown-menu">
                  <div className="custom-dropdown-header">Status</div>
                  <div className="custom-dropdown-item" onClick={() => { setStatusFilter('Todos'); setActiveDropdown(null); }}>Todos</div>
                  <div className="custom-dropdown-item" onClick={() => { setStatusFilter('Normal'); setActiveDropdown(null); }}>Normal</div>
                  <div className="custom-dropdown-item" onClick={() => { setStatusFilter('Atenção'); setActiveDropdown(null); }}>Atenção</div>
                  <div className="custom-dropdown-item" onClick={() => { setStatusFilter('Esgotado'); setActiveDropdown(null); }}>Esgotado</div>
                </div>
              )}
            </div>

            {/* CATEGORY DROPDOWN */}
            <div className="custom-dropdown-container">
              <div
                className="inventory-filter-pill"
                onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
              >
                <Tag size={14} color="#94a3b8" />
                <span>{quantityFilter === 'Todos' ? 'Categoria' : quantityFilter}</span>
              </div>

              {activeDropdown === 'category' && (
                <div className="custom-dropdown-menu">
                  <div className="custom-dropdown-header">Categoria</div>
                  <div className="custom-dropdown-item" onClick={() => { setQuantityFilter('Todos'); setActiveDropdown(null); }}>Todos</div>
                  <div className="custom-dropdown-item" onClick={() => { setQuantityFilter('Com Estoque'); setActiveDropdown(null); }}>Reagentes</div>
                  <div className="custom-dropdown-item" onClick={() => { setQuantityFilter('Sem Estoque'); setActiveDropdown(null); }}>Vidrarias</div>
                </div>
              )}
            </div>
          </div>

          <div className="inventory-search-pill">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar no inventário..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isEditing && (
          <div className="inventory-edit-modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="inventory-edit-modal-container" onClick={e => e.stopPropagation()}>
              <div className="add-item-header">
                <div className="add-item-header-left">
                  <div className="add-item-icon-box">
                    <Plus size={20} color="#0284c7" />
                  </div>
                  <div>
                    <h4>{editId ? 'Editar Item' : 'Novo Item'}</h4>
                    <p>{editId ? 'Atualize as informações do item' : 'Adicione um novo registro ao inventário.'}</p>
                  </div>
                </div>
                <button className="add-item-close" onClick={() => setIsEditing(false)}>
                  <X size={20} />
                </button>
              </div>

              {existingItemMatch && !editId && (
                <div className="smart-entry-badge-wrapper">
                  <div className="smart-entry-badge">
                    <Info size={14} />
                    Produto Existente: Será adicionado +{formData.quantity || 0} {existingItemMatch.unit} ao estoque atual ({existingItemMatch.quantity}).
                  </div>
                </div>
              )}

              <div className="add-item-body">
                <div className="form-group">
                  <label>Nome do Item <span className="text-blue">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex: Tampão TAE 50x"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Descrição ou Lote</label>
                  <input
                    type="text"
                    placeholder="Detalhes adicionais, referência ou número do lote"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Qtd <span className="text-blue">*</span></label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.quantity || ''}
                      onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group select-wrapper">
                    <label>Unidade</label>
                    <select
                      value={formData.unit || 'un'}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option value="un">Unidade (un)</option>
                      <option value="L">Litros (L)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="g">Gramas (g)</option>
                      <option value="kg">Quilogramas (kg)</option>
                      <option value="cx">Caixas (cx)</option>
                    </select>
                    <ChevronDown size={16} className="select-icon" />
                  </div>

                  <div className="form-group select-wrapper">
                    <label>Status Inicial</label>
                    <select
                      value={formData.status || 'Normal'}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Atenção">Atenção</option>
                      <option value="Esgotado">Esgotado</option>
                    </select>
                    <ChevronDown size={16} className="select-icon" />
                  </div>
                </div>
              </div>

              <div className="add-item-footer">
                <button className="btn-cancel-text" onClick={() => setIsEditing(false)}>Cancelar</button>
                <button className="btn-save-item" onClick={handleSave}>
                  <Check size={18} />
                  Salvar Item
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="inventory-list-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('quantity')} className="sortable-header">
                  <div className="header-content">
                    QUANT.
                    {sortConfig?.key === 'quantity' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="sort-icon-active" /> : <ChevronDown size={14} className="sort-icon-active" />) : <ChevronDown size={14} className="sort-icon-inactive" />}
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="sortable-header">
                  <div className="header-content">
                    NOME
                    {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="sort-icon-active" /> : <ChevronDown size={14} className="sort-icon-active" />) : <ChevronDown size={14} className="sort-icon-inactive" />}
                  </div>
                </th>
                <th>
                  <div className="header-content">DETALHES</div>
                </th>
                <th onClick={() => handleSort('stock')} className="sortable-header">
                  <div className="header-content">
                    ESTOQUE
                    {sortConfig?.key === 'stock' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="sort-icon-active" /> : <ChevronDown size={14} className="sort-icon-active" />) : <ChevronDown size={14} className="sort-icon-inactive" />}
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="sortable-header">
                  <div className="header-content">
                    ESTADO
                    {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="sort-icon-active" /> : <ChevronDown size={14} className="sort-icon-active" />) : <ChevronDown size={14} className="sort-icon-inactive" />}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="inventory-row">
                    <td className="item-stock">{item.quantity}</td>
                    <td>
                      <div className="item-name">{item.name}</div>
                      <div className="item-ref">{item.refId}</div>
                    </td>
                    <td className="item-desc">{item.description}</td>
                    <td className="item-stock">{item.quantity} {item.unit}</td>
                    <td>
                      <div className="item-status">
                        <Circle size={8} fill={getStatusColor(item.status)} color={getStatusColor(item.status)} />
                        <span style={{ color: getStatusColor(item.status) }}>{item.status}</span>
                      </div>
                    </td>
                    <td className="row-actions">
                      <div className="inv-actions-cell">
                        <button className="btn-icon" onClick={() => handleEdit(item)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">Nenhum item encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER PAgination */}
        <div className="inventory-modal-footer">
          <span className="footer-text">Exibindo 5 de 128 itens</span>
          <div className="pagination-controls">
            <button className="page-btn page-btn-text"><ChevronLeft size={14} /> Anterior</button>
            <button className="page-btn page-btn-active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn page-btn-text">Próxima <ChevronRight size={14} /></button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InventoryModal;
