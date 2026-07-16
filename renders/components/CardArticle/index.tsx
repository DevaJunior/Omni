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
    <article className="cmmt-article-card" ref={forwardedRef}>
      <div className="cmmt-article-header-top">
        <span
          className="cmmt-article-type"
          onClick={() => navigate('/learn')}
          style={{ cursor: 'pointer' }}
          title="Ir para trilhas de aprendizado"
        >
          <BookOpen size={16} /> Publicação Científica
        </span>
        <div className="cmmt-article-status-container">
          {article.isFree ? (
            <span className="cmmt-article-status-open">Open Access</span>
          ) : (
            <span className="cmmt-article-status-closed">Paywall</span>
          )}
          <Bookmark size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <h3
        className="cmmt-article-title"
        onClick={() => onViewArticle(article.id)}
        title="Ler artigo"
      >
        {article.title}
      </h3>

      <div className="cmmt-article-meta">
        <span><Users size={16} /> {article.authors || article.author || 'Autor não informado'}</span>
      </div>

      <div className="cmmt-article-meta cmmt-article-source">
        {article.journal && <span><strong>{article.journal}</strong></span>}
        <span><Calendar size={16} /> {article.date || article.year}</span>
        {article.impactFactor && <span className="cmmt-meta-impact">FI: {article.impactFactor}</span>}
      </div>

      <div className="cmmt-article-abstract">
        <strong>Resumo: </strong>{article.abstract || article.description}
      </div>

      <div className="cmmt-article-stats-row">
        <div className="cmmt-article-stats-left">
          <span><MessageSquare size={16} /> {article.citations || 0} Citações</span>
          <span><Eye size={16} /> {article.reads >= 1000 ? (article.reads/1000).toFixed(1)+'k' : (article.reads || 0)} Leituras</span>
        </div>
        {article.doi && <span className="cmmt-doi">DOI: {article.doi}</span>}
      </div>

      <div className="cmmt-article-footer">
        <div className="cmmt-article-tags">
          {article.tags?.map((tag: string) => (
            <span key={tag} className="cmmt-article-tag-item">{tag}</span>
          ))}
        </div>
        <div className="cmmt-article-actions">
          <div className="cmmt-article-btn-group">
            {article.isFree && (
              <button className="cmmt-btn-secondary">
                <Download size={16} /> PDF
              </button>
            )}
            <button
              className="cmmt-btn-primary-read"
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
