import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // IMPORTANTE: O CSS que faz a mágica visual acontecer
import './styles.css';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const mathTokens: string[] = [];

  const extractMath = (text: string) => {
    const mathRegex = /(\$\$[\s\S]*?\$\$)|(\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\})|(\$[^$\n]+\$)/g;

    return text.replace(mathRegex, (match, block1, block2, inline) => {
      try {
        if (block1) {
          // Remove os $$ para o KaTeX processar apenas a fórmula
          const math = block1.replace(/^\$\$|\$\$/g, '').trim();
          const rendered = katex.renderToString(math, { displayMode: true, throwOnError: false });
          mathTokens.push(`<div class="md-math-block">${rendered}</div>`);
        } else if (block2) {
          // Mantém o \begin...\end completo
          const rendered = katex.renderToString(block2, { displayMode: true, throwOnError: false });
          mathTokens.push(`<div class="md-math-block">${rendered}</div>`);
        } else if (inline) {
          // Remove os $
          const math = inline.replace(/^\$|\$/g, '').trim();
          const rendered = katex.renderToString(math, { displayMode: false, throwOnError: false });
          mathTokens.push(`<span class="md-inline-math">${rendered}</span>`);
        }
      } catch (error) {
        // Fallback: se houver erro de sintaxe no LaTeX escrito pelo usuário, exibe o texto puro
        mathTokens.push(`<span class="md-math-error">${match}</span>`);
      }

      return `__MATH_TOKEN_${mathTokens.length - 1}__`;
    });
  };

  const restoreMath = (text: string) => {
    return text.replace(/__MATH_TOKEN_(\d+)__/g, (_, index) => {
      return mathTokens[parseInt(index, 10)];
    });
  };

  const applyInlineStyles = (text: string) => {
    let styledText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/==(.*?)==/g, '<mark>$1</mark>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/~+(.*?)~+/g, '<sub>$1</sub>')
      .replace(/\^(.*?)\^/g, '<sup>$1</sup>')
      .replace(/`(.*?)`/g, '<code class="md-inline-code">$1</code>')
      .replace(/!\[([^\]|]+)(?:\|([^\]]+))?\]\(([^)]+)\)/g, (_match, alt, source, contentUrl) => {
        let url = contentUrl.trim();
        let title = '';

        const titleMatch = contentUrl.match(/(.+)\s+"([^"]+)"$/);
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
      .replace(/\^3/g, '³');

    return restoreMath(styledText);
  };

  const renderMarkdown = (text: string) => {
    const textWithMathExtracted = extractMath(text);
    const lines = textWithMathExtracted.split('\n');
    const elements: React.ReactNode[] = [];
    let currentBlock: { type: string; lines: string[]; start?: number } | null = null;

    const flushBlock = (index: number) => {
      if (!currentBlock) return;

      if (currentBlock.type === 'blockquote') {
        const blockContent = currentBlock.lines
          .map(l => applyInlineStyles(l.replace(/^\s*>\s?/, '')))
          .map(l => `<div class="md-code-line">${l || '&nbsp;'}</div>`)
          .join('');
        elements.push(
          <blockquote key={`bq-${index}`} className="md-quote" dangerouslySetInnerHTML={{ __html: blockContent }}></blockquote>
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
      } else if (currentBlock.type === 'code') {
        elements.push(
          <pre key={`code-${index}`} className="md-code-block">
            <code>{currentBlock.lines.join('\n')}</code>
          </pre>
        );
      } else if (currentBlock.type === 'table') {
        const thead = currentBlock.lines[0];
        let tbody = currentBlock.lines.slice(1);
        if (tbody.length > 0 && tbody[0].replace(/[\s|-]/g, '') === '') {
          tbody = tbody.slice(1);
        }
        
        const renderRow = (row: string, cellTag: 'th' | 'td') => {
          const cells = row.split('|').map(c => c.trim()).filter((_, i, arr) => i !== 0 && i !== arr.length - 1);
          return cells.map((c, i) => `<${cellTag} key="${i}">${applyInlineStyles(c)}</${cellTag}>`).join('');
        };

        elements.push(
          <div key={`table-wrapper-${index}`} className="md-table-wrapper">
            <table className="md-table">
              <thead>
                <tr dangerouslySetInnerHTML={{ __html: renderRow(thead, 'th') }}></tr>
              </thead>
              <tbody>
                {tbody.map((row, i) => (
                  <tr key={`tr-${i}`} dangerouslySetInnerHTML={{ __html: renderRow(row, 'td') }}></tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      currentBlock = null;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (currentBlock && currentBlock.type === 'code') {
        if (trimmed.startsWith('```')) {
          flushBlock(idx);
        } else {
          currentBlock.lines.push(line);
        }
        return;
      }

      if (trimmed.startsWith('```')) {
        flushBlock(idx);
        currentBlock = { type: 'code', lines: [] };
        return;
      }

      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1) {
        if (currentBlock && currentBlock.type !== 'table') flushBlock(idx);
        if (!currentBlock) currentBlock = { type: 'table', lines: [] };
        currentBlock.lines.push(trimmed);
        return;
      }

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