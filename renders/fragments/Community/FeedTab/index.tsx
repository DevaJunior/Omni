import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import './styles.css';
import ShareMenu from './../../../components/ShareMenu/index';

const FeedTab: React.FC = () => {
  const navigate = useNavigate();

  const posts = [
    {
      id: 1,
      author: "Dra. Helena Ribeiro",
      role: "Pesquisadora em Biorremediação",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      time: "Há 2 horas",
      content: "Acabamos de publicar nossos resultados preliminares sobre a aplicação de lógica P-Fuzzy na análise de dados de rizofiltração para remoção de metais pesados. Os índices de pertinência mostraram uma correlação altíssima com a biomassa radicular. Alguém mais trabalhando com modelagem fuzzy em fitorremediação?",
      tags: ["#Biotecnologia", "#LógicaPFuzzy", "#Rizofiltração"],
      likes: 34,
      comments: 12
    },
    {
      id: 2,
      author: "Laboratório Genesis",
      role: "Instituição Parceira",
      avatar: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=150",
      time: "Há 5 horas",
      content: "Estamos com duas bolsas abertas para iniciação científica na área de bioinformática e análise de dados genômicos. O projeto envolve o desenvolvimento de pipelines automatizados. Interessados, confiram o edital anexado.",
      tags: ["#Bolsas", "#Bioinformática", "#Genômica"],
      likes: 89,
      comments: 5
    },
    {
      id: 3,
      author: "Marcos Silva",
      role: "Doutorando em Microbiologia",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
      time: "Há 1 dia",
      content: "Dúvida técnica: Qual a melhor biblioteca em Python atualmente para plotar os gráficos de superfície de inferência fuzzy quando temos mais de 4 variáveis de entrada no nosso sistema laboratorial? Tenho usado o scikit-fuzzy, mas sinto falta de algumas customizações.",
      tags: ["#Python", "#Modelagem", "#Dúvida"],
      likes: 15,
      comments: 28
    }
  ];

  const handleOpenThread = (id: number) => {
    // Salva scroll antes de ir pro detalhe
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/discussion/${id}`);
  };

  return (
    <div className="cmmt-posts-list">
      {posts.map(post => (
        <article key={post.id} className="cmmt-post-card">
          <div className="cmmt-post-header">
            <img src={post.avatar} alt={post.author} className="cmmt-author-avatar" />
            <div className="cmmt-author-info">
              <h4>{post.author}</h4>
              <span>{post.role} • {post.time}</span>
            </div>
          </div>

          <div className="cmmt-post-body">
            <p>{post.content}</p>
            <div className="cmmt-post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="cmmt-post-tag-item">{tag}</span>
              ))}
            </div>
          </div>

          <div className="cmmt-post-actions">
            <button className="cmmt-action-btn">
              <Heart size={18} /> {post.likes}
            </button>
            <button className="cmmt-action-btn cmmt-comments-btn" onClick={() => handleOpenThread(post.id)} >
              <MessageSquare size={18} /> {post.comments} Comentários
            </button>
            {/* <button className="cmmt-action-btn cmmt-share">
              <Share2 size={18} /> Compartilhar
            </button> */}
            <div className="cmmt-share">
              <ShareMenu
                image={post.avatar}
                url={`${window.location.origin}/discussion/${post.id}`}
                text={`Confira a publicação de ${post.author} na Omni!`}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FeedTab;