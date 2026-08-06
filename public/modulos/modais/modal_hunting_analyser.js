// public/modulos/modais/modal_hunting_analyser.js

let sessionStartTime = null;
let timerInterval = null;
let isMinimized = false;

// Estado da Sessão de Caça
let huntingData = {
    expGanha: 0,
    lootTotal: 0,
    supplyTotal: 0
};

/**
 * Inicializa e renderediza a estrutura do Hunting Analyser no painel direito
 */
export function inicializarHuntingAnalyser(containerParent) {
    if (!containerParent) return;

    // Estrutura HTML do Analyser
    const analyserHTML = `
        <div id="hunting-analyser-card" class="ha-card">
            <div class="ha-header">
                <span class="ha-title">Hunting Analyser</span>
                <div class="ha-actions">
                    <button id="ha-btn-menu" class="ha-btn" title="Opções">☰</button>
                    <button id="ha-btn-toggle" class="ha-btn" title="Minimizar / Maximizar">-</button>
                </div>
            </div>

            <!-- Menu Dropdown da Sessão -->
            <div id="ha-dropdown-menu" class="ha-dropdown hidden">
                <button id="ha-btn-new-session" class="ha-dropdown-item">🔄 New Session</button>
            </div>

            <!-- Conteúdo Principal -->
            <div id="ha-content" class="ha-body">
                <div class="ha-row">
                    <span class="ha-label">Session:</span>
                    <span id="ha-session-time" class="ha-value">00:00:00</span>
                </div>
                <div class="ha-row">
                    <span class="ha-label">Exp Ganho:</span>
                    <span id="ha-exp-ganho" class="ha-value">0</span>
                </div>
                <div class="ha-row">
                    <span class="ha-label">Exp / h:</span>
                    <span id="ha-exp-h" class="ha-value">0</span>
                </div>
                <div class="ha-row">
                    <span class="ha-label">Loot:</span>
                    <span id="ha-loot" class="ha-value text-gold">0 GP</span>
                </div>
                <div class="ha-row">
                    <span class="ha-label">Supply:</span>
                    <span id="ha-supply" class="ha-value text-red">0 GP</span>
                </div>
                <div class="ha-row ha-balance-row">
                    <span class="ha-label">Balance:</span>
                    <span id="ha-balance" class="ha-value">0 GP</span>
                </div>
            </div>
        </div>
    `;

    containerParent.insertAdjacentHTML('beforeend', analyserHTML);

    // Eventos dos botões
    document.getElementById('ha-btn-toggle').addEventListener('click', toggleMinimizar);
    document.getElementById('ha-btn-menu').addEventListener('click', toggleMenu);
    document.getElementById('ha-btn-new-session').addEventListener('click', reiniciarSessao);

    // Inicia a primeira sessão
    reiniciarSessao();
}

/**
 * Zera os dados da sessão e inicia o temporizador
 */
export function reiniciarSessao() {
    huntingData = { expGanha: 0, lootTotal: 0, supplyTotal: 0 };
    sessionStartTime = Date.now();
    
    fecharMenu();
    atualizarDisplay();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(atualizarTempo, 1000);
}

/**
 * Registra o ganho de Experiência na sessão
 */
export function registrarExp(exp) {
    if (!sessionStartTime) return;
    huntingData.expGanha += Number(exp || 0);
    atualizarDisplay();
}

/**
 * Registra o valor de venda do Drop/Loot obtido
 */
export function registrarLoot(valorVenda) {
    if (!sessionStartTime) return;
    huntingData.lootTotal += Number(valorVenda || 0);
    atualizarDisplay();
}

/**
 * Registra o consumo de itens/supplies (ex: Maçã = 1 GP)
 */
export function registrarSupply(valorCusto) {
    if (!sessionStartTime) return;
    huntingData.supplyTotal += Number(valorCusto || 0);
    atualizarDisplay();
}

/**
 * Atualiza o cronômetro visual da sessão (00:00:00)
 */
function atualizarTempo() {
    if (!sessionStartTime) return;

    const decorridoSegundos = Math.floor((Date.now() - sessionStartTime) / 1000);
    const horas = String(Math.floor(decorridoSegundos / 3600)).padStart(2, '0');
    const minutos = String(Math.floor((decorridoSegundos % 3600) / 60)).padStart(2, '0');
    const segundos = String(decorridoSegundos % 60).padStart(2, '0');

    const elTime = document.getElementById('ha-session-time');
    if (elTime) elTime.innerText = `${horas}:${minutos}:${segundos}`;

    // Atualiza a estimativa da Exp/h a cada segundo
    calcularExpPorHora(decorridoSegundos);
}

/**
 * Calcula a estimativa proporcional de XP por Hora
 */
function calcularExpPorHora(decorridoSegundos) {
    const elExpH = document.getElementById('ha-exp-h');
    if (!elExpH) return;

    if (decorridoSegundos < 5) {
        elExpH.innerText = '0';
        return;
    }

    const expPorHora = Math.floor((huntingData.expGanha / decorridoSegundos) * 3600);
    elExpH.innerText = expPorHora.toLocaleString('pt-BR');
}

/**
 * Atualiza as informações visuais no painel
 */
function atualizarDisplay() {
    const elExpGanho = document.getElementById('ha-exp-ganho');
    const elLoot = document.getElementById('ha-loot');
    const elSupply = document.getElementById('ha-supply');
    const elBalance = document.getElementById('ha-balance');

    if (elExpGanho) elExpGanho.innerText = huntingData.expGanha.toLocaleString('pt-BR');
    if (elLoot) elLoot.innerText = `${huntingData.lootTotal.toLocaleString('pt-BR')} GP`;
    if (elSupply) elSupply.innerText = `${huntingData.supplyTotal.toLocaleString('pt-BR')} GP`;

    const balance = huntingData.lootTotal - huntingData.supplyTotal;
    if (elBalance) {
        elBalance.innerText = `${balance.toLocaleString('pt-BR')} GP`;
        elBalance.style.color = balance >= 0 ? '#00ff88' : '#ff4444';
    }
}

/**
 * Minimiza e Maximiza o modal do analyser
 */
function toggleMinimizar() {
    const content = document.getElementById('ha-content');
    const btnToggle = document.getElementById('ha-btn-toggle');
    isMinimized = !isMinimized;

    if (isMinimized) {
        content.style.display = 'none';
        btnToggle.innerText = '+';
    } else {
        content.style.display = 'block';
        btnToggle.innerText = '-';
    }
}

function toggleMenu() {
    const menu = document.getElementById('ha-dropdown-menu');
    if (menu) menu.classList.toggle('hidden');
}

function fecharMenu() {
    const menu = document.getElementById('ha-dropdown-menu');
    if (menu) menu.classList.add('hidden');
}