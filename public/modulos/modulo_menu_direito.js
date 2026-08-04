// public/modulos/modulo_menu_direito.js
import { inicializarHuntingAnalyser } from './modais/modal_hunting_analyser.js';
import { inicializarLootAnalyser } from './modais/modal_loot_analyser.js';

/**
 * Injeta os estilos CSS do Painel Direito, Hunting Analyser e Loot Analyser
 */
function aplicarEstilosDireito() {
    if (document.getElementById('estilo-menu-direito')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-direito';
    style.innerHTML = `
        /* 🟡 RETÂNGULO AMARELO (Painel Direito) */
        .side-panel-right {
            border: 2px solid #ffd700;
            background-color: #22222296;
            padding: 10px;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        /* HUNTING ANALYSER STYLES */
        .ha-card {
            background-color: #1a1a1a;
            border: 1px solid #444;
            border-radius: 4px;
            color: #fff;
            font-family: Arial, sans-serif;
            font-size: 13px;
            position: relative;
            overflow: hidden;
        }

        .ha-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            border-bottom: 1px solid #333;
        }

        .ha-title {
            font-weight: bold;
            color: #e0b034;
            font-size: 12px;
            letter-spacing: 0.5px;
        }

        .ha-actions {
            display: flex;
            gap: 4px;
        }

        .ha-btn {
            background-color: #1a1a1a;
            border: 1px solid #444;
            border-radius: 3px;
            color: #aaa;
            cursor: pointer;
            font-size: 11px;
            padding: 2px 6px;
            line-height: 1;
        }

        .ha-btn:hover {
            color: #fff;
            border-color: #666;
            background-color: #252525;
        }

        .ha-body {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .ha-row {
            display: flex;
            justify-content: space-between;
        }

        .ha-label {
            color: #aaa;
        }

        .ha-value {
            font-weight: bold;
        }

        .ha-balance-row {
            border-top: 1px solid #333;
            padding-top: 4px;
            margin-top: 2px;
        }

        .text-gold { color: #ffd700; }
        .text-red { color: #ff6666; }

        /* Dropdown Menu */
        .ha-dropdown {
            position: absolute;
            top: 32px;
            right: 10px;
            background: #222;
            border: 1px solid #444;
            border-radius: 4px;
            z-index: 10;
            box-shadow: 0 4px 8px rgba(0,0,0,0.8);
        }

        .ha-dropdown.hidden { display: none; }

        .ha-dropdown-item {
            background: transparent;
            border: none;
            color: #ccc;
            padding: 8px 12px;
            width: 100%;
            text-align: left;
            cursor: pointer;
            font-size: 12px;
        }

        .ha-dropdown-item:hover {
            background: #333;
            color: #fff;
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
        container.innerHTML = ''; // Limpa o conteúdo
        
        // 1. Renderiza o Hunting Analyser no topo
        inicializarHuntingAnalyser(container);

        // 2. Renderiza o Loot Analyser logo abaixo
        inicializarLootAnalyser(container);
    }
}

/**
 * Inicializa o Módulo do Painel Direito
 */
export function inicializarMenuDireito() {
    aplicarEstilosDireito();
    renderizarHTMLDireito();
}