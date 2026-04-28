import React from 'react';
import './styles.css';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')     // Substitui espaços por -
      .replace(/[^\w-]+/g, '')  // Remove caracteres não alfanuméricos
      .replace(/--+/g, '-');    // Remove múltiplos -
  };

  const applyInlineStyles = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/==(.*?)==/g, '<mark>$1</mark>')
      .replace(/~+(.*?)~+/g, '<sub>$1</sub>') // Subscrito (H2O -> H~2~O)
      // Sistema de Figuras Acadêmicas robusto: Suporta URLs com espaços e formatos complexos
      .replace(/!\[([^\]|]+)(?:\|([^\]]+))?\]\(([^)]+)\)/g, (_match, alt, source, content) => {
        let url = content.trim();
        let title = '';

        // Tenta extrair o título se houver algo como: URL "Título"
        const titleMatch = content.match(/(.+)\s+"([^"]+)"$/);
        if (titleMatch) {
          url = titleMatch[1].trim();
          title = titleMatch[2].trim();
        }

        const figureTitle = title ? `<div class="md-figure-title">${title}</div>` : '';
        const figureSource = source ? `<figcaption class="md-figure-source">Fonte: ${source.trim()}</figcaption>` : '';

        return `
          <figure class="md-figure-container">
            ${figureTitle}
            <img src="${url}" alt="${alt.trim()}" class="md-image" />
            ${figureSource}
          </figure>
        `;
      })
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>')
      // Símbolos Matemáticos e Científicos (LaTeX-like)
      .replace(/\$\\rightarrow\$/g, '→')
      .replace(/\$\\leftarrow\$/g, '←')
      .replace(/\\sqrt\{(.*?)\}/g, '√$1')
      .replace(/\\times/g, '×')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\$+(.*?)\$+/g, '<code class="md-inline-math">$1</code>');
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBlock: { type: string; lines: string[]; start?: number } | null = null;

    const flushBlock = (index: number) => {
      if (!currentBlock) return;

      if (currentBlock.type === 'blockquote') {
        const content = currentBlock.lines
          .map(l => applyInlineStyles(l.replace(/^\s*>\s?/, '')))
          .map(l => `<div class="md-code-line">${l || '&nbsp;'}</div>`)
          .join('');
        elements.push(
          <blockquote key={`bq-${index}`} className="md-quote" dangerouslySetInnerHTML={{ __html: content }}></blockquote>
        );
      } else if (currentBlock.type === 'list') {
        elements.push(
          <ul key={`ul-${index}`} className="md-list-container">
            {currentBlock.lines.map((l, i) => (
              <li key={i} className="md-list-item" dangerouslySetInnerHTML={{ __html: applyInlineStyles(l.replace(/^[-*]\s/, '')) }}></li>
            ))}
          </ul>
        );
      } else if (currentBlock.type === 'ordered-list') {
        elements.push(
          <ol key={`ol-${index}`} start={currentBlock.start} className="md-list-container">
            {currentBlock.lines.map((l, i) => (
              <li key={i} className="md-list-item ordered" dangerouslySetInnerHTML={{ __html: applyInlineStyles(l.replace(/^\d+\.\s/, '')) }}></li>
            ))}
          </ol>
        );
      }
      currentBlock = null;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('> ')) {
        if (currentBlock && currentBlock.type !== 'blockquote') flushBlock(idx);
        if (!currentBlock) currentBlock = { type: 'blockquote', lines: [] };
        currentBlock!.lines.push(line);
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentBlock && currentBlock.type !== 'list') flushBlock(idx);
        if (!currentBlock) currentBlock = { type: 'list', lines: [] };
        currentBlock!.lines.push(trimmed);
        return;
      }

      const orderedMatch = trimmed.match(/^(\d+)\.\s/);
      if (orderedMatch) {
        const startNumber = parseInt(orderedMatch[1]);
        if (currentBlock && currentBlock.type !== 'ordered-list') flushBlock(idx);
        if (!currentBlock) currentBlock = { type: 'ordered-list', lines: [], start: startNumber };
        currentBlock!.lines.push(trimmed);
        return;
      }

      flushBlock(idx);

      if (trimmed.startsWith('### ')) {
        const rawText = trimmed.replace('### ', '');
        elements.push(<h3 key={idx} id={slugify(rawText)} dangerouslySetInnerHTML={{ __html: applyInlineStyles(rawText) }}></h3>);
      } else if (trimmed.startsWith('## ')) {
        const rawText = trimmed.replace('## ', '');
        elements.push(<h2 key={idx} id={slugify(rawText)} dangerouslySetInnerHTML={{ __html: applyInlineStyles(rawText) }}></h2>);
      } else if (trimmed.startsWith('# ')) {
        const rawText = trimmed.replace('# ', '');
        elements.push(<h1 key={idx} id={slugify(rawText)} dangerouslySetInnerHTML={{ __html: applyInlineStyles(rawText) }}></h1>);
      } else if (trimmed === '---') {
        elements.push(<hr key={idx} className="md-divider" />);
      } else if (trimmed === '') {
        elements.push(<br key={idx} />);
      } else {
        elements.push(<p key={idx} dangerouslySetInnerHTML={{ __html: applyInlineStyles(line) }}></p>);
      }
    });

    flushBlock(lines.length);
    return elements;
  };

  return (
    <div className="markdown-body">
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
