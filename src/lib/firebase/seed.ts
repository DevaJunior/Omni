import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

// ==========================================
// MOCKS EXTRAÍDOS DOS COMPONENTES
// ==========================================

const userData = {
  id: "uid_devair_junior", // ID manual para facilitar
  name: "Devair Junior",
  headline: "Mestrando em Biotecnologia | Bacharel em Ciência da Computação | Desenvolvedor Front-end",
  bio: "Unindo a engenharia de software com as ciências biológicas. Sou bacharel em Ciência da Computação e atualmente desenvolvo meu projeto de mestrado em Biotecnologia, focado em modelagem matemática e bioinformática aplicadas à fitorremediação. Apaixonado por criar interfaces limpas, arquiteturas escaláveis e, nas horas vagas, pelo universo nerd, fantasias e desenvolvimento de jogos.",
  location: "Alfenas, MG - Brasil",
  email: "contatodevairjunior@gmail.com",
  github: "github.com/DevaJunior",
  linkedin: "linkedin.com/in/devairjunior",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000",
  skills: ["React", "TypeScript", "Python", "Bioinformática", "Lógica P-Fuzzy", "CSS Puro", "Phaser 3"],
  lab: {
    name: "Phyton Research",
    role: "Pesquisador / Desenvolvedor Principal"
  }
};

const mockOtherUsers = [
  { id: "uid_ana_costa", name: "Ana Costa", headline: "Doutoranda em Bioquímica | UNICAMP", avatar: "", following: [] },
  { id: "uid_rafael_mendes", name: "Rafael Mendes", headline: "Pesquisador em Química Analítica", avatar: "", following: [] }
];

const mockInventory = [
  { id: '1', name: 'Cloreto de Sódio (NaCl) P.A.', cas: '7647-14-5', quantity: 850, unit: 'g', location: 'Prateleira A2', expiration: '2028-10-15', status: 'ok' },
  { id: '2', name: 'Etanol Absoluto 99,8%', cas: '64-17-5', quantity: 150, unit: 'mL', location: 'Armário Inflamáveis', expiration: '2026-12-01', status: 'low' },
  { id: '3', name: 'Agarose Ultra Pura', cas: '9012-36-6', quantity: 500, unit: 'g', location: 'Geladeira 1 (4°C)', expiration: '2027-05-20', status: 'ok' },
  { id: '4', name: 'Tampão TAE 50x', cas: 'Mistura', quantity: 0, unit: 'mL', location: 'Prateleira B1', expiration: '2024-01-10', status: 'expired' },
  { id: '5', name: 'Brometo de Etídio 10mg/mL', cas: '1239-45-8', quantity: 10, unit: 'mL', location: 'Gaveta Tóxicos', expiration: '2025-11-30', status: 'ok' },
  { id: '6', name: 'Hidróxido de Sódio (NaOH)', cas: '1310-73-2', quantity: 120, unit: 'g', location: 'Prateleira A1', expiration: '2025-08-15', status: 'low' },
];

const mockTools = [
  { id: 'molarity-calc', name: 'Calculadora de Molaridade', description: 'Calcule a massa, volume ou concentração para o preparo de soluções químicas rapidamente.', category: 'Química', favorite: true },
  { id: 'dilution', name: 'Diluição de Soluções', description: 'Ferramenta baseada na fórmula C1V1 = C2V2 para diluições seriadas na bancada.', category: 'Química' },
  { id: 'lab-timer', name: 'Cronômetro Múltiplo', description: 'Gerencie o tempo de incubação de múltiplas amostras simultaneamente.', category: 'Produtividade', isNew: true },
  { id: 'unit-converter', name: 'Conversor Universal', description: 'Converta unidades de massa, volume, pressão e temperatura do SI e sistemas imperiais.', category: 'Geral' },
  { id: 'inventory', name: 'Inventário de Reagentes', description: 'Controle de estoque, lote, validade e FISPQ dos reagentes do seu laboratório.', category: 'Gestão' },
  { id: 'pfuzzy-rizofiltracao', name: 'P-Fuzzy Rizofiltração', description: 'Módulo avançado para análise de dados e predição de eficiência de Rizofiltração.', category: 'Análise de Dados' },
  { id: 'p-fuzzy-engine', name: 'Engine P-Fuzzy', description: 'Módulo avançado para análise de dados e predição de eficiência com Lógica P-Fuzzy.', category: 'Análise de Dados', isLocked: true }
];

