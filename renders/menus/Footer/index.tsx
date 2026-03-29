import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer-wrapper">
      
      {/* SECTION 1: Promocional e Parceiros (Globalizada) */}
      {/* <div className="footer-promo-section">
        <h3 className="footer-promo-text">
          A Omni acredita que a pesquisa deve ser fluida e acessível, capacitando os cientistas a atingir resultados inovadores com maior eficiência.
        </h3>
        
        <div className="footer-partners-list">
          <span>Phyton Research</span>
          <span>Biogen</span>
          <span>Neurolab</span>
          <span>Genesis Labs</span>
          <span>Acqua Solutions</span>
        </div>

        <button className="footer-btn-outline" onClick={() => navigate('/community')}>
          Explorar pesquisas
        </button>
      </div> */}

      {/* SECTION 2: Links Rápidos e Informações */}
      <div className="footer-main">
        <div className="footer-content">
          
          <div className="footer-brand">
            <h2>Omni</h2>
            <p>Sua suíte completa de ferramentas para análise de dados, colaboração e gerenciamento de experimentos.</p>
            <div className="footer-socials">
              <a href="#github" aria-label="Github"><FaGithub size={18} /></a>
              <a href="#linkedin" aria-label="LinkedIn"><FaLinkedin size={18} /></a>
              <a href="#email" aria-label="Email"><Mail size={18} /></a>
            </div>
          </div>

          <div className="footer-links-group">
            <h4>Plataforma</h4>
            <button onClick={() => navigate('/')}>Início</button>
            <button onClick={() => navigate('/community')}>Comunidade</button>
            <button onClick={() => navigate('/lab')}>Lab Tools</button>
            <button onClick={() => navigate('/p-fuzzy')}>Análise P-Fuzzy</button>
          </div>

          <div className="footer-links-group">
            <h4>Pesquisa & Suporte</h4>
            <button onClick={() => navigate('/community')}>Artigos e Publicações</button>
            <button onClick={() => navigate('/community')}>Bolsas e Projetos</button>
            <button>Documentação API</button>
            <button>Contato de Suporte</button>
          </div>

        </div>
      </div>

      {/* SECTION 3: Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Omni - Plataforma Integrada de Pesquisa. Todos os direitos reservados.</p>
      </div>
      
    </footer>
  );
};

export default Footer;