import React from 'react';
import { LockOpen, Lock, Bookmark, MessageSquare, Eye, Download, ExternalLink } from 'lucide-react';
import './styles.css';

export interface ArticleResultData {
  id: string | number;
  title: string;
  authors: string;
  journal: string;
  date: string;
  doi: string;
  abstract: string;
  citations: number;
  reads: number;
  accessType: 'open' | 'restricted' | string;
  pubType: string;
}

interface CardArticleResultProps {
  article: ArticleResultData;
  isSaved: boolean;
  onViewArticle: (id: string | number) => void;
  onToggleBookmark: (e: React.MouseEvent, article: ArticleResultData) => void;
}

const CardArticleResult: React.FC<CardArticleResultProps> = ({
  article,
  isSaved,
  onViewArticle,
  onToggleBookmark
}) => {
  return (
    <article className="carrd-article_result-article-result-card" onClick={() => onViewArticle(article.id)}>

      {/* Card Header */}
      <div className="carrd-article_result-card-top-bar">
        <div className="carrd-article_result-card-badges">
          {article.accessType === 'open' ? (
            <span className="carrd-article_result-badge-access carrd-article_result-badge-open">
              <LockOpen size={12} /> OPEN ACCESS
            </span>
          ) : article.pubType === 'Preprint' ? (
            <span className="carrd-article_result-badge-access carrd-article_result-badge-preprint">
              PREPRINT
            </span>
          ) : (
            <span className="carrd-article_result-badge-access carrd-article_result-badge-restricted">
              <Lock size={12} /> RESTRITO
            </span>
          )}

          {article.pubType !== 'Preprint' && (
            <span className="carrd-article_result-badge-pubtype">{article.pubType}</span>
          )}
        </div>
        <button className="carrd-article_result-btn-bookmark" onClick={(e) => onToggleBookmark(e, article)}>
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Content */}
      <h3 className="carrd-article_result-card-title">{article.title}</h3>
      <div className="carrd-article_result-card-authors">
        {article.authors ? article.authors.split(',').map((author: string, idx: number, arr: any[]) => (
          <React.Fragment key={idx}>
            <span className="carrd-article_result-author-link">{author.trim()}</span>
            {idx < arr.length - 1 && ', '}
          </React.Fragment>
        )) : 'Desconhecido'}
      </div>

      <div className="carrd-article_result-card-meta-line">
        {article.journal || 'Journal'} &bull; {article.date || 'Data Desconhecida'} &bull; DOI: {article.doi || 'N/A'}
      </div>

      <p className="carrd-article_result-card-abstract">
        {article.abstract && article.abstract.length > 220
          ? article.abstract.substring(0, 220) + '...'
          : article.abstract}
      </p>

      {/* Card Footer */}
      <div className="carrd-article_result-card-footer-actions">
        <div className="carrd-article_result-card-stats">
          <span className="carrd-article_result-stat-item"><MessageSquare size={14} className="carrd-article_result-stat-icon" /> {article.citations} Citações</span>
          <span className="carrd-article_result-stat-item"><Eye size={14} className="carrd-article_result-stat-icon" /> {article.reads >= 1000 ? (article.reads / 1000).toFixed(1) + 'k' : article.reads} Leituras</span>
        </div>
        <div className="carrd-article_result-card-buttons">
          {article.accessType === 'open' ? (
            <>
              <button className="carrd-article_result-btn-action-outline" onClick={(e) => { e.stopPropagation(); }}><MessageSquare size={14} /> Citar</button>
              <button className="carrd-article_result-btn-action-solid" onClick={(e) => { e.stopPropagation(); }}><Download size={14} /> Baixar PDF</button>
            </>
          ) : article.pubType === 'Preprint' ? (
            <button className="carrd-article_result-btn-action-solid" onClick={(e) => { e.stopPropagation(); }}><Download size={14} /> Baixar PDF</button>
          ) : (
            <button className="carrd-article_result-btn-action-outline" onClick={(e) => { e.stopPropagation(); }}><ExternalLink size={14} /> Solicitar Acesso</button>
          )}
        </div>
      </div>
    </article>
  );
};

export default CardArticleResult;