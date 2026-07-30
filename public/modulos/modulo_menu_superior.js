// public/modulos/modulo_menu_superior.js

/**
 * Alterna a exibição do painel de Status (retângulo vermelho)
 */
export function toggleStatus() {
    const painelStatus = document.getElementById('painel-status');
    if (painelStatus) {
        if (painelStatus.style.display === 'none') {
            painelStatus.style.display = 'block';
        } else {
            painelStatus.style.display = 'none';
        }
    }
}

/**
 * Realiza o logout do usuário
 */
export function sair() {
    localStorage.removeItem('heroi');
    window.location.href = 'index.html';
}

/**
 * Injeta dinamicamente os estilos CSS do Menu Superior (Retângulo Azul)
 */
function aplicarEstilosMenu() {
    if (document.getElementById('estilo-menu-superior')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-superior';
    style.innerHTML = `
        /* 🔵 RETÂNGULO AZUL (Menu Superior) */
        .top-bar {
            border: 2px solid #00a2ff;
            background-color: #121212;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 6px;
        }

        .btn-menu {
            background-color: #1e1e1e;
            color: #00ff88;
            border: 1px solid #00ff88;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.2s;
        }

        .btn-menu:hover {
            background-color: #00ff88;
            color: #121212;
        }

        .btn-sair {
            border-color: #f44336;
            color: #f44336;
        }

        .btn-sair:hover {
            background-color: #f44336;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Renderiza a estrutura HTML do menu superior dentro do elemento <header id="header-menu"></header>
 */
function renderizarHTMLMenu() {
    const container = document.getElementById('header-menu');
    if (container) {
        container.className = 'top-bar';
        container.innerHTML = `
            <button id="btn-status" class="btn-menu">Status</button>
            <button id="btn-sair" class="btn-menu btn-sair">Sair</button>
        `;
    }
}

/**
 * Inicializa todo o Módulo do Menu Superior (CSS + HTML + Eventos)
 */
export function inicializarMenuSuperior() {
    aplicarEstilosMenu();
    renderizarHTMLMenu();

    const btnStatus = document.getElementById('btn-status');
    const btnSair = document.getElementById('btn-sair');

    if (btnStatus) {
        btnStatus.addEventListener('click', toggleStatus);
    }

    if (btnSair) {
        btnSair.addEventListener('click', sair);
    }
}