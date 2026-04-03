import React, { useState } from 'react';
import {
  Settings2,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  GitMerge,
  Activity,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Footer from '../../menus/Footer';

// --- TIPAGENS DA ENGINE ---
type FuzzyTerm = {
  id: string;
  name: string; // Ex: "Baixo", "Médio"
  points: [number, number, number, number]; // a, b, c, d (Trapézio)
};

type FuzzyVariable = {
  id: string;
  name: string; // Ex: "Temperatura", "pH"
  type: 'input' | 'output';
  unit: string;
  min: number;
  max: number;
  terms: FuzzyTerm[];
};

type FuzzyRule = {
  id: string;
  conditions: { varId: string; termId: string }[]; // IF var1 IS term1 AND ...
  conclusion: { varId: string; termId: string };   // THEN outVar IS termOut
  weight: number; // 0.0 a 1.0
};

type PFuzzyModel = {
  name: string;
  description: string;
  variables: FuzzyVariable[];
  rules: FuzzyRule[];
};

// --- UTILITÁRIOS ---
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

const PFuzzyEngine: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(1);

  const [model, setModel] = useState<PFuzzyModel>({
    name: '',
    description: '',
    variables: [],
    rules: []
  });

  // --- FUNÇÕES DE MANIPULAÇÃO DO MODELO ---
  const handleAddVariable = (type: 'input' | 'output') => {
    const newVar: FuzzyVariable = {
      id: generateId(),
      name: `Nova Variável (${type === 'input' ? 'Entrada' : 'Saída'})`,
      type,
      unit: '',
      min: 0,
      max: 100,
      terms: []
    };
    setModel(prev => ({ ...prev, variables: [...prev.variables, newVar] }));
  };

  // TIPAGEM GENERICA: Garante que 'value' corresponde ao tipo da chave 'field' em FuzzyVariable
  const handleUpdateVariable = <K extends keyof FuzzyVariable>(id: string, field: K, value: FuzzyVariable[K]) => {
    setModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
  };

  const handleRemoveVariable = (id: string) => {
    setModel(prev => ({ ...prev, variables: prev.variables.filter(v => v.id !== id) }));
  };

  const handleAddTerm = (varId: string) => {
    const newTerm: FuzzyTerm = {
      id: generateId(),
      name: 'Novo Conjunto',
      points: [0, 25, 75, 100]
    };
    setModel(prev => ({
      ...prev,
      variables: prev.variables.map(v =>
        v.id === varId ? { ...v, terms: [...v.terms, newTerm] } : v
      )
    }));
  };

  // TIPAGEM GENERICA: Garante que 'value' corresponde ao tipo da chave 'field' em FuzzyTerm
  const handleUpdateTerm = <K extends keyof FuzzyTerm>(varId: string, termId: string, field: K, value: FuzzyTerm[K]) => {
    setModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => {
        if (v.id === varId) {
          return {
            ...v,
            terms: v.terms.map(t => t.id === termId ? { ...t, [field]: value } : t)
          };
        }
        return v;
      })
    }));
  };

  const handleRemoveTerm = (varId: string, termId: string) => {
    setModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => {
        if (v.id === varId) {
          return { ...v, terms: v.terms.filter(t => t.id !== termId) };
        }
        return v;
      })
    }));
  };

  const handleAddRule = () => {
    const newRule: FuzzyRule = {
      id: generateId(),
      conditions: [],
      conclusion: { varId: '', termId: '' },
      weight: 1.0
    };
    setModel(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  const inputs = model.variables.filter(v => v.type === 'input');
  const outputs = model.variables.filter(v => v.type === 'output');

  // --- RENDERIZADORES DE PASSOS ---
  const renderStep1 = () => (
    <div className="engine-step-content anim-fade-in">
      <h2>Metadados do Modelo</h2>
      <p className="engine-subtitle">Defina a identidade do seu novo sistema especialista.</p>

      <div className="engine-form-group">
        <label>Nome do Modelo</label>
        <input
          type="text"
          placeholder="Ex: Predição de Viabilidade de Biogás"
          value={model.name}
          onChange={(e) => setModel({ ...model, name: e.target.value })}
        />
      </div>

      <div className="engine-form-group">
        <label>Descrição / Objetivo</label>
        <textarea
          rows={4}
          placeholder="Descreva o problema que este sistema P-Fuzzy irá resolver..."
          value={model.description}
          onChange={(e) => setModel({ ...model, description: e.target.value })}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="engine-step-content anim-fade-in">
      <h2>Variáveis do Sistema (Universos)</h2>
      <p className="engine-subtitle">Defina as variáveis de entrada (sensores/dados) e as variáveis de saída (resultados).</p>

      <div className="variables-section">
        <div className="variables-header">
          <h3>Entradas (Inputs)</h3>
          <button className="btn-engine-outline small" onClick={() => handleAddVariable('input')}>
            <Plus size={16} /> Adicionar Entrada
          </button>
        </div>

        {inputs.length === 0 && <div className="empty-box">Nenhuma entrada definida.</div>}

        {inputs.map(v => (
          <div key={v.id} className="variable-card">
            <div className="var-card-header">
              <input
                type="text"
                value={v.name}
                onChange={(e) => handleUpdateVariable(v.id, 'name', e.target.value)}
                className="var-name-input"
              />
              <button className="btn-icon-danger" onClick={() => handleRemoveVariable(v.id)}><Trash2 size={16} /></button>
            </div>
            <div className="var-config-row">
              <div className="var-config-item">
                <label>Unidade</label>
                <input type="text" placeholder="Ex: mg/L" value={v.unit} onChange={(e) => handleUpdateVariable(v.id, 'unit', e.target.value)} />
              </div>
              <div className="var-config-item">
                <label>Mínimo</label>
                <input type="number" value={v.min} onChange={(e) => handleUpdateVariable(v.id, 'min', parseFloat(e.target.value))} />
              </div>
              <div className="var-config-item">
                <label>Máximo</label>
                <input type="number" value={v.max} onChange={(e) => handleUpdateVariable(v.id, 'max', parseFloat(e.target.value))} />
              </div>
            </div>
          </div>
        ))}

        <div className="variables-header mt-4">
          <h3>Saídas (Outputs)</h3>
          <button className="btn-engine-outline small" onClick={() => handleAddVariable('output')}>
            <Plus size={16} /> Adicionar Saída
          </button>
        </div>

        {outputs.length === 0 && <div className="empty-box">Nenhuma saída definida.</div>}

        {outputs.map(v => (
          <div key={v.id} className="variable-card output-card">
            <div className="var-card-header">
              <input
                type="text"
                value={v.name}
                onChange={(e) => handleUpdateVariable(v.id, 'name', e.target.value)}
                className="var-name-input"
              />
              <button className="btn-icon-danger" onClick={() => handleRemoveVariable(v.id)}><Trash2 size={16} /></button>
            </div>
            <div className="var-config-row">
              <div className="var-config-item">
                <label>Unidade</label>
                <input type="text" placeholder="Ex: %" value={v.unit} onChange={(e) => handleUpdateVariable(v.id, 'unit', e.target.value)} />
              </div>
              <div className="var-config-item">
                <label>Mínimo</label>
                <input type="number" value={v.min} onChange={(e) => handleUpdateVariable(v.id, 'min', parseFloat(e.target.value))} />
              </div>
              <div className="var-config-item">
                <label>Máximo</label>
                <input type="number" value={v.max} onChange={(e) => handleUpdateVariable(v.id, 'max', parseFloat(e.target.value))} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="engine-step-content anim-fade-in">
      <h2>Funções de Pertinência (Conjuntos)</h2>
      <p className="engine-subtitle">Para cada variável, crie os conjuntos linguísticos e defina os 4 pontos trapezoidais [a, b, c, d].</p>

      {model.variables.length === 0 ? (
        <div className="empty-box">Volte ao passo anterior e crie variáveis primeiro.</div>
      ) : (
        <div className="membership-accordion">
          {model.variables.map(v => (
            <div key={v.id} className="membership-section">
              <div className="membership-header">
                <h3>{v.name} <span className="badge-type">{v.type === 'input' ? 'Entrada' : 'Saída'}</span></h3>
                <button className="btn-engine-solid small" onClick={() => handleAddTerm(v.id)}>
                  <Plus size={16} /> Add Conjunto
                </button>
              </div>

              <div className="terms-list">
                {v.terms.length === 0 && <span className="text-muted">Sem conjuntos definidos.</span>}
                {v.terms.map((term, index) => (
                  <div key={term.id} className="term-card">
                    <div className="term-name-box">
                      <div className="color-indicator" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                      <input
                        type="text"
                        value={term.name}
                        onChange={(e) => handleUpdateTerm(v.id, term.id, 'name', e.target.value)}
                        placeholder="Ex: Baixo, Ideal..."
                      />
                    </div>

                    <div className="trap-points">
                      <div className="trap-input">
                        <label>a</label>
                        <input type="number" value={term.points[0]} onChange={(e) => {
                          const newPts: [number, number, number, number] = [...term.points]; newPts[0] = parseFloat(e.target.value);
                          handleUpdateTerm(v.id, term.id, 'points', newPts);
                        }} />
                      </div>
                      <div className="trap-input">
                        <label>b</label>
                        <input type="number" value={term.points[1]} onChange={(e) => {
                          const newPts: [number, number, number, number] = [...term.points]; newPts[1] = parseFloat(e.target.value);
                          handleUpdateTerm(v.id, term.id, 'points', newPts);
                        }} />
                      </div>
                      <div className="trap-input">
                        <label>c</label>
                        <input type="number" value={term.points[2]} onChange={(e) => {
                          const newPts: [number, number, number, number] = [...term.points]; newPts[2] = parseFloat(e.target.value);
                          handleUpdateTerm(v.id, term.id, 'points', newPts);
                        }} />
                      </div>
                      <div className="trap-input">
                        <label>d</label>
                        <input type="number" value={term.points[3]} onChange={(e) => {
                          const newPts: [number, number, number, number] = [...term.points]; newPts[3] = parseFloat(e.target.value);
                          handleUpdateTerm(v.id, term.id, 'points', newPts);
                        }} />
                      </div>
                      <button className="btn-icon-danger ml-2" onClick={() => handleRemoveTerm(v.id, term.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="engine-step-content anim-fade-in">
      <h2>Base de Regras (Mamdani)</h2>
      <p className="engine-subtitle">Crie o cérebro do modelo vinculando as variáveis de entrada com as saídas usando operadores lógicos.</p>

      <button className="btn-engine-solid mb-4" onClick={handleAddRule}>
        <Plus size={18} /> Nova Regra Lógica
      </button>

      <div className="rules-list">
        {model.rules.length === 0 && <div className="empty-box">Nenhuma regra definida. A matriz de inferência está vazia.</div>}

        {model.rules.map((rule, idx) => (
          <div key={rule.id} className="rule-card">
            <div className="rule-badge">Regra {idx + 1}</div>

            <div className="rule-logic-row">
              <span className="logic-operator">SE</span>

              <div className="rule-conditions">
                {inputs.map((inp, i) => (
                  <div key={inp.id} className="condition-item">
                    <span className="var-label">{inp.name}</span>
                    <span className="logic-is">É</span>
                    <select className="term-select">
                      <option value="">Selecione...</option>
                      {inp.terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    {i < inputs.length - 1 && <span className="logic-and">E</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rule-logic-row mt-2">
              <span className="logic-operator then">ENTÃO</span>
              <div className="rule-conclusions">
                {outputs.map(out => (
                  <div key={out.id} className="condition-item">
                    <span className="var-label">{out.name}</span>
                    <span className="logic-is">SERÁ</span>
                    <select className="term-select">
                      <option value="">Selecione...</option>
                      {out.terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="rule-weight-row">
              <label>Peso da Regra (Confiança):</label>
              <input type="number" min="0" max="1" step="0.1" value={rule.weight} onChange={() => { }} />
            </div>

          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="engine-wrapper">
        <div className="engine-container">

          <div className="engine-top-bar">
            <button className="btn-back-engine" onClick={() => navigate('/lab')}>
              <ArrowLeft size={18} /> Voltar para Bancada
            </button>
            <button className="btn-save-engine">
              <Save size={18} /> Salvar Modelo
            </button>
          </div>

          <div className="engine-header-hero">
            <div className="engine-icon-wrapper"><Settings2 size={40} /></div>
            <div className="engine-hero-text">
              <h1>Engine P-Fuzzy</h1>
              <p>Construtor Dinâmico de Sistemas Especialistas e Lógica Nebulosa</p>
            </div>
          </div>

          <div className="engine-layout">

            {/* SIDEBAR WIZARD NAVIGATION */}
            <aside className="engine-sidebar">
              <ul className="wizard-steps">
                <li className={`wizard-step ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`} onClick={() => setActiveStep(1)}>
                  <div className="step-icon"><FileText size={18} /></div>
                  <span>1. Metadados</span>
                </li>
                <li className={`wizard-step ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`} onClick={() => setActiveStep(2)}>
                  <div className="step-icon"><SlidersHorizontal size={18} /></div>
                  <span>2. Variáveis</span>
                </li>
                <li className={`wizard-step ${activeStep === 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`} onClick={() => setActiveStep(3)}>
                  <div className="step-icon"><Activity size={18} /></div>
                  <span>3. Conjuntos (MFs)</span>
                </li>
                <li className={`wizard-step ${activeStep === 4 ? 'active' : ''} ${activeStep > 4 ? 'completed' : ''}`} onClick={() => setActiveStep(4)}>
                  <div className="step-icon"><GitMerge size={18} /></div>
                  <span>4. Base de Regras</span>
                </li>
              </ul>
            </aside>

            {/* MAIN CONTENT WIZARD */}
            <main className="engine-main-content">

              <div className="engine-step-container">
                {activeStep === 1 && renderStep1()}
                {activeStep === 2 && renderStep2()}
                {activeStep === 3 && renderStep3()}
                {activeStep === 4 && renderStep4()}
              </div>

              {/* FOOTER WIZARD CONTROLS */}
              <div className="wizard-controls">
                <button
                  className="btn-wizard prev"
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(prev => prev - 1)}
                >
                  <ChevronLeft size={18} /> Anterior
                </button>

                {activeStep < 4 ? (
                  <button
                    className="btn-wizard next"
                    onClick={() => setActiveStep(prev => prev + 1)}
                  >
                    Próximo Passo <ChevronRight size={18} />
                  </button>
                ) : (
                  <button className="btn-wizard finish">
                    <Save size={18} /> Finalizar Modelo
                  </button>
                )}
              </div>

            </main>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PFuzzyEngine;