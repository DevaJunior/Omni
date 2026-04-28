import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { Network, ArrowRight } from 'lucide-react';
import './styles.css';

// Usando o wallpaper de ciência para a divisão visual
import coverImg from '../../../../src/assets/wallapapers/wpp_cience_002.png';

const Login: React.FC = () => {
  // Extraímos também o currentUser e o loading do contexto
  const { loginWithGoogle, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorText, setErrorText] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Lê a intenção original de rota para devolvê-lo, ou fallback para a Home
  const from = location.state?.from?.pathname || '/';

  // Este useEffect resolve o bug do Mobile. 
  // Quando o usuário volta do signInWithRedirect, a página recarrega.
  // O contexto recupera o usuário e atualiza o estado. Esse efeito percebe e redireciona.
  useEffect(() => {
    if (currentUser && !loading) {
      navigate(from, { replace: true });
    }
  }, [currentUser, loading, navigate, from]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setErrorText('');
    try {
      await loginWithGoogle();
      // No Desktop (signInWithPopup), o código aguarda e chega aqui normalmente.
      // No Mobile (signInWithRedirect), a página é redirecionada antes desta linha executar.
    } catch (err: any) {
      console.error(err);
      setErrorText("Não foi possível autenticar. Janela foi fechada ou erro de conexão.");
      setIsAuthenticating(false);
    }
  };

  // Previne que a tela de login pisque ou exiba os botões se estiver processando o redirect do mobile
  if (loading || (currentUser && isAuthenticating)) {
    return (
      <div className="login-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Network size={48} color="var(--primary)" className="animate-pulse" />
          <p style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Autenticando laboratório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* Painel Esquerdo: Formulário */}
        <div className="login-panel-form">
          <div className="login-form-content">
            <div className="login-brand">
              <div className="login-logo">
                <Network size={32} color="var(--primary)" />
              </div>
              <h1>Bem-vindo ao Omni</h1>
              <p>Autentique-se para acessar os módulos de Laboratório e Ecossistema Científico.</p>
            </div>

            <div className="login-actions">
              <button
                className="btn-google-login"
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="Google Logo"
                  className="google-icon"
                />
                {isAuthenticating ? 'Conectando...' : 'Acessar com Google'}
              </button>

              {errorText && (
                <div className="login-error-message">
                  {errorText}
                </div>
              )}
            </div>

            <div className="login-footer">
              <p>
                Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade de Dados Laboratoriais.
              </p>
              <button className="btn-login-back" onClick={() => navigate('/')}>
                <span>Voltar à Página Inicial</span> <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Painel Direito: Imagem e Visuais */}
        <div className="login-panel-image">
          <img src={coverImg} alt="Cience Illustration" className="cover-img" />
          <div className="login-overlay-text">
            <h2>Ciência Aberta, Conectada.</h2>
            <p>Seu laboratório em rede, publicações dinâmicas e o melhor da pesquisa global em um clique.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;