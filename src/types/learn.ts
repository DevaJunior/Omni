/*
Verifique e monte um plano COMPLETO para analise de alguma pendencia/melhoria/erro/lacuna sobre a página e suas respectivas funcionalidades (modais, cards, interações, paginas filhas, ...) de '/'
*/

export interface StudyNote {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  author: string;
  authorId?: string;
  subject: string;
  subjects?: string[]; // Para suportar múltiplas áreas se necessário
  disciplines?: string[];
  date: string;
  likes: number;
  likedBy?: string[];
  comments?: number;
  readTime: string;
}
