// public/modulos/modulo_tela_de_combate.js
import { executarTurno, toggleAutoCombate, getModoAuto, atualizarTextosBarras } from '../motores/motor_combate.js';
import { abrirModalOpcoesCombate } from './modais/combate/modal_opcoes_de_combate.js';
import { abrirModalOpcoesTreinoCombate } from './modais/combate/modal_opcoes_de_treino_de_combate.js';

let treinoSelecionado = 'forca'; // Padrão

function aplicarEstilosCombate() {
    if (document.getElementById('estilo-tela-combate')) return;

    const style = document.createElement('style');
    style.id = 'estilo-tela-combate';
    style.innerHTML = `
        .combat-screen {
            border: 2px solid #ffffff; 
            background-color: #22222296;
            border-radius: 6px; 
            padding: 20px; 
            display: flex;
            flex-direction: column; 
            align-items: center; 
            justify-content: space-between; 
            height: 100%;
            position: relative; /* Para botões nos cantos inferiores */
        }

        .topo-combate {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
            gap: 15px;
        }

        .combatente-topo {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .nome-combatente {
            font-size: 13px;
            font-weight: bold;
            color: #ffffff;
            margin-top: 3px;
        }

        .vs-texto {
            font-size: 18px;
            font-weight: bold;
            color: #ff3333;
            margin-top: 5px;
            text-shadow: 0 0 6px rgba(255, 51, 51, 0.6);
        }

        /* Barras de HP e MP */
        .bar-hp-bg, .bar-mp-bg { 
            width: 100%; 
            background: #111; 
            height: 14px; 
            border-radius: 4px; 
            overflow: hidden; 
            position: relative;
            border: 1px solid #444;
        }
        .bar-hp-fill { height: 100%; background: #ff3333; width: 100%; transition: width 0.2s; }
        .bar-mp-fill { height: 100%; background: #0099ff; width: 100%; transition: width 0.2s; }

        .bar-text {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: bold; color: #ffffff;
            text-shadow: 1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000;
            pointer-events: none;
        }

        .arena-sprites { 
            display: flex; 
            justify-content: space-around; 
            width: 100%; 
            align-items: center; 
            margin-top: 15px;
            margin-bottom: 10px;
        }
        .combatente { text-align: center; }
        .combatente img { width: 230px; height: 230px; border-radius: 4px; object-fit: cover; }

        .acoes-combate-container { display: flex; gap: 10px; align-items: center; }

        .btn-atacar { background: #ff3333; color: #fff; border: none; padding: 10px 25px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer; }
        .btn-atacar:hover:not(:disabled) { background: #cc0000; }
        .btn-atacar:disabled { background: #555; cursor: not-allowed; opacity: 0.7; }

        .btn-auto { background: #333; color: #aaa; border: 1px solid #555; padding: 10px 18px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: 0.2s; }
        .btn-auto.ativo { background: #00ff88; color: #121212; border-color: #00ff88; box-shadow: 0 0 8px #00ff88; }

        .log-combate { font-size: 13px; color: #aaa; height: 40px; text-align: center; display: flex; align-items: center; justify-content: center; }

        .timer-container {
            width: 180px; background-color: #222; border: 1px solid #444;
            height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 8px; display: none;
        }
        .timer-bar {
            height: 100%; background: linear-gradient(90deg, #ff9900, #00ff88);
            width: 0%; transition: width 0.1s linear;
        }

        /* Botão de Treino no canto inferior esquerdo */
        .btn-treino-combate {
            position: absolute;
            bottom: 12px;
            left: 12px;
            background: #222;
            border: 1px solid #ff9900;
            color: #ff9900;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            transition: 0.2s;
        }
        .btn-treino-combate:hover {
            background: #332200;
            transform: scale(1.08);
        }

        /* Botão de Engrenagem (Opções) no canto inferior direito */
        .btn-engrenagem-combate {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: #222;
            border: 1px solid #ffcc00;
            color: #ffcc00;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            transition: 0.2s;
        }
        .btn-engrenagem-combate:hover {
            background: #333;
            transform: scale(1.08);
        }
    `;
    document.head.appendChild(style);
}

