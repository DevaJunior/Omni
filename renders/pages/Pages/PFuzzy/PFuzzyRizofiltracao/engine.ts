// ==============================================================================
// MOTOR MATEMÁTICO P-FUZZY (CORE) - VERSÃO 007.1 (GAUSSIANA + 81 REGRAS)
// ==============================================================================

export type GaussParams = [number, number]; // [Centro, Sigma]
export type Rule = { in1: string; in2: string; in3: string; out: string; prob: number };

// 1. Função de Pertinência Gaussiana
export const fuzzGauss = (x: number, params: GaussParams): number => {
  const [c, sigma] = params;
  return Math.exp(-Math.pow(x - c, 2) / (2 * Math.pow(sigma, 2)));
};

// 2. Mapas e Universos
export const u_padrao = Array.from({ length: 201 }, (_, i) => i * 0.5); // seq(0, 100, 0.5)

// --- MÓDULO A: AMBIENTE ---
const mapa_ph: Record<string, GaussParams> = { "Ácido": [3.0, 1.5], "Ideal": [6.5, 0.8], "Alcalino": [11.0, 2.0] };
const mapa_ce: Record<string, GaussParams> = { "Baixa": [250, 150], "Ideal": [1500, 500], "Salina": [4000, 800] };
const mapa_luz: Record<string, GaussParams> = { "Escassa": [100, 80], "Moderada": [600, 250], "Intensa": [1500, 350] };
const mapa_out_amb: Record<string, GaussParams> = { "I": [0, 15], "R": [35, 12], "M": [65, 12], "B": [100, 15] };

export const regras_amb: Rule[] = [
  { in1: "Ácido", in2: "Baixa", in3: "Escassa", out: "I", prob: 1.0 },
  { in1: "Ácido", in2: "Baixa", in3: "Moderada", out: "R", prob: 1.0 },
  { in1: "Ácido", in2: "Baixa", in3: "Intensa", out: "R", prob: 1.0 },
  { in1: "Ácido", in2: "Ideal", in3: "Escassa", out: "R", prob: 1.0 },
  { in1: "Ácido", in2: "Ideal", in3: "Moderada", out: "R", prob: 1.0 },
  { in1: "Ácido", in2: "Ideal", in3: "Intensa", out: "R", prob: 1.0 },
  { in1: "Ácido", in2: "Salina", in3: "Escassa", out: "I", prob: 1.0 },
  { in1: "Ácido", in2: "Salina", in3: "Moderada", out: "R", prob: 1.0 },
  { in1: "Ácido", in2: "Salina", in3: "Intensa", out: "R", prob: 1.0 },
  { in1: "Ideal", in2: "Baixa", in3: "Escassa", out: "R", prob: 1.0 },
  { in1: "Ideal", in2: "Baixa", in3: "Moderada", out: "M", prob: 1.0 },
  { in1: "Ideal", in2: "Baixa", in3: "Intensa", out: "B", prob: 1.0 },
  { in1: "Ideal", in2: "Ideal", in3: "Escassa", out: "M", prob: 1.0 },
  { in1: "Ideal", in2: "Ideal", in3: "Moderada", out: "M", prob: 1.0 },
  { in1: "Ideal", in2: "Ideal", in3: "Intensa", out: "B", prob: 1.0 },
  { in1: "Ideal", in2: "Salina", in3: "Escassa", out: "I", prob: 1.0 },
  { in1: "Ideal", in2: "Salina", in3: "Moderada", out: "R", prob: 1.0 },
  { in1: "Ideal", in2: "Salina", in3: "Intensa", out: "R", prob: 1.0 },
  { in1: "Alcalino", in2: "Baixa", in3: "Escassa", out: "I", prob: 1.0 },
  { in1: "Alcalino", in2: "Baixa", in3: "Moderada", out: "R", prob: 1.0 },
  { in1: "Alcalino", in2: "Baixa", in3: "Intensa", out: "R", prob: 1.0 },
  { in1: "Alcalino", in2: "Ideal", in3: "Escassa", out: "R", prob: 1.0 },
  { in1: "Alcalino", in2: "Ideal", in3: "Moderada", out: "M", prob: 1.0 },
  { in1: "Alcalino", in2: "Ideal", in3: "Intensa", out: "M", prob: 1.0 },
  { in1: "Alcalino", in2: "Salina", in3: "Escassa", out: "I", prob: 1.0 },
  { in1: "Alcalino", in2: "Salina", in3: "Moderada", out: "R", prob: 1.0 },
  { in1: "Alcalino", in2: "Salina", in3: "Intensa", out: "R", prob: 1.0 },
];

// --- MÓDULO B: PLANTA ---
const mapa_ft: Record<string, GaussParams> = { "Estabilizadora": [0.4, 0.25], "Mista": [1.1, 0.2], "Extratora": [3.0, 0.8] };
const mapa_fen: Record<string, GaussParams> = { "Inicial": [15, 10], "Vigoroso": [50, 15], "Senescência": [85, 10] };
const mapa_raiz: Record<string, GaussParams> = { "Pobre": [1.0, 1.2], "Média": [5.5, 1.5], "Densa": [9.0, 1.0] };
const mapa_out_bio: Record<string, GaussParams> = { "I": [0, 15], "B": [35, 12], "M": [65, 12], "A": [100, 15] };