const mockNotes = [
  {
    id: '1', title: 'Mapa Mental: Ciclo de Krebs e Fosforilação Oxidativa', excerpt: 'Resumo visual completo das etapas da respiração celular, saldo de ATP e principais enzimas envolvidas na matriz mitocondrial.',
    author: 'Maria Clara S.', subject: 'Bioquímica', date: '02 Abr, 2026', likes: 124, readTime: '5 min',
    content: "O Ciclo de Krebs (ou Ciclo do Ácido Cítrico) é uma das etapas mais cruciais da respiração...\n### Principais Etapas...\n1. *Formação*\n"
  },
  { id: '2', title: 'Genética de Populações: Equilíbrio de Hardy-Weinberg', excerpt: 'Anotações da aula prática abordando o cálculo de frequências alélicas e genotípicas em populações ideais.', author: 'Devair Junior', subject: 'Genética', date: '28 Mar, 2026', likes: 89, readTime: '8 min', content: "Conteúdo completo aqui..." },
  { id: '3', title: 'Estruturas de Dados Básicas em C', excerpt: 'Estudo focado na implementação de Pilhas, Filas e Árvores Binárias com exemplos de código comentados.', author: 'Carlos E.', subject: 'Computação', date: '20 Mar, 2026', likes: 210, readTime: '12 min', content: "Conteúdo completo aqui..." },
];

const projectsDatabase = [
  {
    id: "101", title: "Projeto de Pesquisa: Rizo Filtração de Metais Pesados", institution: "Phyton Research & UNIFAL-MG", type: "Pesquisa Acadêmica", location: "Alfenas-MG (Híbrido)", deadline: "Fluxo Contínuo", status: "Aberto", coordinator: "Dra. Helena Ribeiro", grant: "Bolsa FAPEMIG (R$ 2.100,00/mês)",
    description: "O Laboratório de Biotecnologia Ambiental está recrutando pesquisadores para integrar um projeto multidisciplinar focado na fitorremediação...",
    requirements: ["Estar matriculado em programa de Mestrado ou Doutorado..."],
    responsibilities: ["Coletar e tabular dados de crescimento..."], tags: ["Rizofiltração", "P-Fuzzy", "Python", "Biotecnologia"]
  },
  {
    id: "102", title: "Bolsa de Mestrado em Biotecnologia", institution: "Laboratório Neurolab", type: "Bolsa de Estudos", location: "Presencial", deadline: "30 de Novembro, 2026", status: "Aberto", coordinator: "Prof. Dr. Rafael Mendes", grant: "Bolsa CAPES",
    description: "Oportunidade para desenvolver plataformas integradas de auxílio laboratorial e bioinformática.",
    requirements: ["Graduação completa..."], responsibilities: ["Desenhar..."], tags: ["Mestrado", "React", "TypeScript", "Bioinformática"]
  }
];

const discussionsDatabase = [
  {
    id: "1", author: "Dra. Helena Ribeiro", role: "Pesquisadora em Biorremediação", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", time: "Há 2 horas",
    content: "Acabamos de publicar nossos resultados preliminares sobre a aplicação de lógica P-Fuzzy...", tags: ["#Biotecnologia", "#LógicaPFuzzy", "#Rizofiltração"], likes: 34, commentsCount: 3,
    replies: [
      { id: "r1", author: "Carlos Eduardo", role: "Mestrando em Engenharia Ambiental", avatar: "https://images.unsplash.com/photo-1500648767791", time: "Há 1 hora", content: "Dra. Helena, trabalho excelente!...", likes: 5, isAuthor: false }
    ]
  }
];

const articlesDatabase = [
  {
    id: "201", title: "Modelagem P-Fuzzy Aplicada na Fitorremediação de Ambientes Aquáticos", authors: "Ribeiro, H. M.; Costa, A. L.; Silva, M.", institutions: "Departamento de Biotecnologia, Universidade Federal de Alfenas (UNIFAL-MG)", journal: "Journal of Environmental Biotechnology", date: "Outubro, 2025", doi: "10.1016/j.jenvbio.2025.10.005",
    abstract: "Este artigo propõe uma nova abordagem baseada na lógica P-Fuzzy...", tags: ["Fitorremediação", "Lógica P-Fuzzy", "Tratamento de Efluentes"], stats: { views: 1245, downloads: 340, citations: 12 }
  }
];

