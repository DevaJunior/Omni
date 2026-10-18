import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Beaker, Users, BookOpen, ChevronRight, ChevronLeft, Code2, Search } from 'lucide-react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import { articleService, type Article } from '../../../../src/services/articleService';
import { communityService } from '../../../../src/services/communityService';
import type { LabPartner } from '../../../../src/types/community';

import Footer from './../../../menus/Footer/index';
import Skeleton from '../../../components/Skeleton';
import CardResearch from '../../../components/Cards/CardResearch';

const Home: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [randomLabs, setRandomLabs] = useState<LabPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchArticlesAndLabs = async () => {
      try {
        const [data, labsData] = await Promise.all([
          articleService.getLatestArticles(10),
          communityService.getLabs()
        ]);

        if (data.length > 0) {
          setArticles(data);
        } else {
          console.warn("Banco de dados vazio. Artigos não encontrados.");
        }

        const shuffled = labsData.sort(() => 0.5 - Math.random());
        setRandomLabs(shuffled.slice(0, 5));
        setHasError(false);
      } catch (err) {
        console.error("Erro ao carregar dados da Home:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticlesAndLabs();
  }, []);


  const partnersContent = (
    <>
      {randomLabs.length > 0 ? (
        randomLabs.map(lab => (
          <span
            key={lab.id}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/lab/${lab.id}`)}
          >
            {lab.name}
          </span>
        ))
      ) : (
        <>
          <span style={{ cursor: 'default' }}>Phyton Research</span>
          <span style={{ cursor: 'default' }}>Biogen</span>
          <span style={{ cursor: 'default' }}>Neurolab</span>
          <span style={{ cursor: 'default' }}>Genesis Labs</span>
          <span style={{ cursor: 'default' }}>Acqua Solutions</span>
        </>
      )}
    </>
  );

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, [articles, isLoading]);

  return (
    <>
      <div className={`home-container ${isExiting ? 'home-fade-out' : ''}`}>

        {/* SECTION: HERO */}
        <section className="hero">
          <div className="hero-content">
            <span className="badge">OMNI | PLATAFORMA INTEGRADA DE PESQUISA</span>
            <h1>Simplifique a pesquisa. <br /><span>Otimize a ciência.</span></h1>

            {/* MOBILE SEARCH BAR */}
            <div className="home-mobile-search">
              <form
                className="mobile-search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    setIsExiting(true);
                    searchTimeoutRef.current = setTimeout(() => {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    }, 300);
                  }
                }}
              >
                <Search size={20} className="mobile-search-icon" />
                <input
                  type="text"
                  placeholder="Pesquise por artigos, projetos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <p>
              A Omni é sua suíte completa de ferramentas para análise de dados,
              colaboração e gerenciamento de experimentos, construída para estudiosos e pesquisadores.
            </p>
            <button className="cta-button" onClick={() => navigate('/lab/pfuzzy-rizofiltracao')}>
              COMEÇAR ANÁLISE <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-visual">
            <div className="gradient-sphere"></div>
          </div>
        </section>

        <div className="partners-list partners-mobile-only">
          {partnersContent}
        </div>

        {/* SECTION: ÚLTIMOS ARTIGOS */}
        <section className="articles-section">
          <div className="articles-header">
            <div className="articles-title">
              <h2>Últimas <br className="mobile-hidden-br" />pesquisas</h2>
              <p>Bem-vindo à nossa seção de blog, onde o conhecimento encontra a inspiração. Explore artigos perspicazes, dicas de especialistas e as últimas tendências em nosso campo.</p>
              <button className="btn-secondary articles-btn-desktop" onClick={() => navigate('/community')}>
                Ver mais
              </button>
            </div>
            <div className="slider-controls">
              <button 
                className={`control-btn ${canScrollLeft ? 'active' : ''}`} 
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className={`control-btn ${canScrollRight ? 'active' : ''}`} 
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="articles-grid" ref={sliderRef}>
            {isLoading ? (
              <div style={{ display: 'flex', gap: '2rem', padding: '1rem', width: '100%', overflow: 'hidden' }}>
                <Skeleton type="card" width="300px" height="400px" />
                <Skeleton type="card" width="300px" height="400px" />
                <Skeleton type="card" width="300px" height="400px" />
              </div>
            ) : hasError ? (
              <div className="home-error-state" style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Não foi possível carregar as pesquisas.</p>
                <button className="btn-outline" onClick={() => window.location.reload()}>Tentar novamente</button>
              </div>
            ) : articles.length === 0 ? (
              <div className="home-empty-state" style={{ padding: '2rem', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>
                <p>Nenhum artigo publicado no momento.</p>
              </div>
            ) : (
              articles.map((art) => (
                <CardResearch
                  key={art.id}
                  article={{
                    id: art.id,
                    image: art.image || '/assets/wallpapers/wpp_cience_000.png',
                    category: art.category || 'Artigo',
                    title: art.title,
                    desc: art.desc || 'Sem descrição.'
                  }}
                  onReadMore={(id) => navigate(`/article/${id}`)}
                  style={{ minWidth: '320px', maxWidth: '320px' }}
                  maxLines={3}
                />
              ))
            )}
          </div>

          <button className="btn-secondary articles-btn-mobile" onClick={() => navigate('/community')}>
            Ver todos
          </button>
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

          <div className="partners-list partners-desktop-only">
            {partnersContent}
          </div>

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