export const regras_phys: Rule[] = [
  { in1: "Estabilizadora", in2: "Inicial", in3: "Pobre", out: "B", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Inicial", in3: "Média", out: "B", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Inicial", in3: "Densa", out: "M", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Vigoroso", in3: "Pobre", out: "B", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Vigoroso", in3: "Média", out: "M", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Vigoroso", in3: "Densa", out: "M", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Senescência", in3: "Pobre", out: "I", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Senescência", in3: "Média", out: "B", prob: 1.0 },
  { in1: "Estabilizadora", in2: "Senescência", in3: "Densa", out: "B", prob: 1.0 },
  { in1: "Mista", in2: "Inicial", in3: "Pobre", out: "B", prob: 1.0 },
  { in1: "Mista", in2: "Inicial", in3: "Média", out: "B", prob: 1.0 },
  { in1: "Mista", in2: "Inicial", in3: "Densa", out: "M", prob: 1.0 },
  { in1: "Mista", in2: "Vigoroso", in3: "Pobre", out: "M", prob: 1.0 },
  { in1: "Mista", in2: "Vigoroso", in3: "Média", out: "M", prob: 1.0 },
  { in1: "Mista", in2: "Vigoroso", in3: "Densa", out: "A", prob: 1.0 },
  { in1: "Mista", in2: "Senescência", in3: "Pobre", out: "B", prob: 1.0 },
  { in1: "Mista", in2: "Senescência", in3: "Média", out: "B", prob: 1.0 },
  { in1: "Mista", in2: "Senescência", in3: "Densa", out: "B", prob: 1.0 },
  { in1: "Extratora", in2: "Inicial", in3: "Pobre", out: "B", prob: 1.0 },
  { in1: "Extratora", in2: "Inicial", in3: "Média", out: "M", prob: 1.0 },
  { in1: "Extratora", in2: "Inicial", in3: "Densa", out: "M", prob: 1.0 },
  { in1: "Extratora", in2: "Vigoroso", in3: "Pobre", out: "M", prob: 1.0 },
  { in1: "Extratora", in2: "Vigoroso", in3: "Média", out: "M", prob: 1.0 },
  { in1: "Extratora", in2: "Vigoroso", in3: "Densa", out: "A", prob: 1.0 },
  { in1: "Extratora", in2: "Senescência", in3: "Pobre", out: "B", prob: 1.0 },
  { in1: "Extratora", in2: "Senescência", in3: "Média", out: "B", prob: 1.0 },
  { in1: "Extratora", in2: "Senescência", in3: "Densa", out: "M", prob: 1.0 },
];

// --- MÓDULO C: OPERACIONAL ---
const mapa_conc: Record<string, GaussParams> = { "Baixa": [50, 40], "Média": [350, 120], "Alta": [800, 150] };
const mapa_tempo: Record<string, GaussParams> = { "Curto": [10, 8], "Médio": [40, 12], "Longo": [75, 15] };
const mapa_bmas: Record<string, GaussParams> = { "Pequena": [15, 10], "Média": [50, 15], "Grande": [85, 12] };
const mapa_out_op: Record<string, GaussParams> = { "R": [15, 15], "RG": [55, 15], "B": [100, 15] };

export const regras_ops: Rule[] = [
  { in1: "Baixa", in2: "Curto", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Curto", in3: "Média", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Curto", in3: "Grande", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Médio", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Médio", in3: "Média", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Médio", in3: "Grande", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Longo", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Longo", in3: "Média", out: "R", prob: 1.0 },
  { in1: "Baixa", in2: "Longo", in3: "Grande", out: "R", prob: 1.0 },
  { in1: "Média", in2: "Curto", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Média", in2: "Curto", in3: "Média", out: "B", prob: 1.0 },
  { in1: "Média", in2: "Curto", in3: "Grande", out: "B", prob: 1.0 },
  { in1: "Média", in2: "Médio", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Média", in2: "Médio", in3: "Média", out: "RG", prob: 1.0 },
  { in1: "Média", in2: "Médio", in3: "Grande", out: "B", prob: 1.0 },
  { in1: "Média", in2: "Longo", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Média", in2: "Longo", in3: "Média", out: "RG", prob: 1.0 },
  { in1: "Média", in2: "Longo", in3: "Grande", out: "B", prob: 1.0 },
  { in1: "Alta", in2: "Curto", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Alta", in2: "Curto", in3: "Média", out: "RG", prob: 1.0 },
  { in1: "Alta", in2: "Curto", in3: "Grande", out: "B", prob: 1.0 },
  { in1: "Alta", in2: "Médio", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Alta", in2: "Médio", in3: "Média", out: "RG", prob: 1.0 },
  { in1: "Alta", in2: "Médio", in3: "Grande", out: "B", prob: 1.0 },
  { in1: "Alta", in2: "Longo", in3: "Pequena", out: "R", prob: 1.0 },
  { in1: "Alta", in2: "Longo", in3: "Média", out: "RG", prob: 1.0 },
  { in1: "Alta", in2: "Longo", in3: "Grande", out: "B", prob: 1.0 },
];

// 3. Função de Inferência Mamdani Gaussiana
export type ModuleResult = { valor: number; curva: number[] };

const processarModulo = (
  inputs: [number, number, number],
  mapasIn: [Record<string, GaussParams>, Record<string, GaussParams>, Record<string, GaussParams>],
  mapaOut: Record<string, GaussParams>,
  regras: Rule[]
): ModuleResult => {
  const outAgregado = new Array(u_padrao.length).fill(0);

  for (const regra of regras) {
    const muA = fuzzGauss(inputs[0], mapasIn[0][regra.in1]);
    const muB = fuzzGauss(inputs[1], mapasIn[1][regra.in2]);
    const muC = fuzzGauss(inputs[2], mapasIn[2][regra.in3]);

    const disparo = Math.min(muA, muB, muC) * regra.prob;

    if (disparo > 0) {
      const paramsOut = mapaOut[regra.out];
      for (let i = 0; i < u_padrao.length; i++) {
        const valOut = fuzzGauss(u_padrao[i], paramsOut);
        outAgregado[i] = Math.max(outAgregado[i], valOut * disparo);
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