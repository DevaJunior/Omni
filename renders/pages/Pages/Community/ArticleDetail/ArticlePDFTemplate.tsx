import React from 'react';
import MarkdownRenderer from '../../../../../src/components/MarkdownRenderer';
import { LinkIcon, Calendar } from 'lucide-react';
import './pdf-styles.css';

interface ArticlePDFTemplateProps {
  article: any;
}

export const ArticlePDFTemplate: React.FC<ArticlePDFTemplateProps> = ({ article }) => {
  if (!article) return null;

  return (
    <div id="article-pdf-template" className="pdf-template-container">
      <div className="pdf-header">
        <div className="pdf-author-section">
          <div className="pdf-author-info">
            <div className="pdf-author-name">{article.authors}</div>
            <div className="pdf-author-inst">{article.institutions}</div>
          </div>
        </div>

        <h1 className="pdf-title">{article.title}</h1>

        <div className="pdf-header-divider"></div>

        <div className="pdf-meta-section">
          <div className="pdf-doi">
            <LinkIcon size={16} className="pdf-icon" />
            <span className="pdf-meta-label">DOI: </span>
            <span className="pdf-doi-link">{article.doi || '10.0000/omni.blog.home'}</span>
          </div>
          <div className="pdf-date">
            <Calendar size={16} className="pdf-icon" />
            Data de publicação: {new Date().toLocaleDateString('pt-BR').replace(/\//g, '.')}
          </div>
        </div>
      </div>

      <div className="pdf-abstract">
        <div style={{ marginTop: '10px' }}>
          <MarkdownRenderer content={article.abstract} />
        </div>
      </div>

      <div className="pdf-keywords">
        <strong>Palavras-chave:</strong> {article.tags?.join(', ')}
      </div>

      <div className="pdf-content">
        <MarkdownRenderer content={article.content} />
      </div>

      <div className="pdf-footer">
        Gerado por Omni - {new Date().getFullYear()}
      </div>
    </div>
  );
};
