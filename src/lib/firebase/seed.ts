import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

// ==========================================
// MOCKS EXTRAÍDOS DOS COMPONENTES
// ==========================================

const userData = {
  id: "Gbo5XwC4Twas5iTZkdI3v8HalO42", // ID real do Auth do Usuário
  name: "Devair Junior",
  headline: "Mestrando em Biotecnologia | Bacharel em Ciência da Computação | Desenvolvedor Front-end",
  bio: "Unindo a engenharia de software com as ciências biológicas. Sou bacharel em Ciência da Computação e atualmente desenvolvo meu projeto de mestrado em Biotecnologia, focado em modelagem matemática e bioinformática aplicadas à fitorremediação. Apaixonado por criar interfaces limpas, arquiteturas escaláveis e, nas horas vagas, pelo universo nerd, fantasias e desenvolvimento de jogos.",
  location: "Alfenas, MG - Brasil",
  email: "contatodevairjunior@gmail.com",
  github: "github.com/DevaJunior",
  linkedin: "linkedin.com/in/devairjunior",
  website: "",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000",
  skills: ["React", "TypeScript", "Python", "Bioinformática", "Lógica P-Fuzzy", "CSS Puro", "Phaser 3"],
  lab: {
    id: "1",
    name: "Phyton Research",
    role: "Admin"
  }
};

const mockOtherUsers = [
  { id: "uid_ana_costa", name: "Ana Costa", headline: "Doutoranda em Bioquímica | UNICAMP", department: "Depto. de Bioquímica", avatar: "https://ui-avatars.com/api/?name=Ana+Costa", following: [] },
  { id: "uid_rafael_mendes", name: "Rafael Mendes", headline: "Pesquisador em Química Analítica", department: "Depto. de Química Analítica", avatar: "https://ui-avatars.com/api/?name=Rafael+Mendes", following: [] }
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
    id: "101", labId: "1", title: "Projeto de Pesquisa: Rizo Filtração de Metais Pesados", institution: "Phyton Research & UNIFAL-MG", type: "Pesquisa Acadêmica", location: "Alfenas-MG (Híbrido)", deadline: "Fluxo Contínuo", status: "Aberto", coordinator: "Dra. Helena Ribeiro", grant: "Bolsa FAPEMIG (R$ 2.100,00/mês)",
    description: "O Laboratório de Biotecnologia Ambiental está recrutando pesquisadores para integrar um projeto multidisciplinar focado na fitorremediação...",
    requirements: ["Estar matriculado em programa de Mestrado ou Doutorado..."],
    responsibilities: ["Coletar e tabular dados de crescimento..."], tags: ["Rizofiltração", "P-Fuzzy", "Python", "Biotecnologia"]
  },
  {
    id: "102", labId: "1", title: "Bolsa de Mestrado em Biotecnologia", institution: "Phyton Research", type: "Bolsa de Estudos", location: "Presencial", deadline: "30 de Novembro, 2026", status: "Aberto", coordinator: "Prof. Dr. Rafael Mendes", grant: "Bolsa CAPES",
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
    abstract: "Este artigo propõe uma nova abordagem baseada na lógica P-Fuzzy...", tags: ["Fitorremediação", "Lógica P-Fuzzy", "Tratamento de Efluentes"], stats: { views: 1245, downloads: 340, citations: 12 },
    content: "<h2>1. Introdução</h2><p>A contaminação de corpos hídricos por metais pesados representa um dos maiores desafios ambientais contemporâneos. A rizofiltração, técnica biotecnológica que utiliza sistemas radiculares de plantas para absorver, concentrar e precipitar metais tóxicos de efluentes, tem se mostrado uma alternativa sustentável e de baixo custo.</p><p>No entanto, a predição da eficiência deste processo enfrenta dificuldades inerentes à complexidade dos sistemas biológicos, onde variáveis como pH, temperatura e biomassa interagem de forma não-linear. Diante deste cenário, a aplicação da Lógica P-Fuzzy (Fuzzy Probabilística) surge como uma ferramenta promissora para modelar tais incertezas com maior acurácia.</p><h2>2. Materiais e Métodos</h2><p>Para a modelagem, os dados de entrada consistiram em concentrações iniciais de Cádmio (Cd) e Chumbo (Pb), tempo de exposição e desenvolvimento da biomassa radicular. Foi desenvolvido um algoritmo em Python integrado à plataforma Omni para o processamento das regras de inferência fuzzy.</p><h2>3. Resultados</h2><p>O modelo P-Fuzzy alcançou um coeficiente de correlação (R²) de 0.94 na predição da taxa de remoção de metais, superando o modelo linear clássico (R² = 0.78). A integração dos dados diretamente através da plataforma laboratorial agilizou o processamento em 40%.</p>",
    related: [
      { id: "rel1", title: "Fitorremediação de Cádmio utilizando macrófitas aquáticas em biorreatores.", journal: "Journal of Botany", year: "2024" },
      { id: "rel2", title: "Comparativo entre Lógica Fuzzy e Redes Neurais na predição de qualidade da água.", journal: "Water Research", year: "2025" }
    ]
  }
];

