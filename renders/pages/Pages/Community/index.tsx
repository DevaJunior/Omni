import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Users
} from 'lucide-react';
import './styles.css';

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'projects'>('feed');

  // Dados mockados focados no escopo da plataforma Omni
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

  const trendingTopics = [
    "Análise de Dados Complexos",
    "Desenvolvimento de Vacinas",
    "Inteligência Artificial na Saúde",
    "Biorreatores Industriais",
    "Controle de Qualidade"
  ];

  return (
    <div className="community-container">
      <header className="community-header">
        <div className="header-content">
          <h1>Comunidade Científica</h1>
          <p>Conecte-se, colabore e compartilhe descobertas com pesquisadores de todo o mundo.</p>
        </div>
        <button className="btn-primary create-post-btn">
          <PlusCircle size={20} />
          Nova Publicação
        </button>
      </header>

      <div className="community-toolbar">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Pesquisar publicações, projetos ou pesquisadores..." />
        </div>
        <button className="btn-outline-icon">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      <div className="community-layout">
        <main className="feed-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              Feed de Discussões
            </button>
            <button
              className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projetos e Oportunidades
            </button>
          </div>

          <div className="posts-list">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <img src={post.avatar} alt={post.author} className="author-avatar" />
                  <div className="author-info">
                    <h4>{post.author}</h4>
                    <span>{post.role} • {post.time}</span>
                  </div>
                </div>

                <div className="post-body">
                  <p>{post.content}</p>
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="post-actions">
                  <button className="action-btn">
                    <Heart size={18} /> {post.likes}
                  </button>
                  <button className="action-btn">
                    <MessageSquare size={18} /> {post.comments} Comentários
                  </button>
                  <button className="action-btn share">
                    <Share2 size={18} /> Compartilhar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="sidebar">
          <div className="sidebar-widget">
            <div className="widget-header">
              <TrendingUp size={20} className="widget-icon" />
              <h3>Tópicos em Alta</h3>
            </div>
            <ul className="trending-list">
              {trendingTopics.map((topic, index) => (
                <li key={index}><a href={`#${topic}`}>{topic}</a></li>
              ))}
            </ul>
          </div>

          <div className="sidebar-widget">
            <div className="widget-header">
              <Users size={20} className="widget-icon" />
              <h3>Pesquisadores Sugeridos</h3>
            </div>
            <div className="suggested-users">
              <div className="user-item">
                <div className="user-avatar-placeholder">AC</div>
                <div className="user-details">
                  <h5>Ana Costa</h5>
                  <span>Bioquímica</span>
                </div>
                <button className="btn-follow">Seguir</button>
              </div>
              <div className="user-item">
                <div className="user-avatar-placeholder">RM</div>
                <div className="user-details">
                  <h5>Rafael Mendes</h5>
                  <span>Química Analítica</span>
                </div>
                <button className="btn-follow">Seguir</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Community;