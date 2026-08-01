// public/modulos/modulo_menu_superior.js
import { abrirModalMochila } from './modais/modal_mochila.js';
import { abrirModalHunts } from './modais/modal_hunts.js';
import { abrirModalRanking } from './modais/modal_ranking.js';
import { abrirModalBau } from './modais/modal_bau.js';
import { abrirModalMarket } from './modais/modal_market.js'; // 👈 Import Novo

export function toggleStatus() {
    const painelStatus = document.getElementById('painel-status');
    if (painelStatus) {
        painelStatus.style.display = (painelStatus.style.display === 'none') ? 'block' : 'none';
    }
}

export function sair() {
    localStorage.removeItem('heroi');
    window.location.href = 'index.html';
}

function aplicarEstilosMenu() {
    if (document.getElementById('estilo-menu-superior')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-superior';
    style.innerHTML = `
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

function renderizarHTMLMenu() {
    const container = document.getElementById('header-menu');
    if (container) {
        container.className = 'top-bar';
        container.innerHTML = `
            <button id="btn-status" class="btn-menu">Status</button>
            <button id="btn-mochila" class="btn-menu">Mochila</button>
            <button id="btn-bau" class="btn-menu">Baú</button>
            <button id="btn-market" class="btn-menu">Market</button>
            <button id="btn-hunts" class="btn-menu">Hunts</button>
            <button id="btn-ranking" class="btn-menu">Ranking</button>
            <button id="btn-sair" class="btn-menu btn-sair">Sair</button>
        `;
    }
}

// Na função inicializarMenuSuperior():
export function inicializarMenuSuperior() {
    aplicarEstilosMenu();
    renderizarHTMLMenu();

    document.getElementById('btn-status')?.addEventListener('click', toggleStatus);
    document.getElementById('btn-mochila')?.addEventListener('click', abrirModalMochila);
    document.getElementById('btn-bau')?.addEventListener('click', abrirModalBau);
    document.getElementById('btn-market')?.addEventListener('click', abrirModalMarket); // 👈 Evento Market
    document.getElementById('btn-hunts')?.addEventListener('click', abrirModalHunts);
    document.getElementById('btn-ranking')?.addEventListener('click', abrirModalRanking);
    document.getElementById('btn-sair')?.addEventListener('click', sair);
}