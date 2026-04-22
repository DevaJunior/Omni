import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Bookmark,
  Quote,
  FileText,
  Users,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import './styles.css';

const ArticleDetail: React.FC = () => {
  const navigate = useNavigate();
  // Capturando o ID pela rota para buscar os dados corretos
  const { id } = useParams();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchArticle = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "articles", id));
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Erro ao carregar artigo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Artigo...</div>;
  if (!article) return <div style={{ padding: '40px', textAlign: 'center' }}>Artigo não encontrado.</div>;



  return (
    <div className="art-detail-container">

      {/* Botão de Voltar */}
      <button className="art-btn-back" onClick={() => navigate('/community')}>
        <ArrowLeft size={20} />
        Voltar para Comunidade
      </button>

      <div className="art-detail-layout">

        {/* COLUNA PRINCIPAL: CONTEÚDO DO ARTIGO */}
        <main className="art-main-content">

          <header className="art-header">
            <span className="art-journal-badge">{article.journal}</span>
            <h1 className="art-title">{article.title}</h1>

            <div className="art-authors-section">
              <div className="art-author-info">
                <Users size={18} className="art-icon" />
                <span><strong>Autores:</strong> {article.authors}</span>
              </div>
              <p className="art-institutions">{article.institutions}</p>
            </div>

            <div className="art-meta-bar">
              <span><Calendar size={16} /> Publicado em: {article.date}</span>
              <span><LinkIcon size={16} /> DOI: <a href="#doi" className="art-doi-link">{article.doi}</a></span>
            </div>
          </header>

          <hr className="art-divider" />

          <article className="art-body">
            <section className="art-section">
              <h2>Resumo</h2>
              <p>{article.abstract}</p>
            </section>

            <section className="art-section">
              <h2>Palavras-chave</h2>
              <div className="art-tags-list">
                {article.tags.map((tag: any) => (
                  <span key={tag} className="art-tag">{tag}</span>
                ))}
              </div>
            </section>

            <section className="art-section">
              <h2>1. Introdução</h2>
              <p>
                A contaminação de corpos hídricos por metais pesados representa um dos maiores desafios ambientais contemporâneos. A rizofiltração, técnica biotecnológica que utiliza sistemas radiculares de plantas para absorver, concentrar e precipitar metais tóxicos de efluentes, tem se mostrado uma alternativa sustentável e de baixo custo.
              </p>
              <p>
                No entanto, a predição da eficiência deste processo enfrenta dificuldades inerentes à complexidade dos sistemas biológicos, onde variáveis como pH, temperatura e biomassa interagem de forma não-linear. Diante deste cenário, a aplicação da Lógica P-Fuzzy (Fuzzy Probabilística) surge como uma ferramenta promissora para modelar tais incertezas com maior acurácia.
              </p>
            </section>

            <section className="art-section">
              <h2>2. Materiais e Métodos</h2>
              <p>
                Para a modelagem, os dados de entrada consistiram em concentrações iniciais de Cádmio (Cd) e Chumbo (Pb), tempo de exposição e desenvolvimento da biomassa radicular. Foi desenvolvido um algoritmo em Python integrado à plataforma Omni para o processamento das regras de inferência fuzzy.
              </p>
              {/* Espaço reservado para visualização de gráficos do laboratório */}
              <div className="art-image-placeholder">
                <FileText size={48} color="#a5a6f6" />
                <span>Figura 1: Superfície de Inferência P-Fuzzy gerada pelo sistema.</span>
              </div>
            </section>

            <section className="art-section">
              <h2>3. Resultados</h2>
              <p>
                O modelo P-Fuzzy alcançou um coeficiente de correlação (R²) de 0.94 na predição da taxa de remoção de metais, superando o modelo linear clássico (R² = 0.78). A integração dos dados diretamente através da plataforma laboratorial agilizou o processamento em 40%.
              </p>
            </section>
          </article>
        </main>

        {/* BARRA LATERAL: AÇÕES E MÉTRICAS */}
        <aside className="art-sidebar">
          <div className="art-sticky-wrapper">

            {/* Card de Ações Principais */}
            <div className="art-widget art-actions-widget">
              <button className="art-btn-primary art-btn-full">
                <Download size={18} />
                Baixar PDF Completo
              </button>

              <div className="art-secondary-actions">
                <button className="art-btn-icon-text">
                  <Bookmark size={18} />
                  Salvar
                </button>
                <button className="art-btn-icon-text">
                  <Quote size={18} />
                  Citar
                </button>
                <button className="art-btn-icon-text">
                  <Share2 size={18} />
                  Compartilhar
                </button>
              </div>
            </div>

            {/* Card de Métricas */}
            <div className="art-widget art-stats-widget">
              <h3>Métricas do Artigo</h3>
              <div className="art-stat-row">
                <span>Visualizações</span>
                <strong>{article.stats.views}</strong>
              </div>
              <div className="art-stat-row">
                <span>Downloads</span>
                <strong>{article.stats.downloads}</strong>
              </div>
              <div className="art-stat-row">
                <span>Citações</span>
                <strong>{article.stats.citations}</strong>
              </div>
            </div>

            {/* Card de Artigos Relacionados */}
            <div className="art-widget art-related-widget">
              <h3>Artigos Relacionados</h3>
              <ul className="art-related-list">
                <li>
                  <a href="#art1">Fitorremediação de Cádmio utilizando macrófitas aquáticas em biorreatores.</a>
                  <span>Journal of Botany • 2024</span>
                </li>
                <li>
                  <a href="#art2">Comparativo entre Lógica Fuzzy e Redes Neurais na predição de qualidade da água.</a>
                  <span>Water Research • 2025</span>
                </li>
              </ul>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default ArticleDetail;