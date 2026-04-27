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
  readTime: string;
}
