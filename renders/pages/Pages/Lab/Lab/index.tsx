import React, { useState } from 'react';
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
import './styles.css';
import Footer from '../../../../menus/Footer';

// Tipagem das ferramentas
type Tool = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  isNew?: boolean;
  isLocked?: boolean;
  favorite?: boolean;
};

const MOCK_TOOLS: Tool[] = [
  {
    id: 'molarity-calc',
    name: 'Calculadora de Molaridade',
    description: 'Calcule a massa, volume ou concentração para o preparo de soluções químicas rapidamente.',
    category: 'Química',
    icon: <Calculator size={24} />,
    favorite: true
  },
  {
    id: 'dilution',
    name: 'Diluição de Soluções',
    description: 'Ferramenta baseada na fórmula C1V1 = C2V2 para diluições seriadas na bancada.',
    category: 'Química',
    icon: <Beaker size={24} />
  },
  {
    id: 'lab-timer',
    name: 'Cronômetro Múltiplo',
    description: 'Gerencie o tempo de incubação de múltiplas amostras simultaneamente.',
    category: 'Produtividade',
    icon: <Timer size={24} />,
    isNew: true
  },
  {
    id: 'unit-converter',
    name: 'Conversor Universal',
    description: 'Converta unidades de massa, volume, pressão e temperatura do SI e sistemas imperiais.',
    category: 'Geral',
    icon: <Scale size={24} />
  },
  {
    id: 'inventory',
    name: 'Inventário de Reagentes',
    description: 'Controle de estoque, lote, validade e FISPQ dos reagentes do seu laboratório.',
    category: 'Gestão',
    icon: <Database size={24} />
  },
  {
    id: 'p-fuzzy-engine',
    name: 'Motor P-Fuzzy',
    description: 'Módulo avançado para análise de dados e predição de eficiência em bioprocessos.',
    category: 'Análise de Dados',
    icon: <Settings2 size={24} />,
    isLocked: true // Deixamos trancado por enquanto como "Em breve"
  }
];

const CATEGORIES = ['Todas', 'Favoritos', 'Química', 'Produtividade', 'Gestão', 'Análise de Dados'];

const Lab: React.FC = () => {
  const navigate = useNavigate(); // 2. INSTANCIA O HOOK
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');

  // Filtra as ferramentas com base na busca e na categoria selecionada
  const filteredTools = MOCK_TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeCategory === 'Todas') return matchesSearch;
    if (activeCategory === 'Favoritos') return matchesSearch && tool.favorite;
    return matchesSearch && tool.category === activeCategory;
  });

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