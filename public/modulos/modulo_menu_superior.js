import { abrirModalMochila } from './modais/modal_mochila.js';
import { abrirModalHunts } from './modais/modal_hunts.js';
import { abrirModalRanking } from './modais/modal_ranking.js';
import { abrirModalBau } from './modais/modal_bau.js';
import { abrirModalMarket } from './modais/modal_market.js';
import { abrirModalSantuario } from './modais/modal_santuario.js';
import { abrirModalStatus } from './modais/modal_status_jogador.js';
import { abrirModalBanco } from './modais/modal_banco.js';

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
        /* Container Wrapper com Posição Absoluta para flutuar sobre o conteúdo */
        .top-bar-wrapper {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            z-index: 1000;
            height: 26px;
        }

        .top-bar {
            border: 2px solid #00a2ff;
            background-color: #121212;
            padding: 0 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-radius: 6px;
            box-shadow: 0 4px 15px rgba(0, 162, 255, 0.4);
            overflow: hidden;
            max-height: 26px;
            opacity: 0.9;
            transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }

        .top-bar-wrapper:hover .top-bar {
            max-height: 120px;
            opacity: 1;
            padding: 10px;
            background-color: #121212f2;
        }

        .alca-minimizado {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4px 0;
            cursor: pointer;
            pointer-events: none;
            transition: opacity 0.2s ease, display 0.2s ease;
            width: 100%;
        }

        .alca-minimizado span {
            display: block;
            width: 22px;
            height: 2px;
            background-color: #00a2ff;
            margin: 2px 0;
            border-radius: 2px;
            box-shadow: 0 0 5px #00a2ff;
        }

        .top-bar-wrapper:hover .alca-minimizado {
            opacity: 0;
            height: 0;
            padding: 0;
            margin: 0;
            overflow: hidden;
        }

        .menu-cards-container {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            justify-content: flex-start;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.25s ease 0.1s, visibility 0.25s ease 0.1s;
        }

        .top-bar-wrapper:hover .menu-cards-container {
            opacity: 1;
            visibility: visible;
        }

        .card-menu {
            width: 75px;
            height: 75px;
            background: #181818;
            border: 1px solid #444;
            border-radius: 6px;
            padding: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            user-select: none;
            flex-shrink: 0;
        }

        .card-menu:hover {
            border-color: #00ff88;
            transform: translateY(-2px);
            background: #222;
            box-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
        }

        .card-menu img {
            width: 38px;
            height: 38px;
            object-fit: contain;
            margin-top: 2px;
        }

        .card-menu .label-menu {
            font-size: 11px;
            font-weight: bold;
            color: #00ff88;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .card-menu-sair {
            border-color: #552222;
        }

        .card-menu-sair:hover {
            border-color: #f44336;
            box-shadow: 0 0 8px rgba(244, 67, 54, 0.4);
        }

        .card-menu-sair .label-menu {
            color: #f44336;
        }
    `;
    document.head.appendChild(style);
}

function renderizarHTMLMenu() {
    const container = document.getElementById('header-menu');
    if (container) {
        const imgGenerica = '/img/monstros/poring.png';

        container.className = 'top-bar-wrapper';
        container.innerHTML = `
            <div class="top-bar">
                <div class="alca-minimizado">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div class="menu-cards-container">
                    <div id="btn-status" class="card-menu">
                        <img src="/img/icones/status.png" alt="Status" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Status</span>
                    </div>

                    <div id="btn-mochila" class="card-menu">
                        <img src="/img/icones/mochila.png" alt="Mochila" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Mochila</span>
                    </div>

                    <div id="btn-bau" class="card-menu">
                        <img src="/img/icones/bau.png" alt="Baú" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Baú</span>
                    </div>

                    <!-- 🔴 NOVO CARD SANTUÁRIO -->
                    <div id="btn-santuario" class="card-menu">
                        <img src="/img/icones/santuario.png" alt="Santuário" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Santuário</span>
                    </div>

                    <div id="btn-market" class="card-menu">
                        <img src="/img/icones/market.png" alt="Market" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Market</span>
                    </div>

                    <div id="btn-hunts" class="card-menu">
                        <img src="/img/icones/hunts.png" alt="Hunts" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Hunts</span>
                    </div>

                    <div id="btn-ranking" class="card-menu">
                        <img src="/img/icones/ranking.png" alt="Ranking" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Ranking</span>
                    </div>

                    <div id="btn-bank" class="card-menu">
                        <img src="/img/icones/banco.png" alt="Bank" onerror="this.src='https://placehold.co/38x38/333/fff?text=Bank';">
                        <span class="label-menu">Bank</span>
                    </div>

                    <!-- exemplo de como fica com img generica nao apagar 
                    
                    <div id="btn-ranking" class="card-menu">
                        <img src="${imgGenerica}" alt="Ranking" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Ranking</span>
                    </div>

                    -->

                    <div id="btn-sair" class="card-menu card-menu-sair">
                        <img src="/img/icones/sair.png" alt="Sair" onerror="this.src='https://placehold.co/38x38/333/fff?text=Icon';">
                        <span class="label-menu">Sair</span>
                    </div>
                </div>
            </div>
        `;
    }
}

export function inicializarMenuSuperior() {
    aplicarEstilosMenu();
    renderizarHTMLMenu();

    document.getElementById('btn-status')?.addEventListener('click', abrirModalStatus);
    document.getElementById('btn-mochila')?.addEventListener('click', abrirModalMochila);
    document.getElementById('btn-bau')?.addEventListener('click', abrirModalBau);
    document.getElementById('btn-santuario')?.addEventListener('click', abrirModalSantuario);
    document.getElementById('btn-market')?.addEventListener('click', abrirModalMarket);
    document.getElementById('btn-hunts')?.addEventListener('click', abrirModalHunts);
    document.getElementById('btn-ranking')?.addEventListener('click', abrirModalRanking);
    document.getElementById('btn-bank')?.addEventListener('click', abrirModalBanco);
    document.getElementById('btn-sair')?.addEventListener('click', sair);
}