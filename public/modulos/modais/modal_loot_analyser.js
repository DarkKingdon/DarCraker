// public/modulos/modais/modal_loot_analyser.js

let tempoInicioLoot = null;
let timerLootInterval = null;
let totalCentsLoot = 0;
let itensLootados = {}; // Estrutura: { "id_do_item": { nome, img, quantidade, valorUnitario } }
let minimizado = false;

function aplicarEstilosLootAnalyser() {
    if (document.getElementById('estilo-loot-analyser')) return;

    const style = document.createElement('style');
    style.id = 'estilo-loot-analyser';
    style.innerHTML = `
        .loot-analyser-card {
            background-color: #1a1a1a;
            border: 1px solid #444;
            border-radius: 4px;
            width: 100%;
            color: #ccc;
            font-family: Arial, sans-serif;
            font-size: 13px;
            padding: 0;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            position: relative;
            overflow: hidden;
        }

        /* Cabeçalho alinhado com o do Hunting Analyser */
        .loot-analyser-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            border-bottom: 1px solid #333;
        }

        .loot-analyser-title {
            font-weight: bold;
            color: #e0b034;
            font-size: 12px;
            letter-spacing: 0.5px;
        }

        .loot-analyser-actions {
            display: flex;
            gap: 4px;
        }

        /* Botões idênticos ao Hunting Analyser (.ha-btn) */
        .loot-analyser-actions button {
            background-color: #1a1a1a;
            border: 1px solid #444;
            border-radius: 3px;
            color: #aaa;
            cursor: pointer;
            font-size: 11px;
            padding: 2px 6px;
            line-height: 1;
        }

        .loot-analyser-actions button:hover {
            color: #fff;
            border-color: #666;
            background-color: #252525;
        }

        /* Corpo do Card */
        .loot-analyser-body {
            padding: 10px;
        }

        /* Dropdown do Menu */
        .loot-dropdown {
            position: absolute;
            top: 32px;
            right: 10px;
            background-color: #222;
            border: 1px solid #444;
            border-radius: 4px;
            z-index: 100;
            box-shadow: 0 4px 8px rgba(0,0,0,0.8);
        }

        .loot-dropdown.hidden {
            display: none;
        }

        .loot-dropdown-item {
            background: none;
            border: none;
            color: #ccc;
            padding: 8px 12px;
            width: 100%;
            text-align: left;
            cursor: pointer;
            font-size: 12px;
        }

        .loot-dropdown-item:hover {
            background-color: #333;
            color: #fff;
        }

        .loot-analyser-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        .loot-analyser-value {
            color: #e0b034;
            font-weight: bold;
        }

        /* Grid dos Slots de Loot (4 colunas) */
        .loot-grid-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin-top: 10px;
            max-height: 160px;
            overflow-y: auto;
            padding-right: 2px;
        }

        .loot-grid-container::-webkit-scrollbar {
            width: 4px;
        }
        .loot-grid-container::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 2px;
        }

        /* Slot Ajustado */
        .loot-slot {
            width: 40px;
            height: 40px;
            background-color: #151515;
            border: 1px solid #333;
            border-radius: 4px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .loot-slot img {
            width: 28px;
            height: 28px;
            object-fit: contain;
        }

        .loot-slot .loot-qtd {
            position: absolute;
            bottom: 2px;
            right: 2px;
            background: rgba(0, 0, 0, 0.85);
            color: #fff;
            font-size: 9px;
            font-weight: bold;
            padding: 1px 3px;
            border-radius: 2px;
            line-height: 1;
        }
    `;
    document.head.appendChild(style);
}

export function inicializarLootAnalyser(containerOuId = 'painel-direito') {
    aplicarEstilosLootAnalyser();

    let container = typeof containerOuId === 'string' 
        ? document.getElementById(containerOuId) 
        : containerOuId;

    if (!container) {
        container = document.getElementById('painel-direito') || document.body;
    }

    let card = document.getElementById('loot-analyser-card');
    if (!card) {
        card = document.createElement('div');
        card.id = 'loot-analyser-card';
        card.className = 'loot-analyser-card';
        container.appendChild(card);
    }

    renderizarCard();
    iniciarTimerLoot();
}

