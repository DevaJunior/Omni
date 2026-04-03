// ==============================================================================
// MOTOR MATEMÁTICO P-FUZZY (CORE)
// ==============================================================================

type Corners = [number, number, number, number];
type Rule = { in1: string; in2: string; in3: string; out: string; prob: number };

// 1. Função de Pertinência Trapezoidal
export const fuzzTrap = (x: number, corners: Corners): number => {
  const [a, b, c, d] = corners;
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
};

// 2. Mapas e Universos
export const u_padrao = Array.from({ length: 201 }, (_, i) => i * 0.5); // seq(0, 100, 0.5)

// --- MÓDULO A: AMBIENTE ---
const mapa_ph: Record<string, Corners> = { "Acido": [0,0,5.0,6.0], "Ideal": [5.5,6.0,7.0,7.5], "Alcalino": [7.0,8.0,14.0,14.0] };
const mapa_ce: Record<string, Corners> = { "Baixa": [0,0,500,800], "Ideal": [600,1000,2000,2500], "Salina": [2200,3000,5000,5000] };
const mapa_luz: Record<string, Corners> = { "Escassa": [0,0,150,300], "Moderada": [200,400,700,900], "Intensa": [800,1000,2000,2000] };
const mapa_out_amb: Record<string, Corners> = { "Ruim": [0,0,30,50], "Medio": [30,50,70,80], "Bom": [70,80,100,100] };

const regras_amb: Rule[] = [
  { in1: "Ideal", in2: "Ideal", in3: "Intensa", out: "Bom", prob: 1.0 },
  { in1: "Ideal", in2: "Salina", in3: "Intensa", out: "Medio", prob: 0.8 },
  { in1: "Acido", in2: "Ideal", in3: "Intensa", out: "Medio", prob: 0.9 },
  { in1: "Alcalino", in2: "Ideal", in3: "Moderada", out: "Ruim", prob: 1.0 },
  { in1: "Ideal", in2: "Baixa", in3: "Escassa", out: "Ruim", prob: 1.0 },
];

// --- MÓDULO B: PLANTA ---
const mapa_ft: Record<string, Corners> = { "Estabilizadora": [0,0,0.8,1.0], "Mista": [0.8,1.0,1.2,1.5], "Extratora": [1.3,2.0,5.0,5.0] };
const mapa_fen: Record<string, Corners> = { "Inicial": [0,0,20,35], "Vigoroso": [25,40,60,75], "Senescencia": [70,85,100,100] };
const mapa_raiz: Record<string, Corners> = { "Pobre": [0,0,2,4], "Media": [3,5,6,8], "Densa": [7,8,10,10] };
const mapa_out_bio: Record<string, Corners> = { "Baixo": [0,0,30,50], "Medio": [30,50,70,80], "Alto": [70,80,100,100] };

const regras_phys: Rule[] = [
  { in1: "Extratora", in2: "Vigoroso", in3: "Densa", out: "Alto", prob: 1.0 },
  { in1: "Extratora", in2: "Senescencia", in3: "Densa", out: "Medio", prob: 0.7 },
  { in1: "Estabilizadora", in2: "Vigoroso", in3: "Media", out: "Baixo", prob: 1.0 },
  { in1: "Mista", in2: "Vigoroso", in3: "Media", out: "Medio", prob: 0.9 },
  { in1: "Extratora", in2: "Inicial", in3: "Pobre", out: "Baixo", prob: 1.0 },
];

// --- MÓDULO C: OPERACIONAL ---
const mapa_conc: Record<string, Corners> = { "Baixa": [0,0,200,400], "Media": [200,400,600,800], "Alta": [600,800,1000,1000] };
const mapa_tempo: Record<string, Corners> = { "Curto": [0,0,15,30], "Medio": [15,30,45,60], "Longo": [45,60,90,90] };
const mapa_bmas: Record<string, Corners> = { "Pequena": [0,0,20,40], "Media": [20,40,60,80], "Grande": [60,80,100,100] };
const mapa_out_op: Record<string, Corners> = { "Ruim": [0,0,30,50], "Regular": [30,50,70,80], "Boa": [70,80,100,100] };

const regras_ops: Rule[] = [
  { in1: "Baixa", in2: "Curto", in3: "Pequena", out: "Ruim", prob: 1.0 },
  { in1: "Baixa", in2: "Longo", in3: "Grande", out: "Boa", prob: 1.0 },
  { in1: "Alta", in2: "Longo", in3: "Grande", out: "Boa", prob: 0.8 },
  { in1: "Alta", in2: "Longo", in3: "Grande", out: "Regular", prob: 0.3 }, // Conflito proposital modelado
  { in1: "Media", in2: "Medio", in3: "Media", out: "Regular", prob: 1.0 },
  { in1: "Alta", in2: "Curto", in3: "Pequena", out: "Ruim", prob: 1.0 },
];

// 3. Função de Inferência Mamdani
export type ModuleResult = { valor: number; curva: number[] };

const processarModulo = (
  inputs: [number, number, number],
  mapasIn: [Record<string, Corners>, Record<string, Corners>, Record<string, Corners>],
  mapaOut: Record<string, Corners>,
  regras: Rule[]
): ModuleResult => {
  const outAgregado = new Array(u_padrao.length).fill(0);

  for (const regra of regras) {
    const muA = fuzzTrap(inputs[0], mapasIn[0][regra.in1]);
    const muB = fuzzTrap(inputs[1], mapasIn[1][regra.in2]);
    const muC = fuzzTrap(inputs[2], mapasIn[2][regra.in3]);

    const disparo = Math.min(muA, muB, muC) * regra.prob;

    if (disparo > 0) {
      const ptsOut = mapaOut[regra.out];
      for (let i = 0; i < u_padrao.length; i++) {
        const valOut = fuzzTrap(u_padrao[i], ptsOut);
        outAgregado[i] = Math.max(outAgregado[i], Math.min(valOut, disparo));
      }
    }
  }

  let num = 0;
  let den = 0;
  for (let i = 0; i < u_padrao.length; i++) {
    num += u_padrao[i] * outAgregado[i];
    den += outAgregado[i];
  }

  return {
    valor: den === 0 ? 0 : num / den,
    curva: outAgregado
  };
};

// 4. Execução Completa
export type PFuzzyRizofiltracaoParams = {
  ph: number; ce: number; luz: number;
  ft: number; fen: number; raiz: number;
  conc: number; tempo: number; bio: number;
};

export type PFuzzyRizofiltracaoResult = {
  amb: ModuleResult;
  phys: ModuleResult;
  ops: ModuleResult;
  vigor: number;
  final: number;
};

export const calcularSistemaCompleto = (params: PFuzzyRizofiltracaoParams): PFuzzyRizofiltracaoResult => {
  const r_amb = processarModulo([params.ph, params.ce, params.luz], [mapa_ph, mapa_ce, mapa_luz], mapa_out_amb, regras_amb);
  const r_phys = processarModulo([params.ft, params.fen, params.raiz], [mapa_ft, mapa_fen, mapa_raiz], mapa_out_bio, regras_phys);
  const r_ops = processarModulo([params.conc, params.tempo, params.bio], [mapa_conc, mapa_tempo, mapa_bmas], mapa_out_op, regras_ops);

  const vigor = (r_amb.valor + r_phys.valor) / 2;
  const final = r_ops.valor * (vigor / 100);

  return { amb: r_amb, phys: r_phys, ops: r_ops, vigor, final };
};