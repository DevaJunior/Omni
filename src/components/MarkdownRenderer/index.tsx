import React from 'react';
import './styles.css';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const applyInlineStyles = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/==(.*?)==/g, '<mark>$1</mark>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>')
      // Símbolos Matemáticos Básicos (LaTeX-like)
      .replace(/\$\\rightarrow\$/g, '→')
      .replace(/\$\\leftarrow\$/g, '←')
      .replace(/\\sqrt\{(.*?)\}/g, '√$1')
      .replace(/\\times/g, '×')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\$+(.*?)\$+/g, '<code class="md-inline-math">$1</code>'); // Envolve fórmulas em code style
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const processedLine = line.trim();

      // Blocos de Cabeçalho
      if (processedLine.startsWith('### ')) {
        const content = applyInlineStyles(processedLine.replace('### ', ''));
        return <h3 key={idx} dangerouslySetInnerHTML={{ __html: content }}></h3>;
      }
      if (processedLine.startsWith('## ')) {
        const content = applyInlineStyles(processedLine.replace('## ', ''));
        return <h2 key={idx} dangerouslySetInnerHTML={{ __html: content }}></h2>;
      }
      if (processedLine.startsWith('# ')) {
        const content = applyInlineStyles(processedLine.replace('# ', ''));
        return <h1 key={idx} dangerouslySetInnerHTML={{ __html: content }}></h1>;
      }
      
      // Listas
      if (processedLine.startsWith('- ') || processedLine.startsWith('* ')) {
        const content = applyInlineStyles(processedLine.replace(/^[-*]\s/, ''));
        return <li key={idx} className="md-list-item" dangerouslySetInnerHTML={{ __html: content }}></li>;
      }
      if (processedLine.match(/^\d+\.\s/)) {
        const content = applyInlineStyles(processedLine.replace(/^\d+\.\s/, ''));
        return <li key={idx} className="md-list-item ordered" dangerouslySetInnerHTML={{ __html: content }}></li>;
      }
      
      // Citações e Divisores
      if (processedLine.startsWith('> ')) {
        const content = applyInlineStyles(processedLine.replace('> ', ''));
        return <blockquote key={idx} className="md-quote" dangerouslySetInnerHTML={{ __html: content }}></blockquote>;
      }
      if (processedLine === '---') return <hr key={idx} className="md-divider" />;

      if (processedLine === '') return <br key={idx} />;
      
      const htmlLine = applyInlineStyles(line); // Mantém espaços originais para parágrafos
      return <p key={idx} dangerouslySetInnerHTML={{ __html: htmlLine }}></p>;
    });
  };

  return (
    <div className="markdown-body">
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
