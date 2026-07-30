// public/motores/motor_combate.js
import { concederRecompensas } from './motor_status_heroi.js';
import { iniciarCombate } from '../modulos/modulo_tela_de_combate.js';
import { carregarStatus } from '../modulos/modulo_menu_esquerdo.js';

let combatendo = false;
let modoAuto = false;

export function getModoAuto() {
    return modoAuto;
}

export function toggleAutoCombate(heroi, monstro, treinoSelecionado) {
    modoAuto = !modoAuto;
    const btnAuto = document.getElementById('btn-auto');

    if (btnAuto) {
        if (modoAuto) {
            btnAuto.classList.add('ativo');
            btnAuto.innerText = '🤖 AUTO: ON';
        } else {
            btnAuto.classList.remove('ativo');
            btnAuto.innerText = '🤖 AUTO: OFF';
        }
    }

    // Se ativou o AUTO e não está atacando no momento, executa o turno imediatamente
    if (modoAuto && !combatendo) {
        const heroiAtualizado = JSON.parse(localStorage.getItem('heroi')) || heroi;
        executarTurno(heroiAtualizado, monstro, treinoSelecionado);
    }
}

export function executarTurno(heroi, monstro, treinoSelecionado) {
    if (combatendo) return;

    // Garante pegar sempre o herói com a vida real mais recente
    let heroiAtual = JSON.parse(localStorage.getItem('heroi')) || heroi;

    // Se o herói já estiver morto, impede o combate
    if ((heroiAtual.vida_atual ?? 0) <= 0) {
        const elLog = document.getElementById('log-combate');
        if (elLog) elLog.innerHTML = `<span style="color:#ff3333;">Você está sem vida! Descanse ou use uma poção.</span>`;
        modoAuto = false;
        atualizarBotaoAutoUI();
        return;
    }

    const elLog = document.getElementById('log-combate');
    const elHpMonstro = document.getElementById('hp-monstro');
    const elHpHeroi = document.getElementById('hp-heroi');
    const btnAtacar = document.getElementById('btn-atacar');
    const timerContainer = document.getElementById('timer-container');
    const timerBar = document.getElementById('timer-bar');

    combatendo = true;
    if (btnAtacar) btnAtacar.disabled = true;

    // 1. ATAQUE DO HERÓI
    const danoHeroi = Math.max(1, Math.floor(Math.random() * (heroiAtual.ataque_maximo - heroiAtual.ataque_minimo + 1)) + heroiAtual.ataque_minimo - (monstro.defesa_minima || 0));
    monstro.vida_atual = Math.max(0, monstro.vida_atual - danoHeroi);

    if (elHpMonstro) elHpMonstro.style.width = `${(monstro.vida_atual / monstro.vida_maxima) * 100}%`;

    // Se o monstro morrer com este golpe
    if (monstro.vida_atual <= 0) {
        elLog.innerHTML = `<span style="color:#00ff88;">Você deu <strong>${danoHeroi}</strong> de dano e derrotou o ${monstro.nome}!</span>`;
        
        // Dá EXP e salva o herói
        concederRecompensas(monstro, treinoSelecionado);

        // Processa e verifica Drop de Itens
    const heroiAtual = JSON.parse(localStorage.getItem('heroi'));
    fetch('/api/combate/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: heroiAtual.id, monstro_id: monstro.id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.dropObtido) {
            elLog.innerHTML += `<br><span style="color:#ffff00;">🎁 Dropou: ${data.quantidade}x ${data.dropObtido.nome}!</span>`;
        }
    });


        agendarRenascerMonstro(monstro, elLog);
        return;
    }

    elLog.innerHTML = `Você deu <strong>${danoHeroi}</strong> de dano. Aguarde a resposta do ${monstro.nome}...`;

    // 2. TEMPORIZADOR DE 3 SEGUNDOS PARA O CONTRA-ATAQUE
    iniciarTemporizador(3000, timerContainer, timerBar, () => {
        // Monstro contra-ataca
        const danoMonstro = Math.max(0, Math.floor(Math.random() * (monstro.ataque_maximo - monstro.ataque_minimo + 1)) + monstro.ataque_minimo - (heroiAtual.defesa_minima || 0));
        
        // MANTÉM O DANO NO HERÓI
        heroiAtual.vida_atual = Math.max(0, heroiAtual.vida_atual - danoMonstro);

        // Salva a nova vida do herói no LocalStorage e atualiza o painel esquerdo em tempo real
        localStorage.setItem('heroi', JSON.stringify(heroiAtual));
        carregarStatus();

        // Atualiza a barrinha de vida da tela de combate
        if (elHpHeroi) elHpHeroi.style.width = `${Math.max(0, (heroiAtual.vida_atual / heroiAtual.vida_maxima) * 100)}%`;

        // Se o Herói morrer
        if (heroiAtual.vida_atual <= 0) {
            elLog.innerHTML = `<span style="color:#ff3333;">O ${monstro.nome} te causou <strong>${danoMonstro}</strong> de dano e você foi derrotado!</span>`;
            combatendo = false;
            modoAuto = false; // Desliga o Auto ao morrer
            atualizarBotaoAutoUI();
            return;
        }

        elLog.innerHTML = `O ${monstro.nome} te atacou e causou <strong>${danoMonstro}</strong> de dano!`;
        if (btnAtacar) btnAtacar.disabled = false;
        combatendo = false;

        // SE O MODO AUTO ESTIVER ATIVO, CONTINUA O PRÓXIMO TURNO!
        if (modoAuto) {
            setTimeout(() => {
                executarTurno(heroiAtual, monstro, treinoSelecionado);
            }, 300);
        }
    });
}

function iniciarTemporizador(duracaoMs, container, barra, callback) {
    if (!container || !barra) {
        setTimeout(callback, duracaoMs);
        return;
    }

    container.style.display = 'block';
    barra.style.width = '0%';

    const inicio = Date.now();
    const interval = setInterval(() => {
        const decorrido = Date.now() - inicio;
        const porcentagem = Math.min(100, (decorrido / duracaoMs) * 100);
        barra.style.width = `${porcentagem}%`;

        if (decorrido >= duracaoMs) {
            clearInterval(interval);
            container.style.display = 'none';
            barra.style.width = '0%';
            callback();
        }
    }, 50);
}

function agendarRenascerMonstro(monstro, elLog) {
    let tempoRestante = 4;
    
    const interval = setInterval(() => {
        if (elLog) {
            elLog.innerHTML = `<span style="color:#00ff88;">Monstro derrotado! Novo ${monstro.nome} surgirá em ${tempoRestante}s...</span>`;
        }
        tempoRestante--;

        if (tempoRestante < 0) {
            clearInterval(interval);
            combatendo = false;
            // Reinicia a arena de batalha sem restaurar a vida do herói!
            iniciarCombate(monstro);
        }
    }, 1000);
}

function atualizarBotaoAutoUI() {
    const btnAuto = document.getElementById('btn-auto');
    if (btnAuto) {
        btnAuto.classList.remove('ativo');
        btnAuto.innerText = '🤖 AUTO: OFF';
    }
}