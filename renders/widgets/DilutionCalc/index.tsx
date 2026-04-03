import React, { useState } from 'react';
import { ArrowLeft, Beaker, Info, RefreshCw, Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Footer from './../../menus/Footer/index';

type CalcTarget = 'c1' | 'v1' | 'c2' | 'v2';

const DilutionCalc: React.FC = () => {
  const navigate = useNavigate();

  const [target, setTarget] = useState<CalcTarget>('v1');
  const [c1, setC1] = useState('');
  const [v1, setV1] = useState('');
  const [c2, setC2] = useState('');
  const [v2, setV2] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const valC1 = parseFloat(c1);
    const valV1 = parseFloat(v1);
    const valC2 = parseFloat(c2);
    const valV2 = parseFloat(v2);

    try {
      if (target === 'c1' && valV1 && valC2 && valV2) {
        // C1 = (C2 * V2) / V1
        const calc = (valC2 * valV2) / valV1;
        setResult(`C1 = ${calc.toFixed(4)}`);
      } else if (target === 'v1' && valC1 && valC2 && valV2) {
        // V1 = (C2 * V2) / C1
        const calc = (valC2 * valV2) / valC1;
        setResult(`V1 = ${calc.toFixed(4)}`);
      } else if (target === 'c2' && valC1 && valV1 && valV2) {
        // C2 = (C1 * V1) / V2
        const calc = (valC1 * valV1) / valV2;
        setResult(`C2 = ${calc.toFixed(4)}`);
      } else if (target === 'v2' && valC1 && valV1 && valC2) {
        // V2 = (C1 * V1) / C2
        const calc = (valC1 * valV1) / valC2;
        setResult(`V2 = ${calc.toFixed(4)}`);
      } else {
        setResult("Preencha todos os campos requeridos.");
      }
    } catch (error) {
      console.log("Erro no cálculo:", error);
      setResult("Erro no cálculo. Verifique os valores.");
    }
  };

  const handleClear = () => {
    setC1('');
    setV1('');
    setC2('');
    setV2('');
    setResult(null);
  };

  const renderInput = (label: string, symbol: string, value: string, setter: (val: string) => void, unitType: 'conc' | 'vol') => (
    <div className="tool-input-group">
      <label>{label} ({symbol})</label>
      <div className="tool-input-wrapper">
        <input 
          type="number" 
          step="any" 
          value={value} 
          onChange={(e) => setter(e.target.value)} 
          required 
          placeholder="Ex: 10"
        />
        <span className="tool-unit">{unitType === 'conc' ? 'U.C.' : 'U.V.'}</span>
      </div>
    </div>
  );

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
                <div className="tool-icon-large green-theme">
                  <Beaker size={32} />
                </div>
                <div>
                  <h1>Diluição de Soluções</h1>
                  <p>Calcule a concentração ou o volume necessário para diluições a partir de soluções estoque.</p>
                </div>
              </div>

              <div className="tool-card-content">
                <div className="tool-mode-selector">
                  <label>Qual variável você deseja descobrir?</label>
                  <div className="tool-radio-group">
                    <label className={`tool-radio-label ${target === 'c1' ? 'active-green' : ''}`}>
                      <input type="radio" checked={target === 'c1'} onChange={() => { setTarget('c1'); handleClear(); }} />
                      Concentração Inicial (C1)
                    </label>
                    <label className={`tool-radio-label ${target === 'v1' ? 'active-green' : ''}`}>
                      <input type="radio" checked={target === 'v1'} onChange={() => { setTarget('v1'); handleClear(); }} />
                      Volume Inicial (V1)
                    </label>
                    <label className={`tool-radio-label ${target === 'c2' ? 'active-green' : ''}`}>
                      <input type="radio" checked={target === 'c2'} onChange={() => { setTarget('c2'); handleClear(); }} />
                      Concentração Final (C2)
                    </label>
                    <label className={`tool-radio-label ${target === 'v2' ? 'active-green' : ''}`}>
                      <input type="radio" checked={target === 'v2'} onChange={() => { setTarget('v2'); handleClear(); }} />
                      Volume Final (V2)
                    </label>
                  </div>
                </div>

                <form className="tool-form" onSubmit={handleCalculate}>
                  
                  <div className="form-row-split">
                    {target !== 'c1' && renderInput("Concentração Inicial", "C1", c1, setC1, "conc")}
                    {target !== 'v1' && renderInput("Volume Inicial (Estoque)", "V1", v1, setV1, "vol")}
                  </div>
                  
                  <div className="form-row-split">
                    {target !== 'c2' && renderInput("Concentração Final", "C2", c2, setC2, "conc")}
                    {target !== 'v2' && renderInput("Volume Final (Desejado)", "V2", v2, setV2, "vol")}
                  </div>

                  <div className="tool-actions">
                    <button type="button" className="tool-btn-secondary" onClick={handleClear}>
                      <RefreshCw size={18} /> Limpar
                    </button>
                    <button type="submit" className="tool-btn-primary btn-green">
                      Calcular Resultado
                    </button>
                  </div>
                </form>

                {result && (
                  <div className="tool-result-box result-green">
                    <span>O valor encontrado é:</span>
                    <strong>{result}</strong>
                    <p className="result-hint">
                      * O resultado manterá a mesma unidade (U.C. ou U.V.) que você utilizou nos campos de entrada.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Coluna Lateral: Informações */}
            <aside className="tool-sidebar-panel">
              <div className="tool-info-card">
                <h3><Info size={18} /> Sobre a Fórmula</h3>
                <p>A diluição consiste em adicionar solvente a uma solução (estoque) para diminuir sua concentração. A quantidade de soluto permanece constante.</p>
                <div className="tool-formula-box formula-green">
                  <strong>C₁ × V₁ = C₂ × V₂</strong>
                </div>
                <ul className="tool-info-list">
                  <li><strong>C₁:</strong> Concentração da solução estoque</li>
                  <li><strong>V₁:</strong> Volume a ser retirado do estoque</li>
                  <li><strong>C₂:</strong> Concentração desejada na nova solução</li>
                  <li><strong>V₂:</strong> Volume final da nova solução</li>
                </ul>
                <div className="info-alert">
                  <Droplet size={16}/>
                  <small>As unidades de concentração (U.C.) e volume (U.V.) devem ser iguais nos dois lados da equação.</small>
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

export default DilutionCalc;