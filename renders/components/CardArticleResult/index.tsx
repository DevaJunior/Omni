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
    <article className="article-result-card" onClick={() => onViewArticle(article.id)}>
      
      {/* Card Header */}
      <div className="card-top-bar">
        <div className="card-badges">
          {article.accessType === 'open' ? (
            <span className="badge-access badge-open">
              <LockOpen size={12} /> OPEN ACCESS
            </span>
          ) : article.pubType === 'Preprint' ? (
            <span className="badge-access badge-preprint">
              PREPRINT
            </span>
          ) : (
            <span className="badge-access badge-restricted">
              <Lock size={12} /> RESTRITO
            </span>
          )}
          
          {article.pubType !== 'Preprint' && (
            <span className="badge-pubtype">{article.pubType}</span>
          )}
        </div>
        <button className="btn-bookmark" onClick={(e) => onToggleBookmark(e, article)}>
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Content */}
      <h3 className="card-title">{article.title}</h3>
      <div className="card-authors">
        {article.authors ? article.authors.split(',').map((author: string, idx: number, arr: any[]) => (
          <React.Fragment key={idx}>
            <span className="author-link">{author.trim()}</span>
            {idx < arr.length - 1 && ', '}
          </React.Fragment>
        )) : 'Desconhecido'}
      </div>
      
      <div className="card-meta-line">
        {article.journal || 'Journal'} &bull; {article.date || 'Data Desconhecida'} &bull; DOI: {article.doi || 'N/A'}
      </div>

      <p className="card-abstract">
        {article.abstract && article.abstract.length > 220 
          ? article.abstract.substring(0, 220) + '...' 
          : article.abstract}
      </p>

      {/* Card Footer */}
      <div className="card-footer-actions">
        <div className="card-stats">
          <span className="stat-item"><MessageSquare size={14} className="stat-icon" /> {article.citations} Citações</span>
          <span className="stat-item"><Eye size={14} className="stat-icon" /> {article.reads >= 1000 ? (article.reads/1000).toFixed(1)+'k' : article.reads} Leituras</span>
        </div>
        <div className="card-buttons">
          {article.accessType === 'open' ? (
            <>
              <button className="btn-action-outline" onClick={(e) => { e.stopPropagation(); }}><MessageSquare size={14} /> Citar</button>
              <button className="btn-action-solid" onClick={(e) => { e.stopPropagation(); }}><Download size={14} /> Baixar PDF</button>
            </>
          ) : article.pubType === 'Preprint' ? (
            <button className="btn-action-solid" onClick={(e) => { e.stopPropagation(); }}><Download size={14} /> Baixar PDF</button>
          ) : (
            <button className="btn-action-outline" onClick={(e) => { e.stopPropagation(); }}><ExternalLink size={14} /> Solicitar Acesso</button>
          )}
        </div>
      </div>
    </article>
  );
};

export default CardArticleResult;
