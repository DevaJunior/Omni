import React, { useState, useEffect } from 'react';
import { ArrowLeft, Scale, Info, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Footer from '../../menus/Footer';

type Category = 'mass' | 'volume' | 'temperature' | 'pressure';

// Dicionário de unidades e fatores de conversão (Baseados em uma unidade central)
const UNITS = {
  mass: {
    base: 'g',
    options: [
      { id: 'mg', label: 'Miligrama (mg)', factor: 0.001 },
      { id: 'g', label: 'Grama (g)', factor: 1 },
      { id: 'kg', label: 'Quilograma (kg)', factor: 1000 },
      { id: 'lb', label: 'Libra (lb)', factor: 453.592 },
      { id: 'oz', label: 'Onça (oz)', factor: 28.3495 }
    ]
  },
  volume: {
    base: 'L',
    options: [
      { id: 'ul', label: 'Microlitro (µL)', factor: 0.000001 },
      { id: 'ml', label: 'Mililitro (mL)', factor: 0.001 },
      { id: 'l', label: 'Litro (L)', factor: 1 },
      { id: 'gal', label: 'Galão Americano (gal)', factor: 3.78541 },
      { id: 'floz', label: 'Onça Líquida (fl oz)', factor: 0.0295735 }
    ]
  },
  pressure: {
    base: 'atm',
    options: [
      { id: 'atm', label: 'Atmosfera (atm)', factor: 1 },
      { id: 'bar', label: 'Bar', factor: 0.986923 },
      { id: 'pa', label: 'Pascal (Pa)', factor: 0.00000986923 },
      { id: 'kpa', label: 'Quilopascal (kPa)', factor: 0.00986923 },
      { id: 'mmhg', label: 'Milímetros de Mercúrio (mmHg / Torr)', factor: 0.00131579 },
      { id: 'psi', label: 'Libra-força por polegada (psi)', factor: 0.068046 }
    ]
  },
  temperature: {
    // Temperatura não usa fator multiplicativo simples, requer fórmula
    options: [
      { id: 'c', label: 'Celsius (°C)' },
      { id: 'f', label: 'Fahrenheit (°F)' },
      { id: 'k', label: 'Kelvin (K)' }
    ]
  }
};

const UnitConverter: React.FC = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category>('mass');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('g');
  const [toUnit, setToUnit] = useState<string>('mg');
  const [result, setResult] = useState<string | null>(null);

  // Atualiza as unidades padrão quando a categoria muda
  useEffect(() => {
    const opts = UNITS[category].options;
    setFromUnit(opts[0].id);
    setToUnit(opts[1]?.id || opts[0].id);
    setResult(null);
  }, [category]);

  const convertTemperature = (val: number, from: string, to: string): number => {
    if (from === to) return val;
    let celsius = val;
    
    // Converte de 'from' para Celsius
    if (from === 'f') celsius = (val - 32) * 5/9;
    if (from === 'k') celsius = val - 273.15;

    // Converte de Celsius para 'to'
    if (to === 'f') return (celsius * 9/5) + 32;
    if (to === 'k') return celsius + 273.15;
    
    return celsius; // to === 'c'
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setResult("Insira um número válido.");
      return;
    }

    if (category === 'temperature') {
      const res = convertTemperature(val, fromUnit, toUnit);
      setResult(res.toFixed(4).replace(/\.0000$/, ''));
      return;
    }

    // Lógica para Massa, Volume e Pressão (Fator multiplicativo)
    const categoryData = UNITS[category];
    const fromDef = categoryData.options.find(o => o.id === fromUnit);
    const toDef = categoryData.options.find(o => o.id === toUnit);

    if (fromDef && toDef) {
      // Converte para a base e depois para o destino
      const valueInBase = val * fromDef.factor;
      const finalValue = valueInBase / toDef.factor;
      
      // Formatação bonita para evitar 0.0000 ou números científicos feios quando possível
      let formattedResult = finalValue.toFixed(6).replace(/\.?0+$/, '');
      if (finalValue < 0.000001 && finalValue > 0) {
        formattedResult = finalValue.toExponential(4);
      }
      
      setResult(formattedResult);
    }
  };

  // Calcula automaticamente quando os valores mudam
  useEffect(() => {
    if (inputValue) handleCalculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, fromUnit, toUnit]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <>
      <div className="tool-page-wrapper">
        <div className="tool-container">
          
          <button className="tool-btn-back" onClick={() => navigate('/lab')}>
            <ArrowLeft size={18} />
            Voltar para Bancada
          </button>

          <div className="tool-grid-layout">
            
            {/* Coluna Principal: Conversor */}
            <div className="tool-main-panel">
              <div className="tool-header">
                <div className="tool-icon-large indigo-theme">
                  <Scale size={32} />
                </div>
                <div>
                  <h1>Conversor Universal</h1>
                  <p>Converta rapidamente unidades de massa, volume, temperatura e pressão.</p>
                </div>
              </div>

              <div className="tool-card-content">
                
                {/* Seletor de Categoria */}
                <div className="tool-mode-selector">
                  <label>Selecione a Grandeza Física</label>
                  <div className="tool-radio-group">
                    {(['mass', 'volume', 'temperature', 'pressure'] as Category[]).map(cat => (
                      <label key={cat} className={`tool-radio-label ${category === cat ? 'active-indigo' : ''}`}>
                        <input type="radio" checked={category === cat} onChange={() => setCategory(cat)} />
                        {cat === 'mass' ? 'Massa' : cat === 'volume' ? 'Volume' : cat === 'temperature' ? 'Temperatura' : 'Pressão'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="converter-work-area">
                  
                  {/* Bloco De (Origem) */}
                  <div className="converter-block">
                    <label>Converter de</label>
                    <div className="converter-input-wrapper">
                      <input 
                        type="number" 
                        step="any"
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        placeholder="0.0"
                      />
                      <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                        {UNITS[category].options.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Botão de Inverter */}
                  <div className="converter-swap-row">
                    <button className="converter-btn-swap" onClick={handleSwap} title="Inverter unidades">
                      <ArrowRightLeft size={20} />
                    </button>
                  </div>

                  {/* Bloco Para (Destino) */}
                  <div className="converter-block">
                    <label>Para</label>
                    <div className="converter-input-wrapper result-wrapper">
                      <div className="converter-result-display">
                        {result !== null ? result : '0.0'}
                      </div>
                      <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                        {UNITS[category].options.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                <div className="tool-actions" style={{ marginTop: '2rem' }}>
                  <button type="button" className="tool-btn-secondary" onClick={() => setInputValue('')}>
                    <RefreshCw size={18} /> Limpar Valor
                  </button>
                </div>

              </div>
            </div>

            {/* Coluna Lateral: Informações */}
            <aside className="tool-sidebar-panel">
              <div className="tool-info-card">
                <h3><Info size={18} /> Dicas de Uso</h3>
                <p>O Conversor Universal detecta automaticamente as mudanças numéricas e atualiza o resultado em tempo real.</p>
                <div className="tool-formula-box formula-indigo">
                  <ArrowRightLeft size={24} style={{ margin: '0 auto' }}/>
                </div>
                <ul className="tool-info-list">
                  <li><strong>Sistema Internacional:</strong> Priorize sempre o uso do SI (kg, L, K, Pa) em publicações oficiais.</li>
                  <li><strong>Precisão:</strong> Os resultados são calculados com alta precisão e formatados automaticamente para notação científica em casos de medidas extremas (ex: kg para µL).</li>
                </ul>
              </div>
            </aside>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UnitConverter;