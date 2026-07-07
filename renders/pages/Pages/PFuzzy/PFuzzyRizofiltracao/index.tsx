import { useToastStore } from '../../../../../src/stores/toastStore';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings2, ArrowLeft, Calculator,
  Lightbulb, FileText, Download, AlertTriangle, X, LayoutGrid,
  TrendingUp, ChevronRight, Target, Leaf, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import {
  calcularSistemaCompleto,
  regras_amb, regras_phys, regras_ops,
  type PFuzzyRizofiltracaoParams,
  type PFuzzyRizofiltracaoResult,
  type Rule
} from './engine';
import './styles.css';
import Footer from '../../../../menus/Footer';

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTES SVG
// ═══════════════════════════════════════════════════════════

// Gráfico de curva Gaussiana Fuzzy (compacto)
const RangeSlider = ({ value, min, max, step, onChange }: { value: number, min: number, max: number, step: number, onChange: (val: string) => void }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pf-slider-range"
      style={{
        background: `linear-gradient(to right, #1e293b 0%, #1e293b ${percentage}%, #f1f5f9 ${percentage}%, #f1f5f9 100%)`
      }}
    />
  );
};
const FuzzyPlot = ({ curva, valor, color }: { curva: number[]; valor: number; color: string }) => {
  // Downsample to ~40 points for smooth rendering
  const sampleCount = 40;
  const step = Math.max(1, Math.floor(curva.length / sampleCount));
  const sampled: { x: number; y: number }[] = [];
  for (let i = 0; i < curva.length; i += step) {
    sampled.push({
      x: (i / (curva.length - 1)) * 200,
      y: 80 - curva[i] * 70,
    });
  }
  // Always include last point
  if (sampled[sampled.length - 1].x !== 200) {
    sampled.push({ x: 200, y: 80 - curva[curva.length - 1] * 70 });
  }

  // Build smooth cubic Bézier path (Catmull-Rom to Bézier)
  let d = `M${sampled[0].x},${sampled[0].y}`;
  for (let i = 0; i < sampled.length - 1; i++) {
    const p0 = sampled[Math.max(0, i - 1)];
    const p1 = sampled[i];
    const p2 = sampled[i + 1];
    const p3 = sampled[Math.min(sampled.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const areaD = d + ` L200,80 L0,80 Z`;

  return (
    <div className="fuzzy-plot-container">
      <svg viewBox="0 0 200 90" preserveAspectRatio="xMidYMid meet" className="fuzzy-svg">
        <line x1="0" y1="80" x2="200" y2="80" stroke="#e2e8f0" strokeWidth="1" />
        <path d={areaD} fill={color} fillOpacity="0.2" />
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {valor > 0 && (
          <line x1={(valor / 100) * 200} y1="0" x2={(valor / 100) * 200} y2="80" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
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

// Donut Chart (Performance Atual)
const DonutChart = ({ value, color }: { value: number; color: string }) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <svg className="pf-donut-svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 80 80)"
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
      <text x="80" y="75" textAnchor="middle" fontSize="22px" fontWeight="900" fill="#0f172a">
        {clampedValue.toFixed(1)}%
      </text>
      <text x="80" y="95" textAnchor="middle" fontSize="10px" fontWeight="700" fill="#94a3b8">
        EFICIÊNCIA GLOBAL
      </text>
    </svg>
  );
};

// Radar Chart (Equilíbrio do Sistema)
const RadarChart = ({ amb, phys, ops }: { amb: number; phys: number; ops: number }) => {
  const cx = 90, cy = 85;
  const maxR = 60;

  const angleTop = -Math.PI / 2;
  const angleBL = -Math.PI / 2 + (2 * Math.PI) / 3;
  const angleBR = -Math.PI / 2 + (4 * Math.PI) / 3;

  const toPoint = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  // Background rings
  const rings = [0.33, 0.66, 1.0];
  const bgLines = rings.map((frac) => {
    const r = maxR * frac;
    const p1 = toPoint(angleTop, r);
    const p2 = toPoint(angleBL, r);
    const p3 = toPoint(angleBR, r);
    return `M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} Z`;
  });

  // Data points
  const rAmb = (amb / 100) * maxR;
  const rPhys = (phys / 100) * maxR;
  const rOps = (ops / 100) * maxR;

  const pAmb = toPoint(angleTop, rAmb);
  const pOps = toPoint(angleBL, rOps);
  const pPhys = toPoint(angleBR, rPhys);

  const dataPath = `M${pAmb.x},${pAmb.y} L${pOps.x},${pOps.y} L${pPhys.x},${pPhys.y} Z`;

  // Label positions (outside)
  const labAmb = toPoint(angleTop, maxR + 16);
  const labOps = toPoint(angleBL, maxR + 18);
  const labPhys = toPoint(angleBR, maxR + 18);

  return (
    <div className="pf-radar-wrap">
      <svg className="pf-radar-svg" viewBox="0 0 180 170">
        {/* Axis lines */}
        <line x1={cx} y1={cy} x2={toPoint(angleTop, maxR).x} y2={toPoint(angleTop, maxR).y} stroke="#e2e8f0" strokeWidth="0.8" />
        <line x1={cx} y1={cy} x2={toPoint(angleBL, maxR).x} y2={toPoint(angleBL, maxR).y} stroke="#e2e8f0" strokeWidth="0.8" />
        <line x1={cx} y1={cy} x2={toPoint(angleBR, maxR).x} y2={toPoint(angleBR, maxR).y} stroke="#e2e8f0" strokeWidth="0.8" />

        {/* Background rings */}
        {bgLines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
        ))}

        {/* Data area */}
        <path d={dataPath} fill="#818cf8" fillOpacity="0.25" stroke="#6366f1" strokeWidth="1.5" />

        {/* Data dots */}
        <circle cx={pAmb.x} cy={pAmb.y} r="3" fill="#6366f1" />
        <circle cx={pOps.x} cy={pOps.y} r="3" fill="#6366f1" />
        <circle cx={pPhys.x} cy={pPhys.y} r="3" fill="#6366f1" />

        {/* Labels */}
        <text x={labAmb.x} y={labAmb.y} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#0891b2">
          Ambiental ({amb.toFixed(0)}%)
        </text>
        <text x={labOps.x} y={labOps.y} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#d97706">
          Op. ({ops.toFixed(0)}%)
        </text>
        <text x={labPhys.x} y={labPhys.y} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#16a34a">
          Biológico ({phys.toFixed(0)}%)
        </text>
      </svg>
    </div>
  );
};

// Optimization Projection Chart
const OptimizationChart = ({
  params,
  currentTempo,
}: {
  params: PFuzzyRizofiltracaoParams;
  currentTempo: number;
}) => {
  // Simulate varying tempo from 5 to 90 days with more points
  const steps = 40;
  const points: { tempo: number; eff: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = 5 + (85 * i) / steps;
    const simParams = { ...params, tempo: t };
    const r = calcularSistemaCompleto(simParams);
    points.push({ tempo: t, eff: r.final });
  }

  // Find optimal and current
  const optimal = points.reduce((best, p) => (p.eff > best.eff ? p : best), points[0]);
  const currentEff = points.reduce((closest, p) =>
    Math.abs(p.tempo - currentTempo) < Math.abs(closest.tempo - currentTempo) ? p : closest, points[0]).eff;

  // SVG dimensions - wide rectangle, taller height
  const padL = 40, padR = 25, padT = 40, padB = 30;
  const svgW = 400, svgH = 260;
  const w = svgW - padL - padR;
  const h = svgH - padT - padB;

  // Dynamic Y Scale (Zoom into the relevant range)
  const minEff = Math.min(...points.map((p) => p.eff));
  const maxEff = Math.max(...points.map((p) => p.eff));
  
  // Add padding above and below the curve
  const yMin = Math.max(0, Math.floor(minEff) - (maxEff - minEff) * 0.1 - 1);
  const yMax = Math.min(100, Math.ceil(maxEff) + (maxEff - minEff) * 0.2 + 1);
  const yRange = Math.max(1, yMax - yMin);

  const toSvg = (tempo: number, eff: number) => ({
    x: padL + ((tempo - 5) / 85) * w,
    y: padT + h - ((eff - yMin) / yRange) * h,
  });

  // Build smooth Catmull-Rom spline
  const svgPts = points.map(p => toSvg(p.tempo, p.eff));
  let linePath = `M${svgPts[0].x},${svgPts[0].y}`;
  for (let i = 0; i < svgPts.length - 1; i++) {
    const p0 = svgPts[Math.max(0, i - 1)];
    const p1 = svgPts[i];
    const p2 = svgPts[i + 1];
    const p3 = svgPts[Math.min(svgPts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    linePath += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const areaPath = linePath + ` L${padL + w},${padT + h} L${padL},${padT + h} Z`;

  const currentSvg = toSvg(currentTempo, currentEff);
  const optSvg = toSvg(optimal.tempo, optimal.eff);

  // Y-axis ticks
  const yTicks = [
    yMin,
    yMin + yRange * 0.25,
    yMin + yRange * 0.5,
    yMin + yRange * 0.75,
    yMax
  ];
  // X-axis ticks
  const xTicks = [10, 20, 30, 45, 60, 75, 90];

  // Smart label positioning: check if current is basically the optimal
  const isSame = Math.abs(currentTempo - optimal.tempo) < 3;
  
  const labelsOverlap = Math.abs(currentSvg.x - optSvg.x) < 70;
  const optLabelY = optSvg.y - 12;
  const curLabelY = labelsOverlap ? currentSvg.y + 20 : currentSvg.y - 12;

  // Render a nice badge background for texts
  const renderLabel = (x: number, y: number, text: string, color: string, bgColor: string) => (
    <g>
      <rect x={x - text.length * 3.2} y={y - 9} width={text.length * 6.4} height={14} rx="4" fill={bgColor} opacity="0.9" />
      <text x={x} y={y} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {text}
      </text>
    </g>
  );

  return (
    <svg className="pf-optim-svg" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines + labels */}
      {yTicks.map(tick => {
        const y = padT + h - ((tick - yMin) / yRange) * h;
        return (
          <g key={`y-${tick}`}>
            <line x1={padL} y1={y} x2={padL + w} y2={y} stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray={tick === yMin ? "0" : "3"} />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fontWeight="600" fill="#94a3b8">{tick.toFixed(1)}%</text>
          </g>
        );
      })}

      {/* X-axis ticks + labels */}
      {xTicks.map(tick => {
        const x = padL + ((tick - 5) / 85) * w;
        return (
          <g key={`x-${tick}`}>
            <line x1={x} y1={padT + h} x2={x} y2={padT + h + 4} stroke="#cbd5e1" strokeWidth="0.8" />
            <text x={x} y={padT + h + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="#94a3b8">{tick}d</text>
          </g>
        );
      })}

      {/* Gradient area */}
      <path d={areaPath} fill="url(#optGrad)" />

      {/* Smooth line */}
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

      {/* Logic for Markers */}
      {isSame ? (
        // Combined Marker
        <>
          <line x1={optSvg.x} y1={optSvg.y} x2={optSvg.x} y2={padT + h} stroke="#10b981" strokeWidth="1" strokeDasharray="4" opacity="0.6" />
          <circle cx={optSvg.x} cy={optSvg.y} r="6" fill="#10b981" stroke="white" strokeWidth="2.5" />
          {renderLabel(optSvg.x, optSvg.y - 14, `Atual = Ótimo (${optimal.tempo.toFixed(0)}d — ${optimal.eff.toFixed(1)}%)`, "#047857", "#d1fae5")}
        </>
      ) : (
        // Separate Markers
        <>
          {/* Current */}
          <line x1={currentSvg.x} y1={currentSvg.y} x2={currentSvg.x} y2={padT + h} stroke="#64748b" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
          <circle cx={currentSvg.x} cy={currentSvg.y} r="5" fill="white" stroke="#6366f1" strokeWidth="2.5" />
          {renderLabel(currentSvg.x, curLabelY, `Atual (${currentTempo}d — ${currentEff.toFixed(1)}%)`, "#4338ca", "#e0e7ff")}

          {/* Optimal */}
          <line x1={optSvg.x} y1={optSvg.y} x2={optSvg.x} y2={padT + h} stroke="#10b981" strokeWidth="1" strokeDasharray="4" opacity="0.6" />
          <circle cx={optSvg.x} cy={optSvg.y} r="6" fill="#10b981" stroke="white" strokeWidth="2.5" />
          {renderLabel(optSvg.x, optLabelY, `Ótimo (${optimal.tempo.toFixed(0)}d — ${optimal.eff.toFixed(1)}%)`, "#047857", "#d1fae5")}
        </>
      )}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════
// MODAL: MATRIZ DE INFERÊNCIA
// ═══════════════════════════════════════════════════════════

type ModalTab = 'global' | 'amb' | 'phys' | 'ops';

const getBadgeClass = (level: string): string => {
  const lowerLevel = level.toLowerCase();
  if (['b', 'baixo', 'baixa', 'i', 'pobre', 'pequena', 'curto', 'escassa', 'estabilizadora', 'inicial', 'r'].includes(lowerLevel)) return 'low';
  if (['m', 'medio', 'média', 'médio', 'moderada', 'mista', 'vigoroso', 'rg', 'regular'].includes(lowerLevel)) return 'mid';
  if (['a', 'alto', 'alta', 'bom', 'densa', 'grande', 'longo', 'intensa', 'extratora', 'senescência'].includes(lowerLevel)) return 'high';
  return 'mid';
};

const getBadgeLabel = (code: string): string => {
  const map: Record<string, string> = {
    'I': 'Baixo', 'R': 'Baixo', 'M': 'Médio', 'B': 'Alto', 'A': 'Alto',
    'RG': 'Médio',
  };
  return map[code] || code;
};

const getResultLabel = (code: string): string => {
  const map: Record<string, string> = {
    'I': 'Inviável (0-20%)', 'R': 'Comprometido (Atual)', 'M': 'Moderada (40-60%)',
    'B': 'Excelente (80-100%)', 'A': 'Excelente (80-100%)', 'RG': 'Regular (40-60%)',
  };
  return map[code] || code;
};

const RulesModal = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<ModalTab>('global');

  // Representative global rules (combining all 3 modules)
  const globalRules = [
    { amb: 'Baixo', phys: 'Baixo', ops: 'Baixo', result: 'Inviável (0-20%)' },
    { amb: 'Alto', phys: 'Baixo', ops: 'Médio', result: 'Comprometido (Atual)', isCurrent: true },
    { amb: 'Alto', phys: 'Alto', ops: 'Alto', result: 'Excelente (80-100%)' },
    { amb: 'Médio', phys: 'Alto', ops: 'Médio', result: 'Moderada (40-60%)' },
  ];

  const renderRuleRow = (rule: Rule, index: number) => (
    <tr key={index}>
      <td><span className={`pf-rule-badge ${getBadgeClass(rule.in1)}`}>{rule.in1}</span></td>
      <td><span className={`pf-rule-badge ${getBadgeClass(rule.in2)}`}>{rule.in2}</span></td>
      <td><span className={`pf-rule-badge ${getBadgeClass(rule.in3)}`}>{rule.in3}</span></td>
      <td className="pf-rule-result">
        <span className={`pf-rule-badge ${getBadgeClass(getBadgeLabel(rule.out))}`}>
          {getResultLabel(rule.out)}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="pf-modal-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pf-modal-header">
          <div className="pf-modal-icon">
            <LayoutGrid size={24} />
          </div>
          <div className="pf-modal-header-text">
            <h2>Matriz de Inferência P-Fuzzy</h2>
            <p>Base de regras especialista do sistema.</p>
          </div>
        </div>
        <button className="pf-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="pf-modal-tabs">
          <button className={`pf-modal-tab ${tab === 'global' ? 'active' : ''}`} onClick={() => setTab('global')}>
            Módulo Global (3D)
          </button>
          <button className={`pf-modal-tab ${tab === 'amb' ? 'active' : ''}`} onClick={() => setTab('amb')}>
            Base Ambiental
          </button>
          <button className={`pf-modal-tab ${tab === 'phys' ? 'active' : ''}`} onClick={() => setTab('phys')}>
            Base Fisiológica
          </button>
          <button className={`pf-modal-tab ${tab === 'ops' ? 'active' : ''}`} onClick={() => setTab('ops')}>
            Base Operacional
          </button>
        </div>

        {tab === 'global' && (
          <>
            <table className="pf-rules-table">
              <thead>
                <tr>
                  <th>Adequação Amb.</th>
                  <th>Potencial Biol.</th>
                  <th>Performance Op.</th>
                  <th>Eficiência Resultante</th>
                </tr>
              </thead>
              <tbody>
                {globalRules.map((r, i) => (
                  <tr key={i}>
                    <td><span className={`pf-rule-badge ${getBadgeClass(r.amb)}`}>{r.amb}</span></td>
                    <td><span className={`pf-rule-badge ${getBadgeClass(r.phys)}`}>{r.phys}</span></td>
                    <td><span className={`pf-rule-badge ${getBadgeClass(r.ops)}`}>{r.ops}</span></td>
                    <td className={`pf-rule-result ${r.isCurrent ? 'current' : ''}`}>{r.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pf-modal-footer">
              A tabela acima exibe um subconjunto representativo das 27 regras de inferência do módulo Global.
            </p>
          </>
        )}

        {tab === 'amb' && (
          <>
            <table className="pf-rules-table">
              <thead>
                <tr>
                  <th>pH</th>
                  <th>Condutividade</th>
                  <th>Luminosidade</th>
                  <th>Adequação Resultante</th>
                </tr>
              </thead>
              <tbody>
                {regras_amb.map((r, i) => renderRuleRow(r, i))}
              </tbody>
            </table>
            <p className="pf-modal-footer">
              Exibindo todas as {regras_amb.length} regras ambientais. Função de pertinência gaussiana.
            </p>
          </>
        )}

        {tab === 'phys' && (
          <>
            <table className="pf-rules-table">
              <thead>
                <tr>
                  <th>Fator de Translocação</th>
                  <th>Fenologia</th>
                  <th>Raiz</th>
                  <th>Potencial Biológico</th>
                </tr>
              </thead>
              <tbody>
                {regras_phys.map((r, i) => renderRuleRow(r, i))}
              </tbody>
            </table>
            <p className="pf-modal-footer">
              Exibindo todas as {regras_phys.length} regras fisiológicas. Função de pertinência gaussiana.
            </p>
          </>
        )}

        {tab === 'ops' && (
          <>
            <table className="pf-rules-table">
              <thead>
                <tr>
                  <th>Concentração</th>
                  <th>Tempo Retenção</th>
                  <th>Biomassa Inicial</th>
                  <th>Performance Resultante</th>
                </tr>
              </thead>
              <tbody>
                {regras_ops.map((r, i) => renderRuleRow(r, i))}
              </tbody>
            </table>
            <p className="pf-modal-footer">
              Exibindo todas as {regras_ops.length} regras operacionais. Função de pertinência gaussiana.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

const PFuzzyRizofiltracao: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [params, setParams] = useState<PFuzzyRizofiltracaoParams>({
    ph: 6.5, ce: 1200, luz: 900,
    ft: 2.5, fen: 60, raiz: 8.0,
    conc: 120, tempo: 45, bio: 60,
  });

  const [result, setResult] = useState<PFuzzyRizofiltracaoResult | null>({
    amb: { valor: 0, curva: new Array(201).fill(0) },
    phys: { valor: 0, curva: new Array(201).fill(0) },
    ops: { valor: 0, curva: new Array(201).fill(0) },
    vigor: 0,
    final: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCalculate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = calcularSistemaCompleto(params);
      setResult(res);
      setHasRun(true);
      setIsProcessing(false);
    }, 800); // Delay artificial de 800ms para UX
  };

  useEffect(() => {
    if (!hasRun) {
      handleCalculate();
    }
  }, []);

  const updateParam = (key: keyof PFuzzyRizofiltracaoParams, val: string) => {
    setParams((prev) => ({ ...prev, [key]: parseFloat(val) }));
  };

  // Diagnóstico: encontrar fator limitante
  const diagnostic = useMemo(() => {
    if (!result) return null;

    const modules = [
      { name: 'Vigor Ambiental', value: result.amb.valor },
      { name: 'Vigor Biológico', value: result.phys.valor },
      { name: 'Performance Op.', value: result.ops.valor },
    ];

    const weakest = modules.reduce((min, m) => (m.value < min.value ? m : min), modules[0]);
    const strongest = modules.reduce((max, m) => (m.value > max.value ? m : max), modules[0]);
    const diff = weakest.value - strongest.value;

    let action = '';
    if (weakest.name === 'Vigor Biológico') {
      action = 'Substituir espécimes botânicos ou revisar tempo de aclimatação.';
    } else if (weakest.name === 'Vigor Ambiental') {
      action = 'Ajustar pH e condutividade elétrica do efluente de entrada.';
    } else {
      action = 'Aumentar biomassa ou estender o tempo de retenção hidráulica.';
    }

    const severity = weakest.value < 30 ? 'critical' : weakest.value < 60 ? '' : 'good';

    return { weakest, diff, action, severity, label: result.final >= 70 ? 'Sistema Otimizado' : 'Diagnóstico Crítico' };
  }, [result]);

  // Gerador de insight
  const generateInsight = (res: PFuzzyRizofiltracaoResult): string => {
    let insight = '';

    if (res.amb.valor >= 75) {
      insight += `O ambiente apresenta excelentes condições físico-químicas (${res.amb.valor.toFixed(1)}%) de cultivo. `;
    } else if (res.amb.valor >= 45) {
      insight += `O ambiente apresenta níveis medianos de adequação (${res.amb.valor.toFixed(1)}%); ajustes de pH podem ser necessários. `;
    } else {
      insight += `CUIDADO: O ambiente físico-químico encontra-se severamente hostil (${res.amb.valor.toFixed(1)}%). `;
    }

    if (res.phys.valor >= 75) {
      insight += `O potencial biológico é altíssimo (${res.phys.valor.toFixed(1)}%), com arquitetura radicular densa. `;
    } else if (res.phys.valor >= 45) {
      insight += `A planta encontra-se numa zona tolerável (${res.phys.valor.toFixed(1)}%), podendo limitar a extração. `;
    } else {
      insight += `A planta apresenta baixo vigor ou encontra-se em senescência avançada, anulando o potencial biológico (${res.phys.valor.toFixed(1)}%). `;
    }

    insight += '\n\n';

    if (res.ops.valor >= 75) {
      insight += `A performance de engenharia é regular (${res.ops.valor.toFixed(1)}%). `;
    } else if (res.ops.valor >= 45) {
      insight += `A performance de engenharia é regular (${res.ops.valor.toFixed(1)}%). Sugerimos reajustar o tempo de retenção em biorreator para maximizar a extração, contanto que o material biológico seja restaurado.`;
    } else {
      insight += `Carga tóxica crítica (${res.ops.valor.toFixed(1)}%): O rácio poluente/biomassa é demasiadamente elevado.`;
    }

    return insight;
  };

  // PDF export
  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório P-Fuzzy Omni - Fitorremediação (Pb)', 20, 20);
    doc.setFontSize(12);
    doc.text('1. Módulo Ambiente (Físico-Química)', 20, 40);
    doc.text(`pH: ${params.ph.toFixed(1)} | CE: ${params.ce} µS/cm | Luz: ${params.luz} PPFD`, 30, 50);
    doc.text('2. Módulo Planta (Potencial Fisiológico)', 20, 65);
    doc.text(`FT: ${params.ft.toFixed(1)} | Fenologia: ${params.fen}% | Raiz: ${params.raiz.toFixed(1)}`, 30, 75);
    doc.text('3. Módulo Operacional (Performance de Carga)', 20, 90);
    doc.text(`Conc (Pb): ${params.conc} mg/L | Tempo: ${params.tempo} dias | Biomassa: ${params.bio} g`, 30, 100);
    doc.setFontSize(14);
    doc.text(`Vigor Biológico do Sistema: ${result.vigor.toFixed(1)}%`, 20, 120);
    doc.text(`Eficiência Global P-Fuzzy: ${result.final.toFixed(2)}%`, 20, 130);
    doc.save('relatorio-pfuzzy-pb.pdf');
    addToast('Relatório PDF exportado com sucesso', 'success');
  };

  // CSV export
  const exportCSV = () => {
    if (!result) return;
    const data = [{
      pH: params.ph, CE: params.ce, Luz: params.luz,
      FT: params.ft, Fenologia: params.fen, Raiz: params.raiz,
      Concentracao_Pb: params.conc, Tempo: params.tempo, Biomassa: params.bio,
      Vigor: result.vigor.toFixed(2), EficienciaGlobal: result.final.toFixed(2),
    }];
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio-pfuzzy-pb.csv';
    link.click();
    addToast('Dados CSV exportados com sucesso', 'success');
  };

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <>
      <div className="pfuzzy-wrapper">
        <div className="pfuzzy-container">

          {/* ═══ TOP BAR ═══ */}
          <div className="pf-topbar">
            <div className="pf-topbar-left">
              <button className="btn-back" onClick={() => navigate('/lab')}>
                <ArrowLeft size={18} />
              </button>
              <h1>
                <Settings2 size={22} /> Motor Hierárquico P-Fuzzy
              </h1>
            </div>
            <div className="pf-topbar-right">
              <div style={{ position: 'relative' }}>
                <button className="pf-btn-export" onClick={() => setShowExportMenu(!showExportMenu)}>
                  <Download size={16} /> Exportar Relatório
                </button>
                {showExportMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 6,
                    background: 'white', border: '1px solid #e2e8f0', borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', minWidth: 160,
                  }}>
                    <button
                      onClick={() => { exportPDF(); setShowExportMenu(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}
                    >
                      <FileText size={15} /> Exportar PDF
                    </button>
                    <button
                      onClick={() => { exportCSV(); setShowExportMenu(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#334155', borderTop: '1px solid #f1f5f9' }}
                    >
                      <Download size={15} /> Exportar CSV
                    </button>
                  </div>
                )}
              </div>
              <button className="pf-btn-process" onClick={handleCalculate} disabled={isProcessing}>
                {isProcessing ? (
                  <span className="pf-btn-spinner"></span>
                ) : (
                  <Calculator size={16} />
                )}
                {isProcessing ? 'Processando...' : 'Processar Dados'}
              </button>
            </div>
          </div>

          {/* ═══ DASHBOARD GRID ═══ */}
          <div className="pf-dashboard">

            {/* ═══ SIDEBAR: Painel de Parâmetros ═══ */}
            <div className="pf-sidebar">
              <div className="pf-sidebar-title">
                <Settings2 size={18} color="#6366f1" /> Painel de Parâmetros
              </div>

              {/* AMBIENTAIS */}
              <div className="pf-param-section">
                <div className="pf-param-section-title"><TrendingUp size={14} /> AMBIENTAIS</div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>pH da Água</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.ph} step="0.1" onChange={(e) => updateParam('ph', e.target.value)} />
                    </div>
                  </div>
                  <RangeSlider min={0} max={14} step={0.1} value={params.ph} onChange={(val) => updateParam('ph', val)} />
                </div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>Condutividade</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.ce} step="10" onChange={(e) => updateParam('ce', e.target.value)} />
                      <span className="pf-slider-unit">µS</span>
                    </div>
                  </div>
                  <RangeSlider min={0} max={5000} step={10} value={params.ce} onChange={(val) => updateParam('ce', val)} />
                </div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>Luminosidade</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.luz} step="10" onChange={(e) => updateParam('luz', e.target.value)} />
                      <span className="pf-slider-unit">lx</span>
                    </div>
                  </div>
                  <RangeSlider min={0} max={2000} step={10} value={params.luz} onChange={(val) => updateParam('luz', val)} />
                </div>
              </div>

              {/* FISIOLÓGICOS */}
              <div className="pf-param-section">
                <div className="pf-param-section-title"><Leaf size={14} /> FISIOLÓGICOS</div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>FT</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.ft} step="0.1" onChange={(e) => updateParam('ft', e.target.value)} />
                    </div>
                  </div>
                  <RangeSlider min={0} max={5} step={0.1} value={params.ft} onChange={(val) => updateParam('ft', val)} />
                </div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>Estágio Fenológico</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.fen} step="1" onChange={(e) => updateParam('fen', e.target.value)} />
                      <span className="pf-slider-unit">%</span>
                    </div>
                  </div>
                  <RangeSlider min={0} max={100} step={1} value={params.fen} onChange={(val) => updateParam('fen', val)} />
                </div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>Den. Radicular</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.raiz} step="0.1" onChange={(e) => updateParam('raiz', e.target.value)} />
                    </div>
                  </div>
                  <RangeSlider min={0} max={10} step={0.1} value={params.raiz} onChange={(val) => updateParam('raiz', val)} />
                </div>
              </div>

              {/* OPERACIONAIS */}
              <div className="pf-param-section">
                <div className="pf-param-section-title"><Settings size={14} /> OPERACIONAIS</div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>Concentração</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.conc} step="1" onChange={(e) => updateParam('conc', e.target.value)} />
                      <span className="pf-slider-unit">mg/L</span>
                    </div>
                  </div>
                  <RangeSlider min={0} max={1000} step={1} value={params.conc} onChange={(val) => updateParam('conc', val)} />
                </div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>Tempo Retenção</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.tempo} step="1" onChange={(e) => updateParam('tempo', e.target.value)} />
                      <span className="pf-slider-unit">d</span>
                    </div>
                  </div>
                  <RangeSlider min={0} max={90} step={1} value={params.tempo} onChange={(val) => updateParam('tempo', val)} />
                </div>
                <div className="pf-slider-group">
                  <div className="pf-slider-label">
                    <span>Biomassa Inicial</span>
                    <div className="pf-slider-input-wrapper">
                      <input type="number" className="pf-slider-input" value={params.bio} step="1" onChange={(e) => updateParam('bio', e.target.value)} />
                      <span className="pf-slider-unit">g</span>
                    </div>
                  </div>
                  <RangeSlider min={0} max={100} step={1} value={params.bio} onChange={(val) => updateParam('bio', val)} />
                </div>
              </div>
            </div>

            {/* ═══ CONTENT AREA ═══ */}
            {result && (
              <div style={{ position: 'relative', width: '100%' }}>
                {isProcessing && (
                  <div className="pf-processing-overlay">
                    <div className="pf-spinner"></div>
                    <h3>Processando Matriz P-Fuzzy</h3>
                    <p>Calculando otimização para 81 cenários...</p>
                  </div>
                )}
                <div className={`pf-content ${isProcessing ? 'blur' : ''}`}>

                {/* ROW 1: Performance + Equilíbrio + Diagnóstico */}
                <div className="pf-row-top">
                  {/* Performance Atual */}
                  <div className="pf-card">
                    <div className="pf-card-title">Performance Atual</div>
                    <div className="pf-card-subtitle">Métrica agregada P-Fuzzy</div>
                    <div className="pf-donut-wrap">
                      <DonutChart
                        value={result.final}
                        color={result.final >= 70 ? '#10b981' : result.final >= 40 ? '#f59e0b' : '#ef4444'}
                      />
                    </div>
                  </div>

                  {/* Equilíbrio do Sistema */}
                  <div className="pf-card">
                    <div className="pf-card-title">Equilíbrio do Sistema</div>
                    <div className="pf-card-subtitle">Intersecção de módulos</div>
                    <RadarChart
                      amb={result.amb.valor}
                      phys={result.phys.valor}
                      ops={result.ops.valor}
                    />
                  </div>

                  {/* Diagnóstico Crítico */}
                  {diagnostic && hasRun && (
                    <div className={`pf-diagnostic-card ${diagnostic.severity}`}>
                      <div className="pf-diagnostic-watermark">
                        <Target size={90} />
                      </div>
                      <div>
                        <div className="pf-diagnostic-header">
                          <AlertTriangle size={18} /> {diagnostic.label}
                        </div>
                        <div className="pf-diagnostic-factor-label">FATOR LIMITANTE</div>
                        <div className="pf-diagnostic-factor-name">
                          {diagnostic.weakest.name}{' '}
                          <span>({diagnostic.diff.toFixed(1)}%)</span>
                        </div>
                        <div className="pf-diagnostic-action-label">AÇÃO SUGERIDA</div>
                        <div className="pf-diagnostic-action-text">{diagnostic.action}</div>
                      </div>
                      <button className="pf-diagnostic-link" onClick={() => setShowModal(true)}>
                        Ver matriz de regras <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* ROW 2: Módulos Fuzzy */}
                <div className="pf-row-modules">
                  <div className="pf-module-card">
                    <div className="pf-module-header">
                      <span className="pf-module-title">Mod A: Adequação Amb.</span>
                      <span className="pf-module-badge amb">{result.amb.valor.toFixed(1)}%</span>
                    </div>
                    <FuzzyPlot curva={result.amb.curva} valor={result.amb.valor} color="#06b6d4" />
                  </div>
                  <div className="pf-module-card">
                    <div className="pf-module-header">
                      <span className="pf-module-title">Mod B: Potencial Biol.</span>
                      <span className="pf-module-badge phys">{result.phys.valor.toFixed(1)}%</span>
                    </div>
                    <FuzzyPlot curva={result.phys.curva} valor={result.phys.valor} color="#22c55e" />
                  </div>
                  <div className="pf-module-card">
                    <div className="pf-module-header">
                      <span className="pf-module-title">Mod C: Performance Op.</span>
                      <span className="pf-module-badge ops">{result.ops.valor.toFixed(1)}%</span>
                    </div>
                    <FuzzyPlot curva={result.ops.curva} valor={result.ops.valor} color="#f59e0b" />
                  </div>
                </div>

                {/* ROW 3: Projeção + Interpretação */}
                <div className="pf-row-bottom">
                  {/* Projeção de Otimização */}
                  <div className="pf-optim-card">
                    <div className="pf-optim-header">
                      <TrendingUp size={18} color="#10b981" />
                      <h3>Projeção de Otimização</h3>
                      <span className="pf-optim-tab">Tempo de Retenção</span>
                    </div>
                    <p className="pf-optim-desc">
                      Simulação da eficiência baseada na curva de saturação do sistema.
                    </p>
                    <OptimizationChart params={params} currentTempo={params.tempo} />
                  </div>

                  {/* Interpretação Especialista */}
                  <div className="pf-insight-card">
                    <div className="pf-insight-header">
                      <Lightbulb size={20} />
                      <h3>Interpretação do Sistema Especialista</h3>
                    </div>
                    <p className="pf-insight-text">
                      {hasRun ? generateInsight(result) : 'Aguardando processamento dos dados. Clique em "Processar Dados" para visualizar as interpretações e recomendações do sistema.'}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />

      {/* Modal de Regras */}
      {showModal && <RulesModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default PFuzzyRizofiltracao;
