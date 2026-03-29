import React, { useRef } from 'react';
import { ArrowRight, Beaker, Users, BookOpen, ChevronRight, ChevronLeft, Code2 } from 'lucide-react';
import './styles.css';
import { useNavigate } from 'react-router-dom';

import img1 from '../../../../src/assets/wallapapers/wpp_cience_000.png';
import img2 from '../../../../src/assets/wallapapers/wpp_cience_001.png';
import img3 from '../../../../src/assets/wallapapers/wpp_cience_002.png';
import img4 from '../../../../src/assets/wallapapers/wpp_cience_003.png';
import Footer from './../../../menus/Footer/index';

const Home: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const articles = [
    {
      id: 1,
      title: "Inovações em biotecnologia: da bancada ao mercado",
      desc: "Explorando as tendências mais promissoras em biotecnologia e como elas estão sendo traduzidas em práticas.",
      image: img1,
      category: "Biotecnologia",
    },
    {
      id: 2,
      title: "Medicina personalizada: Otimizando tratamentos",
      desc: "Saiba como a medicina personalizada está utilizando dados genéticos para criar tratamentos sob medida.",
      image: img2,
      category: "Medicina",
    },
    {
      id: 3,
      title: "Avanços em ciência de materiais: Criando o futuro",
      desc: "Uma visão geral dos últimos avanços em materiais inteligentes e como eles estão revolucionando a indústria.",
      image: img4,
      category: "Ciência",
    },
    {
      id: 4,
      title: "O papel da IA na descoberta de novas vacinas",
      desc: "Descubra como algoritmos estão acelerando a pesquisa e otimizando testes clínicos para imunizantes.",
      image: img3,
      category: "Tecnologia",
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (

    <>

      <div className="home-container">
        {/* SECTION: HERO */}
        <section className="hero">
          <div className="hero-content">
            <span className="badge">OMNI | PLATAFORMA INTEGRADA DE PESQUISA</span>
            <h1>Simplifique a pesquisa. <br /><span>Otimize a ciência.</span></h1>
            <p>
              A Omni é sua suíte completa de ferramentas para análise de dados,
              colaboração e gerenciamento de experimentos, construída para especialistas e pesquisadores.
            </p>
            <button className="cta-button" onClick={() => navigate('/p-fuzzy')}>
              COMEÇAR ANÁLISE <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-visual">
            <div className="gradient-sphere"></div>
          </div>
        </section>

        {/* SECTION: ÚLTIMOS ARTIGOS */}
        <section className="articles-section">
          <div className="articles-header">
            <div className="articles-title">
              <h2>Últimos <br />artigos</h2>
              <p>Bem-vindo à nossa seção de blog, onde o conhecimento encontra a inspiração. Explore artigos perspicazes, dicas de especialistas e as últimas tendências em nosso campo.</p>
              {/* Navegação adicionada aqui */}
              <button className="btn-secondary" onClick={() => navigate('/community')}>
                Ver todos
              </button>
            </div>
            <div className="slider-controls">
              <button className="control-btn" onClick={() => scroll('left')}>
                <ChevronLeft size={20} />
              </button>
              <button className="control-btn active" onClick={() => scroll('right')}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="articles-grid" ref={sliderRef}>
            {articles.map((art) => (
              <div key={art.id} className="article-card">
                <div className="article-image">
                  <img src={art.image} alt={art.title} />
                </div>
                <div className="article-info">
                  <h3>{art.title}</h3>
                  <p>{art.desc}</p>
                  <a href="#ler" className="read-more">Leia mais &rarr;</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: FERRAMENTAS E SERVIÇOS */}
        <section className="services-section">
          <div className="services-header">
            <h2>Ferramentas e Serviços da Omni</h2>
            <p>Descubra as funcionalidades que a Omni oferece para simplificar o seu trabalho no laboratório e na pesquisa.</p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><Code2 size={24} /></div>
              <h4>Análise p-fuzzy</h4>
              <p>Ferramentas avançadas para análise de dados laboratoriais de fitorremediação com lógica p-fuzzy, otimizando a interpretação dos resultados.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><Users size={24} /></div>
              <h4>Comunidade e Colaboração</h4>
              <p>Conecte-se com outros pesquisadores, compartilhe artigos, participe de discussões e colabore em projetos de forma fluida.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><Beaker size={24} /></div>
              <h4>Lab | Ferramentas Úteis</h4>
              <p>Uma suíte de ferramentas úteis para o laboratório, incluindo calculadoras científicas, geradores de gráficos e modelos de dados.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><BookOpen size={24} /></div>
              <h4>Biblioteca de Artigos</h4>
              <p>Acesso a uma biblioteca curada de artigos e pesquisas, facilitando o aprendizado contínuo e a atualização científica.</p>
            </div>
          </div>
        </section>

        {/* SECTION: FOOTER PROMO */}
        <section className="footer-promo">
          <h3>A Omni acredita que a pesquisa deve ser fluida e acessível, capacitando os cientistas a atingir resultados inovadores com maior eficiência.</h3>

          <div className="partners-list">
            <span>Phyton Research</span>
            <span>Biogen</span>
            <span>Neurolab</span>
            <span>Genesis Labs</span>
            <span>Acqua Solutions</span>
          </div>

          {/* Navegação adicionada aqui */}
          <button className="btn-outline" onClick={() => navigate('/community')}>
            Explorar pesquisas
          </button>
        </section>

      </div>

      <Footer />

    </>
  );
};

export default Home;