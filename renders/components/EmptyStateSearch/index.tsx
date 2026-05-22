import React from 'react';
import { SearchX, RefreshCcw } from 'lucide-react';
import './styles.css';

interface EmptyStateSearchProps {
  searchQuery: string;
  onClear: () => void;
  suggestions?: string[];
}

const EmptyStateSearch: React.FC<EmptyStateSearchProps> = ({ searchQuery, onClear, suggestions }) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        <SearchX size={64} color="var(--primary)" />
      </div>
      
      <h2 className="empty-state-title">Nenhum resultado encontrado</h2>
      
      <p className="empty-state-desc">
        Não conseguimos encontrar publicações ou itens correspondentes a "<strong>{searchQuery}</strong>". 
        Tente utilizar termos diferentes ou verifique a ortografia.
      </p>
      
      {suggestions && suggestions.length > 0 && (
        <div className="empty-state-suggestions">
          <p>Você pode tentar pesquisar por:</p>
          <div className="empty-state-tags">
             {suggestions.map((s, idx) => (
                <span key={idx} className="suggestion-tag">{s}</span>
             ))}
          </div>
        </div>
      )}

      <button className="empty-state-btn" onClick={onClear}>
        <RefreshCcw size={18} /> Limpar Filtros
      </button>
    </div>
  );
};

export default EmptyStateSearch;
