/**
 * Utilitários para tratamento seguro e normalização de imagens na aplicação OMNI.
 * Garante compatibilidade entre desenvolvimento (Vite) e produção (dist), além de
 * fornecer fallbacks elegantes para imagens inexistentes ou com erro de carregamento.
 */

export const DEFAULT_IMAGES = {
  research: '/assets/wallpapers/wpp_cience_000.png',
  researchFallback: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
  labLogo: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=200',
  avatar: (name: string = 'User') => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
  cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80'
};

/**
 * Normaliza caminhos de imagem.
 * Se o caminho contiver referências a /src/assets/wallapapers/, converte para /assets/wallpapers/
 * garantindo compatibilidade universal.
 */
export function normalizeImageUrl(url?: string | null, fallback: string = DEFAULT_IMAGES.research): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  const cleanUrl = url.trim();

  // Corrige caminhos legados que apontam diretamente para a pasta interna de código-fonte
  if (cleanUrl.startsWith('/src/assets/wallapapers/')) {
    return cleanUrl.replace('/src/assets/wallapapers/', '/assets/wallpapers/');
  }

  if (cleanUrl.startsWith('/src/assets/wallpapers/')) {
    return cleanUrl.replace('/src/assets/wallpapers/', '/assets/wallpapers/');
  }

  return cleanUrl;
}

/**
 * Handler de erro para elementos <img> que previne loops de erro infinitos
 * e aplica o fallback de forma graciosa.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DEFAULT_IMAGES.researchFallback
) {
  const target = event.currentTarget;
  if (!target) return;

  // Evita loop se o próprio fallback falhar
  if (target.src === fallback || target.getAttribute('data-failed') === 'true') {
    return;
  }

  target.setAttribute('data-failed', 'true');
  target.src = fallback;
}