export function iniciarCombate(monstro) {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    const container = document.getElementById('tela-combate');
    if (!container) return;

    monstro.vida_atual = monstro.vida_maxima;
    monstro.mana_atual = monstro.mana_atual ?? monstro.mana_maxima ?? 0;
    monstro.mana_maxima = monstro.mana_maxima ?? 0;

    const modoAuto = getModoAuto();

    let monstroImg = monstro.imagem_url || 'poring.png';
    if (!monstroImg.startsWith('/img/monstros/') && !monstroImg.startsWith('img/monstros/')) {
        monstroImg = 'img/monstros/' + monstroImg.replace(/^\//, '');
    }

    container.className = 'combat-screen';
    container.innerHTML = `
        <div class="topo-combate">
            <!-- Herói (Esquerda) -->
            <div class="combatente-topo">
                <div class="bar-hp-bg">
                    <div id="hp-heroi" class="bar-hp-fill" style="width: ${Math.max(0, (heroi.vida_atual / heroi.vida_maxima) * 100)}%;"></div>
                    <span id="text-hp-heroi" class="bar-text"></span>
                </div>
                <div class="bar-mp-bg">
                    <div id="mp-heroi" class="bar-mp-fill" style="width: ${Math.max(0, (heroi.mana_atual / heroi.mana_maxima) * 100)}%;"></div>
                    <span id="text-mp-heroi" class="bar-text"></span>
                </div>
                <div class="nome-combatente">${heroi.nome_heroi}</div>
            </div>

            <div class="vs-texto">VS</div>

            <!-- Monstro (Direita) -->
            <div class="combatente-topo" style="text-align: right;">
                <div class="bar-hp-bg">
                    <div id="hp-monstro" class="bar-hp-fill" style="width: 100%;"></div>
                    <span id="text-hp-monstro" class="bar-text"></span>
                </div>
                <div class="bar-mp-bg">
                    <div id="mp-monstro" class="bar-mp-fill" style="width: 100%;"></div>
                    <span id="text-mp-monstro" class="bar-text"></span>
                </div>
                <div class="nome-combatente">${monstro.nome}</div>
            </div>
        </div>

        <div class="arena-sprites">
            <div class="combatente">
                <img src="img/heroi.png" onerror="this.onerror=null; this.src='https://placehold.co/50x50/333/fff?text=Heroi';" alt="Herói">
            </div>

            <div class="combatente">
                <img src="${monstroImg}" onerror="this.onerror=null; this.src='https://placehold.co/50x50/333/fff?text=Poring';" alt="${monstro.nome}">
            </div>
        </div>

        <div id="log-combate" class="log-combate">Clique em Atacar ou ative o modo AUTO!</div>

        <div style="display: flex; flex-direction: column; align-items: center;">
            <div id="timer-container" class="timer-container">
                <div id="timer-bar" class="timer-bar"></div>
            </div>
            
            <div class="acoes-combate-container">
                <button id="btn-atacar" class="btn-atacar">⚔️ ATACAR</button>
                <button id="btn-auto" class="btn-auto ${modoAuto ? 'ativo' : ''}">🤖 AUTO: ${modoAuto ? 'ON' : 'OFF'}</button>
            </div>
        </div>

        <!-- Botão de Opções de Treino (Canto Inferior Esquerdo) -->
        <button id="btn-treino-combate" class="btn-treino-combate" title="Opções de Treino">💪</button>

        <!-- Botão de Opções de Combate (Canto Inferior Direito) -->
        <button id="btn-opcoes-combate" class="btn-engrenagem-combate" title="Opções de Combate">⚙️</button>
    `;

    // Atualiza os valores escritos nas barras
    atualizarTextosBarras(heroi, monstro);

    document.getElementById('btn-atacar').onclick = () => {
        executarTurno(heroi, monstro, treinoSelecionado);
    };

    document.getElementById('btn-auto').onclick = () => {
        toggleAutoCombate(heroi, monstro, treinoSelecionado);
    };

    // Clique no botão do bracinho (Treino)
    document.getElementById('btn-treino-combate').onclick = () => {
        abrirModalOpcoesTreinoCombate(treinoSelecionado, (novoTreino) => {
            treinoSelecionado = novoTreino;
        });
    };

    // Clique na engrenagem de opções
    document.getElementById('btn-opcoes-combate').onclick = () => {
        const heroiAtual = JSON.parse(localStorage.getItem('heroi')) || heroi;
        abrirModalOpcoesCombate(() => {
            atualizarTextosBarras(heroiAtual, monstro);
        });
    };

    if (modoAuto) {
        setTimeout(() => {
            executarTurno(heroi, monstro, treinoSelecionado);
        }, 500);
    }
}

export function inicializarTelaDeCombate() {
    aplicarEstilosCombate();
    const container = document.getElementById('tela-combate');
    if (container) {
        container.className = 'combat-screen';
        container.innerHTML = `
            <h2>⚔️ Tela de Combate</h2>
            <p style="color: #aaa; margin-top: 10px;">Clique em <strong>Hunts</strong> no menu superior para escolher um monstro!</p>
        `;
    }
}