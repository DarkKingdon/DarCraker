// public/motores/motor_combate.js
import { concederRecompensas } from './motor_status_heroi.js';
import { iniciarCombate } from '../modulos/modulo_tela_de_combate.js';
import { carregarStatus } from '../modulos/modulo_menu_esquerdo.js';
import { abrirModalFinalDoCombate } from '../modulos/modais/modal_final_do_combate.js';
import { registrarLoot } from '../modulos/modais/modal_hunting_analyser.js'; // 👈 Adicionado
import { registrarLootNoAnalyser } from '../modulos/modais/modal_loot_analyser.js'; // 👈 Adicionado

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

    if (modoAuto && !combatendo) {
        const heroiAtualizado = JSON.parse(localStorage.getItem('heroi')) || heroi;
        executarTurno(heroiAtualizado, monstro, treinoSelecionado);
    }
}

export function executarTurno(heroi, monstro, treinoSelecionado) {
    if (combatendo) return;

    let heroiAtual = JSON.parse(localStorage.getItem('heroi')) || heroi;

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
        
        // Concede a XP
        concederRecompensas(monstro, treinoSelecionado);

        // Processa o Drop e abre o Modal
        const heroiAtual = JSON.parse(localStorage.getItem('heroi'));
        fetch('/api/combate/drop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: heroiAtual.id, monstro_id: monstro.id })
        })
        .then(res => res.json())
        .then(data => {
            // 📊 REGISTRA OS DROPS OBTIDOS NO HUNTING ANALYSER
            if (data && data.dropsObtidos && data.dropsObtidos.length > 0) {
                data.dropsObtidos.forEach(drop => {
                    const valorUnitario = drop.item.valor_de_venda || 0;
                    const qtd = drop.quantidade || 1;
                    registrarLoot(valorUnitario * qtd);

            // Registra no Loot Analyser (com objeto de imagem e quantidade para o grid)
            registrarLootNoAnalyser(drop.item, qtd);

                });
            }

            // Exibe o modal final com as recompensas e os drops
            abrirModalFinalDoCombate(monstro, treinoSelecionado, data);
        });

        agendarRenascerMonstro(monstro, elLog);
        return;
    }

    elLog.innerHTML = `Você deu <strong>${danoHeroi}</strong> de dano. Aguarde a resposta do ${monstro.nome}...`;

    // 2. TEMPORIZADOR DE 3 SEGUNDOS PARA O CONTRA-ATAQUE
    iniciarTemporizador(3000, timerContainer, timerBar, () => {
        const danoMonstro = Math.max(0, Math.floor(Math.random() * (monstro.ataque_maximo - monstro.ataque_minimo + 1)) + monstro.ataque_minimo - (heroiAtual.defesa_minima || 0));
        
        heroiAtual.vida_atual = Math.max(0, heroiAtual.vida_atual - danoMonstro);

        localStorage.setItem('heroi', JSON.stringify(heroiAtual));
        carregarStatus();

        if (elHpHeroi) elHpHeroi.style.width = `${Math.max(0, (heroiAtual.vida_atual / heroiAtual.vida_maxima) * 100)}%`;

        if (heroiAtual.vida_atual <= 0) {
            elLog.innerHTML = `<span style="color:#ff3333;">O ${monstro.nome} te causou <strong>${danoMonstro}</strong> de dano e você foi derrotado!</span>`;
            combatendo = false;
            modoAuto = false;
            atualizarBotaoAutoUI();
            return;
        }

        elLog.innerHTML = `O ${monstro.nome} te atacou e causou <strong>${danoMonstro}</strong> de dano!`;
        if (btnAtacar) btnAtacar.disabled = false;
        combatendo = false;

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
    let tempoRestante = 10; // 👈 Mude de 4 para 10 aqui
    
    const interval = setInterval(() => {
        if (elLog) {
            elLog.innerHTML = `<span style="color:#00ff88;">Monstro derrotado! Novo ${monstro.nome} surgirá em ${tempoRestante}s...</span>`;
        }
        tempoRestante--;

        if (tempoRestante < 0) {
            clearInterval(interval);
            combatendo = false;
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