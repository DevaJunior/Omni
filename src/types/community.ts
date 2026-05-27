export interface Article {
  id: string;
  title: string;
  authors: string;
  journal: string;
  date: string;
  impactFactor: number;
  abstract: string;
  tags: string[];
  doi: string;
  isFree: boolean;
  likes: number;
  content?: string;
}

export interface Project {
  id: string;
  title: string;
  institution: string;
  area: string;
  description: string;
  deadline: string;
  type: 'Bolsa' | 'Voluntário' | 'Financiamento';
  status: 'Aberto' | 'Em Andamento' | 'Concluído';
  tags: string[];
  location?: string;
  author: string;
  authorId?: string;
}

export interface Discussion {
  id: string;
  title?: string; // Título opcional para o feed
  author: string;
  authorId?: string;
  avatar?: string;
  role?: string;
  time?: string;
  content: string;
  category: string;
  date: string;
  likes: number;
  likedBy?: string[];
  comments: number;
  tags: string[];
}

export interface LabPartner {
  id: string;
  name: string;
}
