import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react';
import './styles.css';
import Footer from '../../../../menus/Footer';

// Mock estendido com o conteúdo completo
const NOTE_DATA = {
  id: '1',
  title: 'Mapa Mental: Ciclo de Krebs e Fosforilação Oxidativa',
  subject: 'Bioquímica',
  author: 'Maria Clara S.',
  date: '02 Abr, 2026',
  readTime: '5 min',
  likes: 124,
  content: `
O Ciclo de Krebs (ou Ciclo do Ácido Cítrico) é uma das etapas mais cruciais da respiração celular aeróbica, ocorrendo na matriz mitocondrial.

### Principais Etapas do Ciclo
1. **Formação do Citrato:** O Acetil-CoA (2 carbonos) une-se ao Oxaloacetato (4 carbonos).
2. **Descarboxilação:** Perda de CO2 e geração de NADH nas conversões de Isocitrato para Alfa-cetoglutarato, e deste para Succinil-CoA.
3. **Geração de Energia:** Formação de 1 GTP (convertido em ATP) na passagem de Succinil-CoA para Succinato.
4. **Regeneração:** O Succinato é oxidado a Fumarato (gerando FADH2), depois a Malato e finalmente de volta a Oxaloacetato (gerando mais um NADH).

### Saldo por Molécula de Glicose (2 Acetil-CoA)
* 6 NADH
* 2 FADH2
* 2 ATP (via GTP)
* 4 CO2 (liberados)

Após o ciclo, os carreadores de elétrons (NADH e FADH2) seguem para a **Fosforilação Oxidativa** nas cristas mitocondriais, onde a maior parte do ATP será sintetizada via enzima ATP Sintase, impulsionada pelo gradiente de prótons (H+).
  `
};

const NoteDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(NOTE_DATA.likes);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <>
      <div className="note-detail-wrapper">
        <div className="note-detail-container">

          <button className="btn-back-learn" onClick={() => navigate('/learn')}>
            <ArrowLeft size={18} /> Voltar para Central de Estudos
          </button>

          <article className="note-article">
            <header className="note-article-header">
              <span className="note-tag">{NOTE_DATA.subject}</span>
              <h1>{NOTE_DATA.title}</h1>

              <div className="note-author-bar">
                <div className="author-info-left">
                  <div className="author-avatar"><User size={20} /></div>
                  <div>
                    <strong>{NOTE_DATA.author}</strong>
                    <div className="note-meta">
                      <span>{NOTE_DATA.date}</span>
                      <span className="dot">•</span>
                      <span><Clock size={14} /> {NOTE_DATA.readTime} de leitura</span>
                    </div>
                  </div>
                </div>
                <div className="author-actions">
                  <button className="btn-follow">Seguir</button>
                </div>
              </div>
            </header>

            <div className="note-content-body">
              {/* Simulação de renderização de Markdown/Texto Rico */}
              {NOTE_DATA.content.split('\n').map((paragraph, idx) => {
                if (paragraph.startsWith('###')) {
                  return <h3 key={idx}>{paragraph.replace('###', '')}</h3>;
                }
                if (paragraph.startsWith('*')) {
                  return <li key={idx} className="note-list-item">{paragraph.replace('*', '')}</li>;
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>

            <footer className="note-article-footer">
              <div className="interaction-bar">
                <div className="interaction-left">
                  <button className={`btn-interact ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                    <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} />
                    <span>{likesCount}</span>
                  </button>
                  <button className="btn-interact">
                    <MessageSquare size={20} />
                    <span>12</span>
                  </button>
                </div>
                <div className="interaction-right">
                  <button className="btn-interact-icon" title="Salvar"><Bookmark size={20} /></button>
                  <button className="btn-interact-icon" title="Compartilhar"><Share2 size={20} /></button>
                </div>
              </div>
            </footer>
          </article>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default NoteDetail;