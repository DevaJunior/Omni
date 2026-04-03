import React, { useState, useEffect } from 'react';
import { Settings2, ArrowRight, Activity, Sprout, TestTube2, Calculator, ArrowLeft, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calcularSistemaCompleto, type PFuzzyRizofiltracaoParams, type PFuzzyRizofiltracaoResult } from './engine';
import './styles.css';
import Footer from '../../../../menus/Footer';

// Componente para desenhar o gráfico SVG
const FuzzyPlot = ({ curva, valor, color }: { curva: number[], valor: number, color: string }) => {
  const points = curva.map((y, index) => {
    const x = (index / (curva.length - 1)) * 100;
    const svgY = 100 - (y * 100);
    return `${x},${svgY}`;
  }).join(' ');

  const polygonPoints = `0,100 ${points} 100,100`;

  return (
    <div className="fuzzy-plot-container">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="fuzzy-svg">
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
        <line x1="0" y1="100" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="1" />
        <polygon points={polygonPoints} fill={color} fillOpacity="0.3" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        {valor > 0 && (
          <line x1={valor} y1="0" x2={valor} y2="100" stroke="#ef4444" strokeWidth="1" />
        )}
      </svg>
      <div className="fuzzy-axis-labels">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
};

const PFuzzyRizofiltracao: React.FC = () => {
  const navigate = useNavigate(); // <-- Hook de navegação adicionado

  const [params, setParams] = useState<PFuzzyRizofiltracaoParams>({
    ph: 7.0, ce: 1500, luz: 1000,
    ft: 2.0, fen: 50, raiz: 7.0,
    conc: 500, tempo: 45, bio: 50
  });

  const [result, setResult] = useState<PFuzzyRizofiltracaoResult | null>(null);

  const handleCalculate = () => {
    const res = calcularSistemaCompleto(params);
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateParam = (key: keyof PFuzzyRizofiltracaoParams, val: string) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  // <-- FUNÇÃO INTELIGENTE GERADORA DE INSIGHTS -->
  const generateInsight = (res: PFuzzyRizofiltracaoResult) => {
    let insight = "";

    // Análise do Módulo A: Ambiente
    if (res.amb.valor >= 70) insight += "O ambiente apresenta excelentes condições físico-químicas de cultivo. ";
    else if (res.amb.valor >= 40) insight += "As condições ambientais são medianas, podendo limitar levemente o estresse abiótico. ";
    else insight += "Atenção: O ambiente (pH, CE ou Luz) está severamente hostil para a planta. ";

    // Análise do Módulo B: Planta
    if (res.phys.valor >= 70) insight += "A espécie demonstra altíssimo potencial biológico, com sistema radicular denso e forte fator de translocação. ";
    else if (res.phys.valor >= 40) insight += "O estágio fenológico e a capacidade extratora encontram-se em níveis operacionais aceitáveis. ";
    else insight += "A planta apresenta baixo vigor ou encontra-se em senescência avançada, comprometendo o processo. ";

    // Análise do Módulo C: Operacional
    if (res.ops.valor >= 70) insight += "A proporção entre carga de contaminante, tempo de retenção e biomassa inicial está otimizada. ";
    else if (res.ops.valor >= 40) insight += "A performance de engenharia é regular; considere aumentar o tempo de retenção ou a biomassa para melhorar a extração. ";
    else insight += "A carga de contaminante é demasiadamente alta para a biomassa e o tempo configurados. ";

    // Conclusão Global
    insight += "\n\n";
    if (res.final >= 75) {
      insight += "🧪 CONCLUSÃO: O bioprocesso projetado tem ALTÍSSIMA viabilidade e probabilidade de sucesso na fitorremediação.";
    } else if (res.final >= 45) {
      insight += "⚖️ CONCLUSÃO: O sistema é VIÁVEL, mas possui gargalos que podem deixar resíduos de contaminantes na água.";
    } else {
      insight += "🛑 CONCLUSÃO: INVIÁVEL no cenário atual. É imprescindível rever e corrigir os parâmetros de entrada antes de iniciar o escalonamento.";
    }

    return insight;
  };

  return (
    <>
      <div className="pfuzzy-wrapper">
        <div className="pfuzzy-container">
          
          {/* <-- TOP BAR COM BOTÃO DE VOLTAR --> */}
          <div className="engine-top-bar" style={{ marginBottom: '1.5rem' }}>
            <button className="btn-back-engine" onClick={() => navigate('/lab')}>
              <ArrowLeft size={18} /> Voltar para Bancada
            </button>
          </div>

          <header className="pfuzzy-header">
            <div className="pfuzzy-title-icon"><Settings2 size={40} /></div>
            <div className="pfuzzy-title-texts">
              <h1>Motor Hierárquico P-Fuzzy</h1>
              <p>Simulador de Eficiência em Fitorremediação via Lógica Nebulosa</p>
            </div>
          </header>

          <div className="pfuzzy-main-grid">
            
            {/* PAINEL ESQUERDO: CONTROLES */}
            <div className="pfuzzy-controls-panel">
              {/* Módulo A */}
              <div className="control-module">
                <h3><Activity size={18}/> 1. Variáveis Ambientais</h3>
                <div className="control-group">
                  <label>pH da Água <span>{params.ph.toFixed(1)}</span></label>
                  <input type="range" min="0" max="14" step="0.1" value={params.ph} onChange={(e) => updateParam('ph', e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Condutividade Elétrica (µS/cm) <span>{params.ce}</span></label>
                  <input type="range" min="0" max="5000" step="10" value={params.ce} onChange={(e) => updateParam('ce', e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Luminosidade (PPFD) <span>{params.luz}</span></label>
                  <input type="range" min="0" max="2000" step="10" value={params.luz} onChange={(e) => updateParam('luz', e.target.value)} />
                </div>
              </div>

              {/* Módulo B */}
              <div className="control-module">
                <h3><Sprout size={18}/> 2. Fatores Fisiológicos</h3>
                <div className="control-group">
                  <label>Fator de Translocação (FT) <span>{params.ft.toFixed(1)}</span></label>
                  <input type="range" min="0" max="5" step="0.1" value={params.ft} onChange={(e) => updateParam('ft', e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Estágio Fenológico (%) <span>{params.fen}</span></label>
                  <input type="range" min="0" max="100" step="1" value={params.fen} onChange={(e) => updateParam('fen', e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Densidade Radicular (0-10) <span>{params.raiz.toFixed(1)}</span></label>
                  <input type="range" min="0" max="10" step="0.1" value={params.raiz} onChange={(e) => updateParam('raiz', e.target.value)} />
                </div>
              </div>

              {/* Módulo C */}
              <div className="control-module">
                <h3><TestTube2 size={18}/> 3. Parâmetros Operacionais</h3>
                <div className="control-group">
                  <label>Concentração do Contaminante (mg/L) <span>{params.conc}</span></label>
                  <input type="range" min="0" max="1000" step="1" value={params.conc} onChange={(e) => updateParam('conc', e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Tempo de Retenção (Dias) <span>{params.tempo}</span></label>
                  <input type="range" min="0" max="90" step="1" value={params.tempo} onChange={(e) => updateParam('tempo', e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Biomassa Inicial (g) <span>{params.bio}</span></label>
                  <input type="range" min="0" max="100" step="1" value={params.bio} onChange={(e) => updateParam('bio', e.target.value)} />
                </div>
              </div>

              <button className="pf-btn-calc" onClick={handleCalculate}>
                <Calculator size={20} /> Processar Inferência Fuzzy
              </button>
            </div>

            {/* PAINEL DIREITO: RESULTADOS E GRÁFICOS */}
            <div className="pfuzzy-results-panel">
              
              {result && (
                <>
                  <div className="pf-charts-row">
                    <div className="pf-chart-card">
                      <h4>Mod A: Adequação Ambiental</h4>
                      <FuzzyPlot curva={result.amb.curva} valor={result.amb.valor} color="#06b6d4" />
                      <div className="pf-val-badge amb">{result.amb.valor.toFixed(1)}%</div>
                    </div>
                    
                    <div className="pf-chart-card">
                      <h4>Mod B: Potencial Biológico</h4>
                      <FuzzyPlot curva={result.phys.curva} valor={result.phys.valor} color="#22c55e" />
                      <div className="pf-val-badge phys">{result.phys.valor.toFixed(1)}%</div>
                    </div>

                    <div className="pf-chart-card">
                      <h4>Mod C: Performance Op.</h4>
                      <FuzzyPlot curva={result.ops.curva} valor={result.ops.valor} color="#f59e0b" />
                      <div className="pf-val-badge ops">{result.ops.valor.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="pf-arrow-down"><ArrowRight size={24} /></div>

                  <div className="pf-final-card">
                    <h2>Eficiência Global do Sistema</h2>
                    <div className="pf-final-value">{result.final.toFixed(2)}%</div>
                    <div className="pf-vigor-text">
                      Penalizada pelo Vigor Geral do Sistema em <strong>{result.vigor.toFixed(1)}%</strong>
                    </div>
                  </div>

                  {/* <-- CARD DE INSIGHT INTELIGENTE --> */}
                  <div className="pf-insight-card">
                    <h3 className="pf-insight-title"><Lightbulb size={20} className="insight-icon" /> Interpretação Analítica (Sistema Especialista)</h3>
                    <p className="pf-insight-text">{generateInsight(result)}</p>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PFuzzyRizofiltracao;