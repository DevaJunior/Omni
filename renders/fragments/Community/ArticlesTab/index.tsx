import React, { useState } from 'react';
import { BookOpen, Calendar, Users, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import './styles.css';

import img1 from '../../../../src/assets/wallapapers/wpp_cience_000.png';
import img2 from '../../../../src/assets/wallapapers/wpp_cience_001.png';

type SortOption = 'recent' | 'impact' | 'likes';

const ArticlesTab: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const featuredArticles = [
    {
      id: 901,
      title: "Inovações em biotecnologia: da bancada ao mercado",
      desc: "Explorando as tendências mais promissoras em biotecnologia e como elas estão sendo traduzidas em práticas de pesquisas de laboratório para aplicações práticas.",
      image: img1,
      category: "Biotecnologia"
    },
    {
      id: 902,
      title: "Medicina personalizada: Otimizando tratamentos",
      desc: "Saiba como a medicina personalizada está utilizando dados genéticos e moleculares para criar tratamentos sob medida para pacientes.",
      image: img2,
      category: "Medicina"
    }
  ];

  const articlesList = [
    {
      id: 201,
      title: "Modelagem P-Fuzzy Aplicada na Fitorremediação de Ambientes Aquáticos",
      authors: "Ribeiro, H. M.; Costa, A. L.; Silva, M.",
      journal: "Journal of Environmental Biotechnology",
      date: "Outubro, 2025",
      abstract: "Este artigo propõe uma nova abordagem baseada na lógica P-Fuzzy para otimizar e prever a eficiência da rizofiltração no tratamento de efluentes contaminados por metais pesados. Os resultados demonstram um aumento significativo na acurácia da análise laboratorial em comparação com métodos tradicionais.",
      tags: ["Artigo Original", "P-Fuzzy", "Fitorremediação"],
      doi: "10.1016/j.jenvbio.2025.10.005",
      isFree: true,
      impactFactor: 4.5,
      likes: 120
    },
    {
      id: 202,
      title: "Desenvolvimento de Interfaces Web para Automação de Equipamentos em Bioinformática",
      authors: "Mendes, R.; Oliveira, P.",
      journal: "Simpósio Internacional de Tecnologia e Saúde (SITS)",
      date: "Agosto, 2025",
      abstract: "Apresenta a arquitetura de software utilizando React e TypeScript para a criação de painéis de controle em tempo real para biorreatores industriais. Discute-se o gerenciamento de estado complexo e a responsividade de componentes científicos.",
      tags: ["Anais de Evento", "React", "Automação"],
      doi: "10.1109/SITS.2025.998877",
      isFree: false,
      impactFactor: 2.1,
      likes: 85
    },
    {
      id: 203,
      title: "Revisão Sistemática: O Papel do Aprendizado de Máquina na Descoberta de Vacinas",
      authors: "Santos, J. C.; Almeida, F. R.",
      journal: "Vaccine & Immunology Reviews",
      date: "Fevereiro, 2026",
      abstract: "Uma análise abrangente dos últimos cinco anos de literatura científica detalhando como algoritmos de IA e modelagem preditiva estão reduzindo os tempos de testes clínicos e otimizando o controle de qualidade na produção de imunizantes.",
      tags: ["Revisão", "Vacinas", "Inteligência Artificial"],
      doi: "10.1038/s41541-026-0001-2",
      isFree: true,
      impactFactor: 8.9,
      likes: 340
    }
  ];

  const sortedArticles = [...articlesList].sort((a, b) => {
    if (sortBy === 'impact') return b.impactFactor - a.impactFactor;
    if (sortBy === 'likes') return b.likes - a.likes;
    return b.id - a.id;
  });

  return (
    <div className="cmmt-articles-wrapper">

      <section className="cmmt-featured-section">
        <div className="cmmt-section-header">
          <h3>Publicações em Destaque</h3>
          <div className="cmmt-pagination-controls">
            <button className="cmmt-pag-btn"><ChevronLeft size={18} /></button>
            <button className="cmmt-pag-btn cmmt-pag-active"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="cmmt-featured-grid">
          {featuredArticles.map((article) => (
            <article key={article.id} className="cmmt-visual-card">
              <div className="cmmt-visual-image">
                <img src={article.image} alt={article.title} />
                <span className="cmmt-visual-badge">{article.category}</span>
              </div>
              <div className="cmmt-visual-info">
                <h4>{article.title}</h4>
                <p>{article.desc}</p>
                <button className="cmmt-btn-read-more">Leia mais &rarr;</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <hr className="cmmt-divider" />

      <section className="cmmt-technical-list-section">
        <div className="cmmt-list-controls">
          <h3>Acervo de Pesquisas</h3>

          <div className="cmmt-filter-tabs-container">
            <div className="cmmt-filter-tabs">
              <button
                className={`cmmt-filter-tab ${sortBy === 'recent' ? 'cmmt-filter-active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                Mais Recentes
              </button>
              <button
                className={`cmmt-filter-tab ${sortBy === 'impact' ? 'cmmt-filter-active' : ''}`}
                onClick={() => setSortBy('impact')}
              >
                Fator de Impacto
              </button>
              <button
                className={`cmmt-filter-tab ${sortBy === 'likes' ? 'cmmt-filter-active' : ''}`}
                onClick={() => setSortBy('likes')}
              >
                Mais Curtidos
              </button>
            </div>
          </div>
        </div>

        <div className="cmmt-articles-list">
          {sortedArticles.map(article => (
            <article key={article.id} className="cmmt-article-card">
              <div className="cmmt-article-header-top">
                <span className="cmmt-article-type"><BookOpen size={16} /> Publicação Científica</span>
                {article.isFree ? (
                  <span className="cmmt-article-status-open">Open Access</span>
                ) : (
                  <span className="cmmt-article-status-closed">Paywall</span>
                )}
              </div>

              <h3 className="cmmt-article-title">{article.title}</h3>

              <div className="cmmt-article-meta">
                <span><Users size={16} /> {article.authors}</span>
              </div>

              <div className="cmmt-article-meta cmmt-article-source">
                <span><strong>{article.journal}</strong></span>
                <span><Calendar size={16} /> {article.date}</span>
                <span className="cmmt-meta-impact">FI: {article.impactFactor}</span>
              </div>

              <div className="cmmt-article-abstract">
                <strong>Resumo: </strong>{article.abstract}
              </div>

              <div className="cmmt-article-footer">
                <div className="cmmt-article-tags">
                  {article.tags.map(tag => (
                    <span key={tag} className="cmmt-article-tag-item">{tag}</span>
                  ))}
                </div>
                <div className="cmmt-article-actions">
                  <span className="cmmt-doi">DOI: {article.doi}</span>
                  <div className="cmmt-article-btn-group">
                    {article.isFree && (
                      <button className="cmmt-btn-secondary">
                        <Download size={16} /> PDF
                      </button>
                    )}
                    <button className="cmmt-btn-primary-read">
                      Ler Artigo <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
};

export default ArticlesTab;