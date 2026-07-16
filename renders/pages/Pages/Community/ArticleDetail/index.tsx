import { useToastStore } from '../../../../../src/stores/toastStore';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Bookmark,
  Quote,
  Calendar,
  Link as LinkIcon,
  Lock,
  Eye,
  CloudDownload
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import { articleService } from '../../../../../src/services/articleService';
import { bookmarkService } from '../../../../../src/services/bookmarkService';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import MarkdownRenderer from '../../../../../src/components/MarkdownRenderer';
import './styles.css';

const ArticleDetail: React.FC = () => {
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  // Capturando o ID pela rota para buscar os dados corretos
  const { id } = useParams();
  const { userProfile } = useAuth();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchArticle = async () => {
      if (!id) return;
      try {
        // Tenta buscar primeiro em artigos acadêmicos
        let docSnap = await getDoc(doc(db, "articles", id));

        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
          articleService.incrementViewCount(id, false);
        } else {
          // Se não encontrou, tenta buscar nos artigos de destaque da Home
          docSnap = await getDoc(doc(db, "articles_home", id));
          if (docSnap.exists()) {
            const data = docSnap.data();

            // Incrementa view no Firebase em background
            articleService.incrementViewCount(id, true);

            // Mock dos dados acadêmicos para artigos de blog da home (para não quebrar a UI)
            setArticle({
              id: docSnap.id,
              ...data,
              journal: data.journal || "Omni Editorial",
              authors: data.authors || "Redação Omni",
              institutions: data.institutions || "Plataforma Omni",
              date: data.date || "Recente",
              doi: data.doi || "10.0000/omni.blog.home",
              abstract: data.abstract || data.desc,
              tags: data.tags || [data.category, "Destaque"],
              stats: data.stats || { views: 1, downloads: 0, citations: 0 },
              content: data.content || `
## 1. O Paradigma da Descoberta vs. Comercialização

Existe uma visão altamente romantizada na cultura popular sobre a descoberta científica: um pesquisador observa um fenômeno inusitado em frasco de laboratório, grita "Eureka!", e quase que instantaneamente a descoberta chega às prateleiras e hospitais.
`,
              related: data.related || [],
              isRestricted: data.isRestricted !== undefined ? data.isRestricted : true
            });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar artigo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  useEffect(() => {
    if (userProfile?.id && id) {
      bookmarkService.checkIsBookmarked(userProfile.id, id).then(setIsSaved);
    }
  }, [userProfile, id]);

  const handleToggleBookmark = async () => {
    if (!userProfile) {
      addToast("Faça login para salvar artigos.", 'warning');
      return;
    }
    if (!article) return;

    try {
      const saved = await bookmarkService.toggleBookmark(userProfile.id, id!, 'article', article.title);
      setIsSaved(saved);
      if (saved) {
        addToast("Artigo salvo nas suas Coleções!", 'success');
      } else {
        addToast("Artigo removido das Coleções.", 'info');
      }
    } catch (err) {
      console.error("Erro ao salvar bookmark:", err);
      addToast("Erro ao salvar o artigo.", 'error');
    }
  };

  const handleDownload = async () => {
    if (!article) return;
    setIsDownloading(true);
    addToast("Gerando PDF, aguarde...", 'info');
    
    try {
      const element = document.getElementById('article-pdf-content');
      if (!element) throw new Error("Conteúdo não encontrado");

      const canvas = await html2canvas(element, {
        scale: 2, // Melhor resolução
        useCORS: true, // Para imagens externas
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Adiciona primeira página
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Adiciona páginas extras se a imagem for maior que a página
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${article.title.replace(/\s+/g, '_')}.pdf`);
      
      // Incrementa download nas estatísticas
      const isHome = article.tags?.includes("Destaque");
      articleService.incrementDownloadCount(article.id, isHome);
      setArticle({
        ...article,
        stats: { ...article.stats, downloads: article.stats.downloads + 1 }
      });
      addToast("Download concluído com sucesso!", 'success');
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      addToast("Erro ao gerar o PDF.", 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Artigo...</div>;
  if (!article) return <div style={{ padding: '40px', textAlign: 'center' }}>Artigo não encontrado.</div>;



  return (
    <div className="art-detail-container">

      <div className="art-detail-layout">

        {/* COLUNA PRINCIPAL: CONTEÚDO DO ARTIGO */}
        <main className="art-main-content" id="article-pdf-content">

          <header className="art-header">
            <div className="art-header-top">
              <button className="art-btn-back-icon" onClick={() => navigate('/community')}>
                <ArrowLeft size={20} />
              </button>
              <span className="art-journal-badge">• {article.journal}</span>
            </div>

            <h1 className="art-title">{article.title}</h1>

            <div className="art-header-divider"></div>

            <div className="art-authors-section">
              <div className="art-author-avatar">
                <img src={article.authorAvatar || 'https://github.com/shadcn.png'} alt="Autor" />
              </div>
              <div className="art-author-info-group">
                <span className="art-author-name"><strong>{article.authors}</strong></span>
                <span className="art-author-inst">{article.institutions}</span>
              </div>
              <span className="art-author-dot">•</span>
              <div className="art-author-date">
                <Calendar size={14} /> Publicado há 2 dias
              </div>
              <span className="art-author-dot">•</span>
            </div>
          </header>

          <article className="art-body">
            <section className="art-abstract-card">
              <span className="art-abstract-label">RESUMO ESTRUTURADO</span>
              <div style={{ marginTop: '10px' }}>
                <MarkdownRenderer content={article.abstract} />
              </div>
            </section>

            {article.content ? (
              <div className={`art-dynamic-content ${article.isRestricted ? 'restricted-content' : ''}`}>
                <MarkdownRenderer content={article.content} />

                {article.isRestricted && (
                  <div className="art-paywall-overlay">
                    <div className="art-paywall-card">
                      <Lock size={32} className="art-paywall-icon" />
                      <h3>Continue Lendo</h3>
                      <p>O acesso integral a este artigo de pesquisa é restrito. Assine a plataforma OMNI ou faça login na sua conta institucional.</p>
                      <button className="art-btn-paywall-primary">Desbloquear Acesso Completo</button>
                      <button className="art-btn-paywall-secondary">Já tenho uma conta</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>Conteúdo completo não disponível para este artigo.</div>
            )}

            <section className="art-section art-tags-section">
              <h3 style={{ margin: 0, paddingRight: '1rem' }}>Palavras-chave</h3>
              <div className="art-tags-list">
                {article.tags?.map((tag: string) => (
                  <span key={tag} className="art-tag">{tag}</span>
                ))}
              </div>
            </section>
          </article>
        </main>

        {/* BARRA LATERAL: AÇÕES E MÉTRICAS */}
        <aside className="art-sidebar">
          <div className="art-sticky-wrapper">

            <div className="art-doi-section">
              <LinkIcon size={14} /> DOI: <a href="#doi" className="art-doi-link">{article.doi}</a>
            </div>

            <div className="art-sidebar-section-title">FERRAMENTAS DO ARTIGO</div>
            {/* Card de Ações Principais */}
            <div className="art-widget art-actions-widget">
              <button 
                className="art-btn-primary art-btn-full" 
                onClick={handleDownload}
                disabled={isDownloading}
                style={{ opacity: isDownloading ? 0.7 : 1, cursor: isDownloading ? 'not-allowed' : 'pointer' }}
              >
                <Download size={18} />
                {isDownloading ? "Gerando..." : "Baixar PDF Completo"}
              </button>

              <div className="art-actions-row">
                <button className="art-btn-icon-text">
                  <Quote size={16} />
                  Citar
                </button>
                <button
                  className="art-btn-icon-text"
                  onClick={handleToggleBookmark}
                  style={isSaved ? { color: 'var(--primary)', fontWeight: 500 } : {}}
                >
                  <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? "Salvo" : "Salvar"}
                </button>
              </div>
            </div>

            <div className="art-sidebar-section-title">IMPACTO</div>
            <div className="art-widget art-stats-widget">
              <div className="art-stat-row">
                <span className="art-stat-label"><Eye size={16} /> Visualizações</span>
                <strong>{article.stats.views}</strong>
              </div>
              <div className="art-stat-row">
                <span className="art-stat-label"><CloudDownload size={16} /> Downloads</span>
                <strong>{article.stats.downloads}</strong>
              </div>
              <div className="art-stat-row">
                <span className="art-stat-label"><Quote size={16} /> Citações</span>
                <strong>{article.stats.citations}</strong>
              </div>
            </div>

            <div className="art-sidebar-section-title">RELACIONADOS</div>
            <div className="art-widget art-related-widget">
              {article.related?.length > 0 ? (
                <ul className="art-related-list">
                  {article.related.map((rel: any) => (
                    <li key={rel.id}>
                      <a href={`/article/${rel.id}`}>{rel.title}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="art-no-related">Nenhum artigo relacionado disponível no momento.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticleDetail;