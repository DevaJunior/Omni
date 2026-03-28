import React from 'react';
import { BookOpen, Calendar, Users, Download, ExternalLink } from 'lucide-react';
import './styles.css';

const ArticlesTab: React.FC = () => {
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
      isFree: true
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
      isFree: false
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
      isFree: true
    }
  ];

  return (
    <div className="cmmt-articles-list">
      {articlesList.map(article => (
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
  );
};

export default ArticlesTab;