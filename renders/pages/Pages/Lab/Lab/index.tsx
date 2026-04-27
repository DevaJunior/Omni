import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT NECESSÁRIO
import {
  Search,
  Settings2,
  Beaker,
  Calculator,
  Timer,
  Scale,
  Database,
  Lock,
  ChevronRight,
  Star
} from 'lucide-react';
import { labService } from '../../../../../src/services/labService';
import type { Tool } from '../../../../../src/types/lab';
import './styles.css';
import Footer from '../../../../menus/Footer';

const CATEGORIES = ['Todas', 'Favoritos', 'Química', 'Produtividade', 'Gestão', 'Análise de Dados'];

const Lab: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [toolsState, setToolsState] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapeamento dinâmico de ícones com base na categoria ou ID para quando vier do banco
  const getIconForTool = (id: string, _category?: string) => {
    switch (id) {
      case 'molarity-calc': return <Calculator size={24} />;
      case 'dilution': return <Beaker size={24} />;
      case 'lab-timer': return <Timer size={24} />;
      case 'unit-converter': return <Scale size={24} />;
      case 'inventory': return <Database size={24} />;
      default: return <Settings2 size={24} />;
    }
  };

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await labService.getTools();
        setToolsState(data.map(t => ({
          ...t,
          icon: getIconForTool(t.id, t.category)
        })));
      } catch (error) {
        console.error("Erro ao buscar ferramentas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  // Filtra as ferramentas com base na busca e na categoria selecionada
  const filteredTools = toolsState.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeCategory === 'Todas') return matchesSearch;
    if (activeCategory === 'Favoritos') return matchesSearch && tool.favorite;
    return matchesSearch && tool.category === activeCategory;
  });

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Bancada...</div>;

  return (
    <>
      <div className="lab-bancada-wrapper">
        <div className="lab-bancada-container">

          {/* HEADER DA BANCADA */}
          <header className="bancada-header">
            <div className="bancada-title-area">
              <h1>Bancada de Ferramentas</h1>
              <p>Explore nossa suíte de utilitários projetados para otimizar sua rotina no laboratório e na pesquisa.</p>
            </div>

            <div className="bancada-search-box">
              <Search size={20} className="bancada-search-icon" />
              <input
                type="text"
                placeholder="Buscar ferramenta ou calculadora..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          {/* FILTROS DE CATEGORIA (Pills) */}
          <div className="bancada-categories-scroll">
            <div className="bancada-categories">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`bancada-category-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'Favoritos' && <Star size={14} className={activeCategory === cat ? 'fill-star' : ''} />}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* GRID DE FERRAMENTAS */}
          <main className="bancada-tools-grid">
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <div
                  key={tool.id}
                  className={`bancada-tool-card ${tool.isLocked ? 'locked' : ''}`}
                >
                  <div className="tool-card-header">
                    <div className={`tool-icon-wrapper ${tool.isLocked ? 'locked-icon' : ''}`}>
                      {tool.icon}
                    </div>
                    <div className="tool-badges">
                      {tool.isNew && <span className="tool-badge new">Novo</span>}
                      {tool.isLocked && <span className="tool-badge locked"><Lock size={12} /> Em breve</span>}
                    </div>
                  </div>

                  <div className="tool-card-body">
                    <h3 className="tool-title">{tool.name}</h3>
                    <p className="tool-description">{tool.description}</p>
                  </div>

                  <div className="tool-card-footer">
                    <span className="tool-category-label">{tool.category}</span>
                    <button
                      className="tool-btn-open"
                      disabled={tool.isLocked}
                      onClick={() => navigate(`/lab/${tool.id}`)} // 3. SUBSTITUÍDO ALERT PELO NAVIGATE
                    >
                      {tool.isLocked ? 'Indisponível' : 'Acessar'} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bancada-empty-state">
                <Settings2 size={48} />
                <h3>Nenhuma ferramenta encontrada</h3>
                <p>Tente ajustar sua busca ou filtro de categoria.</p>
              </div>
            )}
          </main>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Lab;