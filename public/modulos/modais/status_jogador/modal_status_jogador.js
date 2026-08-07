// public/modulos/modais/status_jogador/modal_status_jogador.js

import { adicionarPontoAtributo } from '../../../motores/motor_status_heroi.js';

function aplicarEstilosModalStatus() {
    if (document.getElementById('estilo-modal-status-jogador')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-status-jogador';
    style.innerHTML = `
        .modal-status-overlay {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.75);
            display: none; justify-content: center; align-items: center;
            z-index: 1000;
        }
        .modal-status-content {
            background-color: #1a1a1a;
            border: 2px solid #ff3333;
            border-radius: 8px;
            width: 360px;
            padding: 15px;
            box-shadow: 0 0 15px rgba(255, 51, 51, 0.4);
            color: #fff;
            font-family: Arial, sans-serif;
        }
        .modal-status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            font-weight: bold;
            color: #ff3333;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .btn-fechar-modal-status {
            background: transparent;
            border: none;
            color: #ff3333;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
        }
        .modal-status-body p { font-size: 14px; margin-bottom: 6px; }
        .modal-status-body hr { border: 0; border-top: 1px dashed #444; margin: 8px 0; }

        .btn-add-ponto {
            background-color: #00ff88; color: #000; border: none; font-weight: bold;
            border-radius: 3px; cursor: pointer; width: 18px; height: 18px;
            line-height: 18px; text-align: center; display: inline-block; margin-right: 5px;
        }

        /* 🎨 BARRAS DE PROGRESSO */
        .barra-container {
            width: 100%; background-color: #333; border-radius: 4px; height: 14px;
            margin-top: 2px; margin-bottom: 8px; overflow: hidden; border: 1px solid #555; position: relative;
        }
        
        /* Cores das Barras */
        .barra-progresso-exp { height: 100%; background-color: #00ff88; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-vida { height: 100%; background-color: #ff3333; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-mana { height: 100%; background-color: #0099ff; width: 0%; transition: width 0.3s ease; }
        
        .barra-progresso-forca { height: 100%; background-color: #ff9900; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-protecao { height: 100%; background-color: #00ffff; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-vitalidade { height: 100%; background-color: #28a745; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-inteligencia { height: 100%; background-color: #9933ff; width: 0%; transition: width 0.3s ease; }

        .barra-texto {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            font-size: 10px; color: #fff; display: flex; align-items: center;
            justify-content: center; font-weight: bold; text-shadow: 1px 1px 2px #000;
        }
    `;
    document.head.appendChild(style);
}

export function abrirModalStatus() {
    aplicarEstilosModalStatus();

    let modal = document.getElementById('modal-status-jogador');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-status-jogador';
        modal.className = 'modal-status-overlay';
        document.body.appendChild(modal);
    }

    const heroiData = localStorage.getItem('heroi');
    const heroi = heroiData ? JSON.parse(heroiData) : {};

    const temPontos = (heroi.ponto_disponivel ?? 0) > 0;
    const btnAdd = (attr) => temPontos ? `<button class="btn-add-ponto modal-btn-add" data-attr="${attr}">+</button>` : '';

    const getPorcentagem = (atual, max) => Math.min(100, Math.max(0, ((atual || 0) / (max || 1)) * 100));

    // EXP, Vida e Mana
    const expNivelAtual = heroi.exp_atual ?? 0;
    const expNivelNext = heroi.exp_next_nivel ?? 10;
    const vidaAtual = heroi.vida_atual ?? 0;
    const vidaMax = heroi.vida_maxima ?? 10;
    const manaAtual = heroi.mana_atual ?? 0;
    const manaMax = heroi.mana_maxima ?? 15;

    // Treinos
    const expForcaAtual = heroi.exp_atual_forca ?? 0;
    const expForcaNext = heroi.exp_next_nivel_forca ?? 10;
    const expProtAtual = heroi.exp_atual_protecao ?? 0;
    const expProtNext = heroi.exp_next_nivel_protecao ?? 10;
    const expVitAtual = heroi.exp_atual_vitalidade ?? 0;
    const expVitNext = heroi.exp_next_nivel_vitalidade ?? 10;
    const expIntelAtual = heroi.exp_atual_inteligencia ?? 0;
    const expIntelNext = heroi.exp_next_nivel_inteligencia ?? 10;

    modal.innerHTML = `
        <div class="modal-status-content">
            <div class="modal-status-header">
                <span>⚔️ Detalhes do Herói</span>
                <button id="btn-fechar-modal-status" class="btn-fechar-modal-status">✖</button>
            </div>
            <div class="modal-status-body">
                <p><strong>Nome:</strong> <span>${heroi.nome_heroi || 'Desconhecido'}</span></p>
                <p><strong>Nível:</strong> <span>${heroi.nivel ?? 1}</span></p>
                <p><strong>Pontos Disp.:</strong> <span style="color: #00ff88;">${heroi.ponto_disponivel ?? 0}</span></p>
                
                <!-- BARRINHA DE EXP DO HERÓI -->
                <p><strong>Experiência:</strong></p>
                <div class="barra-container">
                    <div class="barra-progresso-exp" style="width: ${getPorcentagem(expNivelAtual, expNivelNext)}%;"></div>
                    <span class="barra-texto">${expNivelAtual} / ${expNivelNext}</span>
                </div>

                <!-- BARRINHA DE VIDA -->
                <p><strong>Vida:</strong></p>
                <div class="barra-container">
                    <div class="barra-progresso-vida" style="width: ${getPorcentagem(vidaAtual, vidaMax)}%;"></div>
                    <span class="barra-texto">${vidaAtual} / ${vidaMax}</span>
                </div>

                <!-- BARRINHA DE MANA -->
                <p><strong>Mana:</strong></p>
                <div class="barra-container">
                    <div class="barra-progresso-mana" style="width: ${getPorcentagem(manaAtual, manaMax)}%;"></div>
                    <span class="barra-texto">${manaAtual} / ${manaMax}</span>
                </div>
                
                <hr>

                <!-- FORÇA -->
                <p>${btnAdd('forca')}<strong>Força:</strong> <span>${heroi.forca ?? 1}</span></p>
                <div class="barra-container">
                    <div class="barra-progresso-forca" style="width: ${getPorcentagem(expForcaAtual, expForcaNext)}%;"></div>
                    <span class="barra-texto">${expForcaAtual} / ${expForcaNext}</span>
                </div>

                <!-- PROTEÇÃO -->
                <p>${btnAdd('protecao')}<strong>Proteção:</strong> <span>${heroi.protecao ?? 1}</span></p>
                <div class="barra-container">
                    <div class="barra-progresso-protecao" style="width: ${getPorcentagem(expProtAtual, expProtNext)}%;"></div>
                    <span class="barra-texto">${expProtAtual} / ${expProtNext}</span>
                </div>

                <!-- VITALIDADE -->
                <p>${btnAdd('vitalidade')}<strong>Vitalidade:</strong> <span>${heroi.vitalidade ?? 1}</span></p>
                <div class="barra-container">
                    <div class="barra-progresso-vitalidade" style="width: ${getPorcentagem(expVitAtual, expVitNext)}%;"></div>
                    <span class="barra-texto">${expVitAtual} / ${expVitNext}</span>
                </div>

                <!-- INTELIGÊNCIA -->
                <p>${btnAdd('inteligencia')}<strong>Inteligência:</strong> <span>${heroi.inteligencia ?? 1}</span></p>
                <div class="barra-container">
                    <div class="barra-progresso-inteligencia" style="width: ${getPorcentagem(expIntelAtual, expIntelNext)}%;"></div>
                    <span class="barra-texto">${expIntelAtual} / ${expIntelNext}</span>
                </div>
                
                <hr>

                <p><strong>Ataque:</strong> <span>${heroi.ataque_minimo ?? 1} - ${heroi.ataque_maximo ?? 2}</span></p>
                <p><strong>Defesa:</strong> <span>${heroi.defesa_minima ?? 1} - ${heroi.defesa_maxima ?? 2}</span></p>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('btn-fechar-modal-status').onclick = () => modal.style.display = 'none';

    modal.querySelectorAll('.modal-btn-add').forEach(btn => {
        btn.onclick = (e) => {
            const attr = e.target.getAttribute('data-attr');
            adicionarPontoAtributo(attr);
            abrirModalStatus();
        };
    });
}