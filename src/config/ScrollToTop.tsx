import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // EXCEÇÃO CRUCIAL: Se estivermos voltando para a Comunidade,
        // não forçamos o topo. Deixamos o próprio componente Community
        // gerenciar a restauração do scroll via sessionStorage.
        if (pathname === '/community') {
            return;
        }

        // Tenta rolar a janela principal imediatamente
        // 'instant' garante que não haja animação passando pelo conteúdo
        document.documentElement.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

        // CRUCIAL PARA DASHBOARDS/LAYOUTS:
        // Rola containers internos antes da pintura da tela
        const mainTag = document.querySelector('main');
        if (mainTag) {
            mainTag.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });
        }

        const contentWrapper = document.querySelector('.layout-content') || document.querySelector('.main-content');
        if (contentWrapper) {
            contentWrapper.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });
        }

    }, [pathname]);

    return null;
};

export default ScrollToTop;