function renderizarCard() {
    const card = document.getElementById('loot-analyser-card');
    if (!card) return;

    const horasDecorridas = tempoInicioLoot ? (Date.now() - tempoInicioLoot) / 3600000 : 0;
    const centsPerHour = horasDecorridas > 0 ? Math.floor(totalCentsLoot / horasDecorridas) : 0;

    let slotsHtml = '';
    const listaItens = Object.values(itensLootados);

    if (listaItens.length > 0) {
        listaItens.forEach(item => {
            slotsHtml += `
                <div class="loot-slot" title="${item.nome}">
                    <img src="${item.img}" onerror="this.onerror=null; this.src='https://placehold.co/28x28/222/fff?text=Loot';" alt="${item.nome}">
                    <span class="loot-qtd">${item.quantidade.toLocaleString('pt-BR')}</span>
                </div>
            `;
        });
    }

    card.innerHTML = `
        <div class="loot-analyser-header">
            <span class="loot-analyser-title">Loot Analyser</span>
            <div class="loot-analyser-actions">
                <button id="btn-menu-loot-analyser" title="Opções">☰</button>
                <button id="btn-toggle-loot-analyser" title="Minimizar / Expandir">${minimizado ? '+' : '-'}</button>
            </div>
        </div>

        <!-- Menu Dropdown -->
        <div id="loot-dropdown-menu" class="loot-dropdown hidden">
            <button id="btn-reset-loot-analyser" class="loot-dropdown-item">🔄 New Session</button>
        </div>

        <div id="loot-analyser-body" class="loot-analyser-body" style="display: ${minimizado ? 'none' : 'block'};">
            <div class="loot-analyser-row">
                <span>Session</span>
                <span id="loot-session-time">00:00:00</span>
            </div>
            <div class="loot-analyser-row">
                <span>Cents value</span>
                <span class="loot-analyser-value" id="loot-cents-value">${totalCentsLoot.toLocaleString('pt-BR')}</span>
            </div>
            <div class="loot-analyser-row">
                <span>Per hour</span>
                <span class="loot-analyser-value" id="loot-per-hour">${centsPerHour.toLocaleString('pt-BR')}</span>
            </div>

            <div class="loot-grid-container" id="loot-grid-container">
                ${slotsHtml}
            </div>
        </div>
    `;

    document.getElementById('btn-menu-loot-analyser').onclick = toggleMenu;
    document.getElementById('btn-reset-loot-analyser').onclick = resetarSessaoLoot;
    document.getElementById('btn-toggle-loot-analyser').onclick = toggleMinimizar;
}

function iniciarTimerLoot() {
    if (!tempoInicioLoot) tempoInicioLoot = Date.now();
    
    if (timerLootInterval) clearInterval(timerLootInterval);

    timerLootInterval = setInterval(() => {
        if (minimizado) return;

        const diffSecs = Math.floor((Date.now() - tempoInicioLoot) / 1000);
        const hh = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
        const mm = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
        const ss = String(diffSecs % 60).padStart(2, '0');

        const elTimer = document.getElementById('loot-session-time');
        if (elTimer) elTimer.innerText = `${hh}:${mm}:${ss}`;

        const horas = diffSecs / 3600;
        const centsPerHour = horas > 0 ? Math.floor(totalCentsLoot / horas) : 0;
        const elPerHour = document.getElementById('loot-per-hour');
        if (elPerHour) elPerHour.innerText = centsPerHour.toLocaleString('pt-BR');
    }, 1000);
}

export function registrarLootNoAnalyser(itemObj, quantidade = 1) {
    if (!itemObj) return;

    const valorUnitario = itemObj.valor_de_venda || 0;
    totalCentsLoot += (valorUnitario * quantidade);

    const itemId = itemObj.id || itemObj.nome;
    
    let imgSrc = itemObj.imagem_url || 'jellopy.png';
    if (!imgSrc.startsWith('/img/objetos/loots/') && !imgSrc.startsWith('img/objetos/loots/')) {
        imgSrc = 'img/objetos/loots/' + imgSrc;
    }

    if (itensLootados[itemId]) {
        itensLootados[itemId].quantidade += quantidade;
    } else {
        itensLootados[itemId] = {
            nome: itemObj.nome,
            img: imgSrc,
            quantidade: quantidade,
            valorUnitario: valorUnitario
        };
    }

    renderizarCard();
}

function resetarSessaoLoot() {
    tempoInicioLoot = Date.now();
    totalCentsLoot = 0;
    itensLootados = {};
    fecharMenu();
    renderizarCard();
}

function toggleMenu() {
    const menu = document.getElementById('loot-dropdown-menu');
    if (menu) menu.classList.toggle('hidden');
}

function fecharMenu() {
    const menu = document.getElementById('loot-dropdown-menu');
    if (menu) menu.classList.add('hidden');
}

function toggleMinimizar() {
    minimizado = !minimizado;
    renderizarCard();
}