const homeArticlesDatabase = [
  {
    id: "h1", title: "Inovações em biotecnologia: da bancada ao mercado", desc: "Explorando as tendências mais promissoras em biotecnologia e como elas estão sendo traduzidas em práticas.", image: "/src/assets/wallapapers/wpp_cience_000.png", category: "Biotecnologia",
    stats: { views: 120, downloads: 45, citations: 2 }
  },
  {
    id: "h2", title: "Medicina personalizada: Otimizando tratamentos", desc: "Saiba como a medicina personalizada está utilizando dados genéticos para criar tratamentos sob medida.", image: "/src/assets/wallapapers/wpp_cience_001.png", category: "Medicina",
    stats: { views: 89, downloads: 12, citations: 0 }
  },
  {
    id: "h3", title: "Avanços em ciência de materiais: Criando o futuro", desc: "Uma visão geral dos últimos avanços em materiais inteligentes e como eles estão revolucionando a indústria.", image: "/src/assets/wallapapers/wpp_cience_003.png", category: "Ciência",
    stats: { views: 240, downloads: 115, citations: 14 }
  },
  {
    id: "h4", title: "O papel da IA na descoberta de novas vacinas", desc: "Descubra como algoritmos estão acelerando a pesquisa e otimizando testes clínicos para imunizantes.", image: "/src/assets/wallapapers/wpp_cience_002.png", category: "Tecnologia",
    stats: { views: 350, downloads: 200, citations: 25 }
  }
];

const allLabs = [
  { id: '1', name: "Phyton Research" },
  { id: '2', name: "Biogen" },
  { id: '3', name: "Neurolab" },
  { id: '4', name: "Genesis Labs" }
];


// ==========================================
// FUNÇÃO DE MIGRAÇÃO
// ==========================================

export async function seedFirebaseDatabase() {
  try {
    console.log("Iniciando a migração dos dados Mockados para o Firebase...");

    // 1. Criar Perfil de Usuário
    console.log("Populando Users...");
    await setDoc(doc(db, "users", userData.id), userData);
    
    // Outros usuários
    for (const u of mockOtherUsers) {
      await setDoc(doc(db, "users", u.id), u);
    }

    // 2. Criar Inventário
    console.log("Populando Inventory...");
    for (const item of mockInventory) {
      await setDoc(doc(db, "inventory", item.id), item);
    }

    // 3. Criar Ferramentas de Lab
    console.log("Populando Tools...");
    for (const tool of mockTools) {
      await setDoc(doc(db, "tools", tool.id), tool);
    }

    // 4. Criar Notas de Estudo (Notes)
    console.log("Populando Notes...");
    for (const note of mockNotes) {
      await setDoc(doc(db, "notes", note.id), note);
    }

    // 5. Criar Projetos
    console.log("Populando Projects...");
    for (const project of projectsDatabase) {
      await setDoc(doc(db, "projects", project.id), project);
    }

    // 6. Criar Discussões (Feed da Comunidade)
    console.log("Populando Discussions...");
    for (const discussion of discussionsDatabase) {
      await setDoc(doc(db, "discussions", discussion.id), discussion);
    }

    // 7. Criar Artigos Acadêmicos
    console.log("Populando Articles...");
    for (const article of articlesDatabase) {
      await setDoc(doc(db, "articles", article.id), article);
    }

    // 7.1 Criar Artigos da Home (Destaques)
    console.log("Populando Home Articles (Destaques)...");
    for (const hArticle of homeArticlesDatabase) {
      await setDoc(doc(db, "articles_home", hArticle.id), hArticle);
    }

    // 8. Criar Laboratórios
    console.log("Populando Labs...");
    for (const lab of allLabs) {
      await setDoc(doc(db, "labs", lab.id), lab);
    }

    console.log("✅ Migração concluída com sucesso! Os mocks já podem ser deletados.");
  } catch (error) {
    console.error("Erro durante a migração para o Firebase:", error);
  }
}
