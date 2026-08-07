// public/motores/motor_status_heroi.js
import { carregarStatus } from '../modulos/modulo_menu_esquerdo.js';
import { registrarExp } from '../modulos/modais/hunting_analyser/modal_hunting_analyser.js'; // 👈 Adicionado

export async function concederRecompensas(monstro, treinoSelecionado) {
    let heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    // 1. EXP de Nível Geral
    const expNivel = monstro.recompensa_exp_atual || 1;
    heroi.exp_atual = (heroi.exp_atual ?? 0) + expNivel;

    // 📊 REGISTRA A XP NO HUNTING ANALYSER
    registrarExp(expNivel);

    if (heroi.exp_atual >= (heroi.exp_next_nivel ?? 10)) {
        heroi.nivel = (heroi.nivel ?? 1) + 1;
        heroi.exp_atual = heroi.exp_atual - heroi.exp_next_nivel;
        heroi.ponto_disponivel = (heroi.ponto_disponivel ?? 0) + 1;

        // 🔄 BUSCA A EXP DO PRÓXIMO NÍVEL NA TABELA DO BANCO
        try {
            const resposta = await fetch('/api/heroi/tabela-niveis');
            const tabelaNiveis = await resposta.json();
            
            // Procura o registro correspondente ao novo nível do herói
            const proximoNivelDados = tabelaNiveis.find(n => n.nivel === heroi.nivel);
            
            if (proximoNivelDados) {
                heroi.exp_next_nivel = proximoNivelDados.exp_next_nivel;
            } else {
                // Caso o herói passe do último nível cadastrado na tabela (Fallback)
                heroi.exp_next_nivel = Math.floor(heroi.exp_next_nivel * 1.5);
            }
        } catch (e) {
            console.error("Erro ao buscar próximo nível da tabela:", e);
            heroi.exp_next_nivel = Math.floor(heroi.exp_next_nivel * 1.5);
        }

        alert(`🎉 PARABÉNS! Você subiu para o Nível ${heroi.nivel}! Ganhou +1 Ponto Disponível.`);
    }

    // 2. EXP do Treino Selecionado
    if (treinoSelecionado) {
        const campoExpAtual = `exp_atual_${treinoSelecionado}`;
        const campoExpNext = `exp_next_nivel_${treinoSelecionado}`;
        const campoRecompensa = `recompensa_exp_atual_${treinoSelecionado}`;

        heroi[campoExpAtual] = (heroi[campoExpAtual] ?? 0) + (monstro[campoRecompensa] || 1);

        if (heroi[campoExpAtual] >= (heroi[campoExpNext] ?? 10)) {
            heroi[treinoSelecionado] = (heroi[treinoSelecionado] ?? 1) + 1;
            heroi[campoExpAtual] = heroi[campoExpAtual] - heroi[campoExpNext];
            heroi[campoExpNext] = Math.floor(heroi[campoExpNext] * 1.5);
            
            // Recalcular Ataque e Defesa baseados nos status
            recalcularStatusHeroi(heroi);
            alert(`💪 Seu treino deu frutos! ${treinoSelecionado.toUpperCase()} subiu para ${heroi[treinoSelecionado]}!`);
        }
    }

    localStorage.setItem('heroi', JSON.stringify(heroi));
    carregarStatus();
    salvarNoServidor(heroi);
}

export function adicionarPontoAtributo(atributo) {
    let heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi || (heroi.ponto_disponivel ?? 0) <= 0) return;

    heroi.ponto_disponivel -= 1;
    heroi[atributo] = (heroi[atributo] ?? 1) + 1;

    recalcularStatusHeroi(heroi);

    localStorage.setItem('heroi', JSON.stringify(heroi));
    carregarStatus();
    salvarNoServidor(heroi);
}

function recalcularStatusHeroi(heroi) {
    heroi.ataque_minimo = heroi.forca;
    heroi.ataque_maximo = heroi.forca * 2;
    heroi.defesa_minima = heroi.protecao;
    heroi.defesa_maxima = heroi.protecao * 2;
    heroi.vida_maxima = 10 + (heroi.vitalidade * 5);
    heroi.mana_maxima = 10 + (heroi.inteligencia * 5);
}

async function salvarNoServidor(heroi) {
    try {
        await fetch(`/api/heroi/${heroi.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(heroi)
        });
    } catch (e) {
        console.error("Erro ao sincronizar com o banco de dados:", e);
    }
}