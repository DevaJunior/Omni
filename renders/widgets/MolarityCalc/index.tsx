import React, { useState } from 'react';
import { ArrowLeft, Calculator, Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../renders/menus/Footer';
import './styles.css';

type CalcMode = 'mass' | 'volume' | 'concentration';

const MolarityCalc: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<CalcMode>('mass');
  const [mass, setMass] = useState('');
  const [volume, setVolume] = useState('');
  const [molarMass, setMolarMass] = useState('');
  const [concentration, setConcentration] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const m = parseFloat(mass);
    const v = parseFloat(volume);
    const mm = parseFloat(molarMass);
    const c = parseFloat(concentration);

    try {
      if (mode === 'mass' && c && v && mm) {
        // m = C * V * MM
        const calcMass = c * v * mm;
        setResult(`${calcMass.toFixed(4)} g`);
      } else if (mode === 'volume' && m && c && mm) {
        // V = m / (C * MM)
        const calcVol = m / (c * mm);
        setResult(`${calcVol.toFixed(4)} L`);
      } else if (mode === 'concentration' && m && v && mm) {
        // C = m / (MM * V)
        const calcConc = m / (mm * v);
        setResult(`${calcConc.toFixed(4)} mol/L`);
      } else {
        setResult("Preencha todos os campos corretamente.");
      }
    } catch (error) {
      console.log("Erro no cálculo:", error);
      setResult("Erro no cálculo. Verifique os valores.");
    }
  };

  const handleClear = () => {
    setMass('');
    setVolume('');
    setMolarMass('');
    setConcentration('');
    setResult(null);
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
            
            {/* Coluna Principal: Calculadora */}
            <div className="tool-main-panel">
              <div className="tool-header">
                <div className="tool-icon-large">
                  <Calculator size={32} />
                </div>
                <div>
                  <h1>Calculadora de Molaridade</h1>
                  <p>Determine a massa, volume ou concentração para o preparo de soluções químicas.</p>
                </div>
              </div>

              <div className="tool-card-content">
                <div className="tool-mode-selector">
                  <label>O que você deseja calcular?</label>
                  <div className="tool-radio-group">
                    <label className={`tool-radio-label ${mode === 'mass' ? 'active' : ''}`}>
                      <input type="radio" name="mode" checked={mode === 'mass'} onChange={() => { setMode('mass'); handleClear(); }} />
                      Massa (g)
                    </label>
                    <label className={`tool-radio-label ${mode === 'volume' ? 'active' : ''}`}>
                      <input type="radio" name="mode" checked={mode === 'volume'} onChange={() => { setMode('volume'); handleClear(); }} />
                      Volume (L)
                    </label>
                    <label className={`tool-radio-label ${mode === 'concentration' ? 'active' : ''}`}>
                      <input type="radio" name="mode" checked={mode === 'concentration'} onChange={() => { setMode('concentration'); handleClear(); }} />
                      Concentração (mol/L)
                    </label>
                  </div>
                </div>

                <form className="tool-form" onSubmit={handleCalculate}>
                  
                  {mode !== 'mass' && (
                    <div className="tool-input-group">
                      <label>Massa do Soluto (m)</label>
                      <div className="tool-input-wrapper">
                        <input type="number" step="any" value={mass} onChange={(e) => setMass(e.target.value)} required />
                        <span className="tool-unit">g</span>
                      </div>
                    </div>
                  )}

                  <div className="tool-input-group">
                    <label>Massa Molar (MM)</label>
                    <div className="tool-input-wrapper">
                      <input type="number" step="any" value={molarMass} onChange={(e) => setMolarMass(e.target.value)} required />
                      <span className="tool-unit">g/mol</span>
                    </div>
                  </div>

                  {mode !== 'volume' && (
                    <div className="tool-input-group">
                      <label>Volume da Solução (V)</label>
                      <div className="tool-input-wrapper">
                        <input type="number" step="any" value={volume} onChange={(e) => setVolume(e.target.value)} required />
                        <span className="tool-unit">L</span>
                      </div>
                    </div>
                  )}

                  {mode !== 'concentration' && (
                    <div className="tool-input-group">
                      <label>Concentração Molar (C)</label>
                      <div className="tool-input-wrapper">
                        <input type="number" step="any" value={concentration} onChange={(e) => setConcentration(e.target.value)} required />
                        <span className="tool-unit">mol/L</span>
                      </div>
                    </div>
                  )}

                  <div className="tool-actions">
                    <button type="button" className="tool-btn-secondary" onClick={handleClear}>
                      <RefreshCw size={18} /> Limpar
                    </button>
                    <button type="submit" className="tool-btn-primary">
                      Calcular Resultado
                    </button>
                  </div>
                </form>

                {result && (
                  <div className="tool-result-box">
                    <span>Resultado Calculado:</span>
                    <strong>{result}</strong>
                  </div>
                )}

              </div>
            </div>

            {/* Coluna Lateral: Informações Adicionais */}
            <aside className="tool-sidebar-panel">
              <div className="tool-info-card">
                <h3><Info size={18} /> Sobre a Fórmula</h3>
                <p>A molaridade (M) ou concentração em quantidade de matéria indica a relação entre a massa do soluto, sua massa molar e o volume final da solução.</p>
                <div className="tool-formula-box">
                  <strong>C = m / (MM × V)</strong>
                </div>
                <ul className="tool-info-list">
                  <li><strong>C:</strong> Concentração (mol/L)</li>
                  <li><strong>m:</strong> Massa do soluto (g)</li>
                  <li><strong>MM:</strong> Massa molar (g/mol)</li>
                  <li><strong>V:</strong> Volume da solução (L)</li>
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

export default MolarityCalc;