const mockCourses = [
  { id: "c1", name: "Biotecnologia" },
  { id: "c2", name: "Biologia" },
  { id: "c3", name: "Ciência da Computação" },
  { id: "c4", name: "Química" },
  { id: "c5", name: "Farmácia" },
  { id: "c6", name: "Medicina" },
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
  { 
    id: '1', 
    name: "Phyton Research",
    institution: "Universidade Federal de Alfenas",
    verified: true,
    description: "Focados na vanguarda da biotecnologia ambiental, nosso laboratório desenvolve abordagens de fitorremediação otimizadas por sistemas matemáticos da Lógica P-Fuzzy. Integrando botânica, ciência de dados e química analítica, criamos soluções sustentáveis para tratar efluentes contaminados com alta precisão e baixo custo. Buscamos impactar diretamente o setor produtivo através da aplicação de tecnologias verdes e monitoramento de precisão.",
    location: "Alfenas, MG - Brasil",
    website: "phytonresearch.unifal-mg.edu.br",
    email: "contato@phytonresearch.edu.br",
    logoImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=200",
    adminId: "Gbo5XwC4Twas5iTZkdI3v8HalO42",
    customRoles: [
      { name: "Admin", permissions: ["manage_team", "manage_settings", "manage_projects"] },
      { name: "Pesquisador", permissions: ["manage_projects"] },
      { name: "Aluno", permissions: [] }
    ],
    stats: { members: 12, projects: 4, publications: 18 },
    publications: [
      { id: 1, title: "Modelagem P-Fuzzy em Sistemas Aquáticos", journal: "Journal of Environmental Biotechnology", date: "2025", type: "Artigo" },
      { id: 2, title: "Fitorremediação: Novas Fronteiras", journal: "Nature Sustainability", date: "2024", type: "Review" },
      { id: 3, title: "Acúmulo de Metais em Eichhornia crassipes", journal: "Water Research", date: "2024", type: "Artigo" }
    ],
    featuredArticles: [
      { id: 1, title: "Lógica P-Fuzzy na Predição de Absorção", journal: "IEEE Transactions on Fuzzy Systems", authors: "Ribeiro, H. M.; Costa, A. L." },
      { id: 2, title: "Sustentabilidade e Modelagem", journal: "Biotechnology Advances", authors: "Silva, M.; Ribeiro, H. M." }
    ]
  },
  { 
    id: '2', 
    name: "Biogen",
    institution: "Universidade de São Paulo (USP)",
    verified: true,
    description: "Laboratório focado em genômica e bioengenharia de novos materiais. Nossas pesquisas abrangem desde a engenharia de tecidos até o desenvolvimento de biossensores inovadores para diagnósticos médicos de precisão.",
    location: "São Paulo, SP - Brasil",
    website: "biogen.usp.br",
    email: "labbiogen@usp.br",
    logoImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=200",
    stats: { members: 25, projects: 7, publications: 45 },
    publications: [],
    featuredArticles: []
  },
  { 
    id: '3', 
    name: "Neurolab",
    institution: "Universidade Estadual de Campinas (UNICAMP)",
    verified: false,
    description: "Grupo de pesquisa dedicado ao entendimento das bases neurobiológicas de doenças degenerativas e aplicação de inteligência artificial na interpretação de imagens cerebrais.",
    location: "Campinas, SP - Brasil",
    website: "neurolab.unicamp.br",
    email: "contato@neurolab.unicamp.br",
    logoImage: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=200",
    stats: { members: 8, projects: 2, publications: 10 },
    publications: [],
    featuredArticles: []
  },
  { 
    id: '4', 
    name: "Genesis Labs",
    institution: "Instituto de Ciências Biomédicas",
    verified: true,
    description: "Centro de biologia sintética voltado para o design e síntese de circuitos genéticos em bactérias. Trabalhamos em biologia de sistemas para a produção sustentável de insumos químicos industriais.",
    location: "Belo Horizonte, MG - Brasil",
    website: "genesislabs.icb.br",
    email: "info@genesislabs.icb.br",
    logoImage: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=200",
    stats: { members: 15, projects: 5, publications: 32 },
    publications: [],
    featuredArticles: []
  }
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

    // 9. Criar Cursos
    console.log("Populando Courses...");
    for (const course of mockCourses) {
      await setDoc(doc(db, "courses", course.id), course);
    }

    console.log("✅ Migração concluída com sucesso! Os mocks já podem ser deletados.");
  } catch (error) {
    console.error("Erro durante a migração para o Firebase:", error);
  }
}
