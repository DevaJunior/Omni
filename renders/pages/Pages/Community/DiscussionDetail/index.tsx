import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Send,
  UserPlus
} from 'lucide-react';
import './styles.css';

const DiscussionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [replyText, setReplyText] = useState('');

  // Banco de dados mockado simulando a thread completa
  const discussionsDatabase = [
    {
      id: "1",
      author: "Dra. Helena Ribeiro",
      role: "Pesquisadora em Biorremediação",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      time: "Há 2 horas",
      content: "Acabamos de publicar nossos resultados preliminares sobre a aplicação de lógica P-Fuzzy na análise de dados de rizofiltração para remoção de metais pesados. Os índices de pertinência mostraram uma correlação altíssima com a biomassa radicular. Alguém mais trabalhando com modelagem fuzzy em fitorremediação? Gostaria de trocar experiências sobre a definição das regras de inferência para cenários com alta variação de pH.",
      tags: ["#Biotecnologia", "#LógicaPFuzzy", "#Rizofiltração"],
      likes: 34,
      commentsCount: 3,
      // Respostas (Thread)
      replies: [
        {
          id: "r1",
          author: "Carlos Eduardo",
          role: "Mestrando em Engenharia Ambiental",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          time: "Há 1 hora",
          content: "Dra. Helena, trabalho excelente! No nosso laboratório tentamos aplicar lógica fuzzy clássica (Mamdani), mas tivemos problemas com a explosão de regras devido à inclusão da temperatura da água. Como vocês lidaram com as variáveis de entrada múltiplas no modelo P-Fuzzy?",
          likes: 5
        },
        {
          id: "r2",
          author: "Dra. Helena Ribeiro",
          role: "Pesquisadora em Biorremediação",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          time: "Há 45 minutos",
          content: "Carlos, exatamente por isso migramos para o P-Fuzzy! Ao atribuir probabilidades às regras em vez de tratá-las como absolutas, conseguimos reduzir o conjunto de regras em quase 60%, mantendo a acurácia. Vou te enviar o link do repositório no GitHub por mensagem direta.",
          likes: 8,
          isAuthor: true // Tag para destacar que é o autor do tópico respondendo
        },
        {
          id: "r3",
          author: "Instituto Genesis",
          role: "Conta Institucional",
          avatar: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=150",
          time: "Há 10 minutos",
          content: "Resultados muito promissores. Nosso departamento de P&D tem interesse em conhecer mais sobre essa modelagem para aplicação em escala piloto.",
          likes: 2
        }
      ]
    }
  ];

  // Fallback para o primeiro item se o ID não for encontrado
  const discussion = discussionsDatabase.find(d => d.id === id) || discussionsDatabase[0];

  return (
    <div className="disc-detail-container">
      
      {/* Botão de Voltar */}
      <button className="disc-btn-back" onClick={() => navigate('/community')}>
        <ArrowLeft size={20} />
        Voltar para Discussões
      </button>

      <div className="disc-detail-layout">
        
        {/* COLUNA PRINCIPAL: THREAD DE DISCUSSÃO */}
        <main className="disc-main-content">
          
          {/* Post Original */}
          <article className="disc-original-post">
            <div className="disc-post-header">
              <img src={discussion.avatar} alt={discussion.author} className="disc-author-avatar" />
              <div className="disc-author-info">
                <h4>{discussion.author}</h4>
                <span>{discussion.role} • {discussion.time}</span>
              </div>
              <button className="disc-btn-more"><MoreHorizontal size={20} /></button>
            </div>

            <div className="disc-post-body">
              <p>{discussion.content}</p>
              <div className="disc-post-tags">
                {discussion.tags.map(tag => (
                  <span key={tag} className="disc-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="disc-post-actions">
              <button className="disc-action-btn">
                <Heart size={18} /> {discussion.likes} Curtidas
              </button>
              <button className="disc-action-btn active-state">
                <MessageSquare size={18} /> {discussion.commentsCount} Comentários
              </button>
              <button className="disc-action-btn disc-share">
                <Share2 size={18} /> Compartilhar
              </button>
            </div>
          </article>

          {/* Área de Resposta */}
          <div className="disc-reply-box">
            <div className="disc-reply-avatar-placeholder">Você</div>
            <div className="disc-reply-input-wrapper">
              <textarea 
                placeholder="Adicione à discussão com seus conhecimentos..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <div className="disc-reply-footer">
                <span className="disc-reply-hint">Seja respeitoso e científico.</span>
                <button 
                  className="disc-btn-send"
                  disabled={replyText.trim().length === 0}
                >
                  Responder <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          <hr className="disc-divider" />

          {/* Árvore de Comentários */}
          <div className="disc-comments-section">
            <h3 className="disc-comments-title">Respostas ({discussion.replies.length})</h3>
            
            <div className="disc-comments-list">
              {discussion.replies.map(reply => (
                <div key={reply.id} className={`disc-comment-item ${reply.isAuthor ? 'author-highlight' : ''}`}>
                  <img src={reply.avatar} alt={reply.author} className="disc-comment-avatar" />
                  <div className="disc-comment-content">
                    <div className="disc-comment-header">
                      <div className="disc-comment-author-info">
                        <h4>{reply.author} {reply.isAuthor && <span className="disc-author-badge">Autor</span>}</h4>
                        <span>{reply.role} • {reply.time}</span>
                      </div>
                    </div>
                    <p className="disc-comment-text">{reply.content}</p>
                    <div className="disc-comment-actions">
                      <button className="disc-action-btn-small">
                        <Heart size={14} /> {reply.likes}
                      </button>
                      <button className="disc-action-btn-small">Responder</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* BARRA LATERAL: AUTOR E TRENDS */}
        <aside className="disc-sidebar">
          <div className="disc-sticky-wrapper">
            
            {/* Sobre o Autor */}
            <div className="disc-widget disc-author-widget">
              <div className="disc-author-cover"></div>
              <img src={discussion.avatar} alt={discussion.author} className="disc-author-profile-pic" />
              <div className="disc-author-widget-info">
                <h3>{discussion.author}</h3>
                <p>{discussion.role}</p>
                <div className="disc-author-stats">
                  <div><strong>45</strong><span>Publicações</span></div>
                  <div><strong>1.2k</strong><span>Seguidores</span></div>
                </div>
                <button className="disc-btn-follow-full">
                  <UserPlus size={18} /> Seguir Pesquisador
                </button>
              </div>
            </div>

            {/* Tópicos Relacionados */}
            <div className="disc-widget">
              <h3>Tópicos Relacionados</h3>
              <div className="disc-related-tags">
                <span className="disc-tag-outline">Python para Ciência</span>
                <span className="disc-tag-outline">Matemática Aplicada</span>
                <span className="disc-tag-outline">Tratamento de Água</span>
                <span className="disc-tag-outline">Biomassa</span>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default DiscussionDetail;