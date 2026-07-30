// public/modulos/modulo_menu_direito.js

/**
 * Injeta os estilos CSS do Painel Direito (Amarelo)
 */
function aplicarEstilosDireito() {
    if (document.getElementById('estilo-menu-direito')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-direito';
    style.innerHTML = `
        /* 🟡 RETÂNGULO AMARELO (Painel Direito) */
        .side-panel-right {
            border: 2px solid #ffd700;
            background-color: #121212;
            padding: 10px;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Renderiza a estrutura HTML do painel direito
 */
function renderizarHTMLDireito() {
    const container = document.getElementById('painel-direito');
    if (container) {
        container.className = 'side-panel-right';
        container.innerHTML = `
            <!-- Reservado para Mochila / Inventário / Outros recursos futuros -->
        `;
    }
}

/**
 * Inicializa o Módulo do Painel Direito
 */
export function inicializarMenuDireito() {
    aplicarEstilosDireito();
    renderizarHTMLDireito();
}