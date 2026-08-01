// public/modulos/modulo_tela_de_combate.js
import { executarTurno, toggleAutoCombate, getModoAuto } from '../motores/motor_combate.js';

let treinoSelecionado = 'forca'; // Padrão

function aplicarEstilosCombate() {
    if (document.getElementById('estilo-tela-combate')) return;

    const style = document.createElement('style');
    style.id = 'estilo-tela-combate';
    style.innerHTML = `
        .combat-screen {
            border: 2px solid #ffffff; background-color: #22222296;
            border-radius: 6px; padding: 20px; display: flex;
            flex-direction: column; align-items: center; justify-content: space-between; height: 100%;
        }
        .arena { display: flex; justify-content: space-around; width: 100%; align-items: center; }
        .combatente { text-align: center; width: 120px; }
        .combatente img { width: 50px; height: 50px; border-radius: 4px; object-fit: cover; border: 1px solid #555; }
        
        .bar-hp-bg, .bar-mp-bg { width: 100%; background: #333; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px; }
        .bar-hp-fill { height: 100%; background: #ff3333; width: 100%; transition: width 0.2s; }
        .bar-mp-fill { height: 100%; background: #0099ff; width: 100%; transition: width 0.2s; }

        .treino-container { display: flex; gap: 6px; margin: 15px 0; }
        .btn-treino { background: #222; border: 1px solid #555; color: #fff; padding: 5px 8px; font-size: 11px; border-radius: 4px; cursor: pointer; }
        .btn-treino.ativo { border-color: #ff9900; background: #332200; color: #ff9900; font-weight: bold; }

        /* Container dos Botões de Ação */
        .acoes-combate-container { display: flex; gap: 10px; align-items: center; }

        .btn-atacar { background: #ff3333; color: #fff; border: none; padding: 10px 25px; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer; }
        .btn-atacar:hover:not(:disabled) { background: #cc0000; }
        .btn-atacar:disabled { background: #555; cursor: not-allowed; opacity: 0.7; }

        /* 🤖 BOTÃO AUTO */
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
    `;
    document.head.appendChild(style);
}

export function iniciarCombate(monstro) {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    const container = document.getElementById('tela-combate');
    if (!container) return;

    // Resetar vida do monstro
    monstro.vida_atual = monstro.vida_maxima;
    const modoAuto = getModoAuto();

    // 🎯 CORREÇÃO DO CAMINHO DA IMAGEM DO MONSTRO:
    let monstroImg = monstro.imagem_url || 'poring.png';
    
    // Se não tiver "img/monstros/" no caminho, nós adicionamos!
    if (!monstroImg.startsWith('/img/monstros/') && !monstroImg.startsWith('img/monstros/')) {
        // Remove barras iniciais soltas para evitar "//"
        monstroImg = 'img/monstros/' + monstroImg.replace(/^\//, '');
    }

    container.className = 'combat-screen';
    container.innerHTML = `
        <h3>⚔️ Arena de Combate</h3>
        
        <div class="arena">
            <!-- Herói -->
            <div class="combatente">
                <img src="img/heroi.png" onerror="this.onerror=null; this.src='https://placehold.co/50x50/333/fff?text=Heroi';" alt="Herói">
                <div><strong>${heroi.nome_heroi}</strong></div>
                <div class="bar-hp-bg"><div id="hp-heroi" class="bar-hp-fill" style="width: ${Math.max(0, (heroi.vida_atual / heroi.vida_maxima) * 100)}%;"></div></div>
                <div class="bar-mp-bg"><div id="mp-heroi" class="bar-mp-fill" style="width: ${Math.max(0, (heroi.mana_atual / heroi.mana_maxima) * 100)}%;"></div></div>
            </div>

            <div style="font-size: 20px; font-weight: bold; color: #ff3333;">VS</div>

            <!-- Monstro -->
            <div class="combatente">
                <img src="${monstroImg}" onerror="this.onerror=null; this.src='https://placehold.co/50x50/333/fff?text=Poring';" alt="${monstro.nome}">
                <div><strong>${monstro.nome}</strong></div>
                <div class="bar-hp-bg"><div id="hp-monstro" class="bar-hp-fill" style="width: 100%;"></div></div>
                <div class="bar-mp-bg"><div id="mp-monstro" class="bar-mp-fill" style="width: 100%;"></div></div>
            </div>
        </div>

        <!-- Botoezinhos de Treino -->
        <div class="treino-container">
            <button class="btn-treino ${treinoSelecionado === 'forca' ? 'ativo' : ''}" data-treino="forca">Treinar Força</button>
            <button class="btn-treino ${treinoSelecionado === 'protecao' ? 'ativo' : ''}" data-treino="protecao">Treinar Proteção</button>
            <button class="btn-treino ${treinoSelecionado === 'vitalidade' ? 'ativo' : ''}" data-treino="vitalidade">Treinar Vitalidade</button>
            <button class="btn-treino ${treinoSelecionado === 'inteligencia' ? 'ativo' : ''}" data-treino="inteligencia">Treinar Intel.</button>
        </div>

        <div id="log-combate" class="log-combate">Clique em Atacar ou ative o modo AUTO!</div>

        <!-- Container da Ação -->
        <div style="display: flex; flex-direction: column; align-items: center;">
            <div id="timer-container" class="timer-container">
                <div id="timer-bar" class="timer-bar"></div>
            </div>
            
            <div class="acoes-combate-container">
                <button id="btn-atacar" class="btn-atacar">⚔️ ATACAR</button>
                <button id="btn-auto" class="btn-auto ${modoAuto ? 'ativo' : ''}">🤖 AUTO: ${modoAuto ? 'ON' : 'OFF'}</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.btn-treino').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.btn-treino').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            treinoSelecionado = btn.getAttribute('data-treino');
        };
    });

    document.getElementById('btn-atacar').onclick = () => {
        executarTurno(heroi, monstro, treinoSelecionado);
    };

    document.getElementById('btn-auto').onclick = () => {
        toggleAutoCombate(heroi, monstro, treinoSelecionado);
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