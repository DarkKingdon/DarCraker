// public/motores/motor_combate.js
import { concederRecompensas } from './motor_status_heroi.js';
import { iniciarCombate } from '../modulos/modulo_tela_de_combate.js';
import { carregarStatus } from '../modulos/modulo_menu_esquerdo.js';
import { abrirModalFinalDoCombate } from '../modulos/modais/combate/modal_final_do_combate.js';
import { registrarLoot } from '../modulos/modais/hunting_analyser/modal_hunting_analyser.js';
import { registrarLootNoAnalyser } from '../modulos/modais/loot_analyser/modal_loot_analyser.js';

let combatendo = false;
let modoAuto = false;

export function getModoAuto() {
    return modoAuto;
}

// 🎯 Nova Função para formatar o texto das barras (número absoluto ou %)
export function atualizarTextosBarras(heroi, monstro) {
    const usarPorcentagem = localStorage.getItem('opcoes_exibir_porcentagem') === 'true';

    const elTextHpHeroi = document.getElementById('text-hp-heroi');
    const elTextMpHeroi = document.getElementById('text-mp-heroi');
    const elTextHpMonstro = document.getElementById('text-hp-monstro');
    const elTextMpMonstro = document.getElementById('text-mp-monstro');

    // Herói
    if (elTextHpHeroi) {
        if (usarPorcentagem) {
            const pct = Math.max(0, Math.round((heroi.vida_atual / heroi.vida_maxima) * 100));
            elTextHpHeroi.innerText = `${pct}%`;
        } else {
            elTextHpHeroi.innerText = `${Math.max(0, heroi.vida_atual)} - ${heroi.vida_maxima}`;
        }
    }
    if (elTextMpHeroi) {
        if (usarPorcentagem) {
            const pct = Math.max(0, Math.round((heroi.mana_atual / heroi.mana_maxima) * 100));
            elTextMpHeroi.innerText = `${pct}%`;
        } else {
            elTextMpHeroi.innerText = `${Math.max(0, heroi.mana_atual)} - ${heroi.mana_maxima}`;
        }
    }

    // Monstro
    if (elTextHpMonstro) {
        if (usarPorcentagem) {
            const pct = Math.max(0, Math.round((monstro.vida_atual / monstro.vida_maxima) * 100));
            elTextHpMonstro.innerText = `${pct}%`;
        } else {
            elTextHpMonstro.innerText = `${Math.max(0, monstro.vida_atual)} - ${monstro.vida_maxima}`;
        }
    }
    if (elTextMpMonstro) {
        const manaAtual = monstro.mana_atual ?? 0;
        const manaMax = monstro.mana_maxima ?? 0;
        if (usarPorcentagem) {
            const pct = manaMax > 0 ? Math.max(0, Math.round((manaAtual / manaMax) * 100)) : 0;
            elTextMpMonstro.innerText = `${pct}%`;
        } else {
            elTextMpMonstro.innerText = `${Math.max(0, manaAtual)} - ${manaMax}`;
        }
    }
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
    atualizarTextosBarras(heroiAtual, monstro);

    // Se o monstro morrer com este golpe
    if (monstro.vida_atual <= 0) {
        elLog.innerHTML = `<span style="color:#00ff88;">Você deu <strong>${danoHeroi}</strong> de dano e derrotou o ${monstro.nome}!</span>`;
        
        concederRecompensas(monstro, treinoSelecionado);

        const heroiAtual = JSON.parse(localStorage.getItem('heroi'));
        fetch('/api/combate/drop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: heroiAtual.id, monstro_id: monstro.id })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.dropsObtidos && data.dropsObtidos.length > 0) {
                data.dropsObtidos.forEach(drop => {
                    const valorUnitario = drop.item.valor_de_venda || 0;
                    const qtd = drop.quantidade || 1;
                    registrarLoot(valorUnitario * qtd);
                    registrarLootNoAnalyser(drop.item, qtd);
                });
            }

            abrirModalFinalDoCombate(monstro, treinoSelecionado, data);
        });

        agendarRenascerMonstro(monstro, elLog);
        return;
    }

    elLog.innerHTML = `Você deu <strong>${danoHeroi}</strong> de dano. Aguarde a resposta do ${monstro.nome}...`;

    // 2. TEMPORIZADOR DE 5 SEGUNDOS PARA O CONTRA-ATAQUE
    iniciarTemporizador(5000, timerContainer, timerBar, () => {
        // 💡 RELEITURA DO HERÓI: Garante que se o herói usou um item (como maçã) durante a contagem,
        // a nova vida atualizada seja lida do localStorage antes do monstro causar dano.
        heroiAtual = JSON.parse(localStorage.getItem('heroi')) || heroiAtual;

        const danoMonstro = Math.max(0, Math.floor(Math.random() * (monstro.ataque_maximo - monstro.ataque_minimo + 1)) + monstro.ataque_minimo - (heroiAtual.defesa_minima || 0));
        
        heroiAtual.vida_atual = Math.max(0, heroiAtual.vida_atual - danoMonstro);

        localStorage.setItem('heroi', JSON.stringify(heroiAtual));
        carregarStatus();

        if (elHpHeroi) elHpHeroi.style.width = `${Math.max(0, (heroiAtual.vida_atual / heroiAtual.vida_maxima) * 100)}%`;
        atualizarTextosBarras(heroiAtual, monstro);

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
            }, 500);
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
    let tempoRestante = 10;
    
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