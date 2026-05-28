import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Bookmark,
  Quote,
  Users,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import { articleService } from '../../../../../src/services/articleService';
import { bookmarkService } from '../../../../../src/services/bookmarkService';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import './styles.css';

const ArticleDetail: React.FC = () => {
  const navigate = useNavigate();
  // Capturando o ID pela rota para buscar os dados corretos
  const { id } = useParams();
  const { userProfile } = useAuth();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

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
              content: data.content || null,
              related: data.related || []
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
      alert("Faça login para salvar artigos.");
      return;
    }
    if (!article) return;

    try {
      const saved = await bookmarkService.toggleBookmark(userProfile.id, id!, 'article', article.title);
      setIsSaved(saved);
    } catch (err) {
      console.error("Erro ao salvar bookmark:", err);
    }
  };

  const handleDownload = () => {
    // Incrementa download
    if (article) {
      // Como não gravamos o tipo no state, tentamos os dois por enquanto, ou melhor:
      // Se tiver 'Destaque' nas tags, é da home.
      const isHome = article.tags?.includes("Destaque");
      articleService.incrementDownloadCount(article.id, isHome);
      setArticle({
        ...article,
        stats: { ...article.stats, downloads: article.stats.downloads + 1 }
      });
      alert("Iniciando download simulado...");
    }
  };

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
                {article.tags?.map((tag: any) => (
                  <span key={tag} className="art-tag">{tag}</span>
                ))}
              </div>
            </section>

            {article.content ? (
              <div className="art-dynamic-content" dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>Conteúdo completo não disponível para este artigo.</div>
            )}
          </article>
        </main>

        {/* BARRA LATERAL: AÇÕES E MÉTRICAS */}
        <aside className="art-sidebar">
          <div className="art-sticky-wrapper">

            {/* Card de Ações Principais */}
            <div className="art-widget art-actions-widget">
              <button className="art-btn-primary art-btn-full" onClick={handleDownload}>
                <Download size={18} />
                Baixar PDF Completo
              </button>

              <div className="art-secondary-actions">
                <button 
                  className="art-btn-icon-text" 
                  onClick={handleToggleBookmark} 
                  style={isSaved ? { color: 'var(--primary)', fontWeight: 500 } : {}}
                >
                  <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? "Salvo" : "Salvar"}
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
                {article.related && article.related.length > 0 ? (
                  article.related.map((rel: any) => (
                    <li key={rel.id}>
                      <a href={`/article/${rel.id}`}>{rel.title}</a>
                      <span>{rel.journal} • {rel.year}</span>
                    </li>
                  ))
                ) : (
                  <li><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhum artigo relacionado disponível.</span></li>
                )}
              </ul>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default ArticleDetail;