import React from 'react';
import { BookOpen, Bookmark, MessageSquare, Eye, ExternalLink, Users, Calendar, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export interface CardArticleProps {
  article: any;
  onViewArticle: (id: string | number) => void;
  forwardedRef?: React.Ref<HTMLElement>;
}

const CardArticle: React.FC<CardArticleProps> = ({ article, onViewArticle, forwardedRef }) => {
  const navigate = useNavigate();

  return (
    <article className="carrd_article-article-card" ref={forwardedRef}>
      <div className="carrd_article-article-header-top">
        <span
          className="carrd_article-article-type"
          onClick={() => navigate('/learn')}
          style={{ cursor: 'pointer' }}
          title="Ir para trilhas de aprendizado"
        >
          <BookOpen size={16} /> Publicação Científica
        </span>

        <div className="carrd_article-article-status-container">
          {article.isFree ? (
            <span className="carrd_article-article-status-open">Open Access</span>
          ) : (
            <span className="carrd_article-article-status-closed">Paywall</span>
          )}
          <Bookmark size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <h3
        className="carrd_article-article-title"
        onClick={() => onViewArticle(article.id)}
        title="Ler artigo"
      >
        {article.title}
      </h3>

      <div className="carrd_article-article-meta">
        <span><Users size={16} /> {article.authors || article.author || 'Autor não informado'}</span>
      </div>

      <div className="carrd_article-article-meta carrd_article-article-source">
        {article.journal && <span><strong>{article.journal}</strong></span>}
        <span><Calendar size={16} /> {article.date || article.year}</span>
        {article.impactFactor && <span className="carrd_article-meta-impact">FI: {article.impactFactor}</span>}
      </div>

      <div className="carrd_article-article-abstract">
        <strong>Resumo: </strong>{article.abstract || article.description}
      </div>

      <div className="carrd_article-article-stats-row">
        <div className="carrd_article-article-stats-left">
          <span><MessageSquare size={16} /> {article.citations || 0} Citações</span>
          <span><Eye size={16} /> {article.reads >= 1000 ? (article.reads / 1000).toFixed(1) + 'k' : (article.reads || 0)} Leituras</span>
        </div>
        {article.doi && <span className="carrd_article-doi">DOI: {article.doi}</span>}
      </div>

      <div className="carrd_article-article-footer">
        <div className="carrd_article-article-tags">
          {article.tags?.map((tag: string) => (
            <span key={tag} className="carrd_article-article-tag-item">{tag}</span>
          ))}
        </div>
        <div className="carrd_article-article-actions">
          <div className="carrd_article-article-btn-group">
            {article.isFree && (
              <button className="carrd_article-btn-secondary">
                <Download size={16} /> PDF
              </button>
            )}
            <button
              className="carrd_article-btn-primary-read"
              onClick={() => onViewArticle(article.id)}
            >
              Ler Artigo <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CardArticle;