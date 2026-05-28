import React from 'react';
import { SearchX, RefreshCcw } from 'lucide-react';
import './styles.css';

interface EmptyStateSearchProps {
  searchQuery: string;
  onClear: () => void;
  suggestions?: string[];
  showTabSuggestion?: boolean;
}

const EmptyStateSearch: React.FC<EmptyStateSearchProps> = ({ searchQuery, onClear, suggestions, showTabSuggestion }) => {
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

      {showTabSuggestion && (
        <p className="empty-state-desc" style={{ marginTop: '0.5rem', fontWeight: 500 }}>
          💡 Dica: Verifique se o conteúdo desejado não se encontra nas demais abas (Discussões ou Projetos e Oportunidades).
        </p>
      )}
      
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
