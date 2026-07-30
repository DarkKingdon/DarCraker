// public/modulos/modulo_menu_esquerdo.js

function aplicarEstilosEsquerdo() {
    if (document.getElementById('estilo-menu-esquerdo')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-esquerdo';
    style.innerHTML = `
        /* 🟡 RETÂNGULO AMARELO (Painel Esquerdo) */
        .side-panel-left {
            border: 2px solid #ffd700;
            background-color: #121212;
            padding: 10px;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        /* 🔴 RETÂNGULO VERMELHO (Painel de Status do Herói) */
        .status-box {
            border: 2px solid #ff3333;
            background-color: #1e1e1e;
            padding: 15px;
            border-radius: 6px;
            display: block;
        }

        .status-box h3 {
            font-size: 16px;
            color: #ff3333;
            margin-bottom: 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        }

        .status-box p {
            font-size: 14px;
            margin-bottom: 6px;
        }

        .status-box hr {
            border: 0;
            border-top: 1px dashed #444;
            margin: 8px 0;
        }

        /* 📊 ESTILO DAS BARRAS DE EXP */
        .barra-container {
            width: 100%;
            background-color: #333;
            border-radius: 4px;
            height: 12px;
            margin-top: 2px;
            margin-bottom: 8px;
            overflow: hidden;
            border: 1px solid #555;
            position: relative;
        }

        .barra-progresso-forca {
            height: 100%;
            background-color: #ff9900; /* Laranja - Força */
            width: 0%;
            transition: width 0.3s ease;
        }

        .barra-progresso-protecao {
            height: 100%;
            background-color: #0099ff; /* Azul - Proteção */
            width: 0%;
            transition: width 0.3s ease;
        }

        .barra-progresso-vitalidade {
            height: 100%;
            background-color: #28a745; /* Verde - Vitalidade */
            width: 0%;
            transition: width 0.3s ease;
        }

        .barra-progresso-inteligencia {
            height: 100%;
            background-color: #9933ff; /* Roxo - Inteligência */
            width: 0%;
            transition: width 0.3s ease;
        }

        .barra-texto {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            font-size: 9px;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            text-shadow: 1px 1px 2px #000;
        }
    `;
    document.head.appendChild(style);
}

function renderizarHTMLEsquerto() {
    const container = document.getElementById('painel-esquerdo');
    if (container) {
        container.className = 'side-panel-left';
        container.innerHTML = `
            <!-- 🔴 PAINEL DE STATUS (VERMELHO) -->
            <div id="painel-status" class="status-box">
                <h3>Status do Herói</h3>
                <p><strong>Nome:</strong> <span id="heroi-nome">---</span></p>
                <p><strong>Nível:</strong> <span id="heroi-nivel">1</span></p>
                <p><strong>Exp:</strong> <span id="heroi-exp">--/--</span></p>
                <p><strong>Vida:</strong> <span id="heroi-vida">--/--</span></p>
                <p><strong>Mana:</strong> <span id="heroi-mana">--/--</span></p>
                
                <hr>

                <p><strong>Força:</strong> <span id="heroi-forca">1</span></p>
                <!-- BARRINHA DE EXP DE FORÇA -->
                <div class="barra-container">
                    <div id="barra-exp-forca" class="barra-progresso-forca"></div>
                    <span id="texto-exp-forca" class="barra-texto">0 / 10</span>
                </div>

                <p><strong>Proteção:</strong> <span id="heroi-protecao">1</span></p>
                <!-- BARRINHA DE EXP DE PROTEÇÃO -->
                <div class="barra-container">
                    <div id="barra-exp-protecao" class="barra-progresso-protecao"></div>
                    <span id="texto-exp-protecao" class="barra-texto">0 / 10</span>
                </div>

                <p><strong>Vitalidade:</strong> <span id="heroi-vitalidade">1</span></p>
                <!-- BARRINHA DE EXP DE VITALIDADE -->
                <div class="barra-container">
                    <div id="barra-exp-vitalidade" class="barra-progresso-vitalidade"></div>
                    <span id="texto-exp-vitalidade" class="barra-texto">0 / 10</span>
                </div>

                <p><strong>Inteligência:</strong> <span id="heroi-inteligencia">1</span></p>
                <!-- BARRINHA DE EXP DE INTELIGÊNCIA -->
                <div class="barra-container">
                    <div id="barra-exp-inteligencia" class="barra-progresso-inteligencia"></div>
                    <span id="texto-exp-inteligencia" class="barra-texto">0 / 10</span>
                </div>
                
                <hr>

                <p><strong>Ataque:</strong> <span id="heroi-ataque">1 - 2</span></p>
                <p><strong>Defesa:</strong> <span id="heroi-defesa">1 - 2</span></p>
            </div>
        `;
    }
}

export function carregarStatus() {
    const heroiData = localStorage.getItem('heroi');

    if (!heroiData) {
        window.location.href = 'index.html';
        return;
    }

    const heroi = JSON.parse(heroiData);

    const elNome        = document.getElementById('heroi-nome');
    const elNivel       = document.getElementById('heroi-nivel');
    const elExp         = document.getElementById('heroi-exp');
    const elVida        = document.getElementById('heroi-vida');
    const elMana        = document.getElementById('heroi-mana');
    const elForca       = document.getElementById('heroi-forca');
    const elProtecao    = document.getElementById('heroi-protecao');
    const elVitalidade  = document.getElementById('heroi-vitalidade');
    const elInteligencia= document.getElementById('heroi-inteligencia');
    const elAtaque      = document.getElementById('heroi-ataque');
    const elDefesa      = document.getElementById('heroi-defesa');

    // Elementos das barras de exp
    const barraExpForca        = document.getElementById('barra-exp-forca');
    const textoExpForca        = document.getElementById('texto-exp-forca');
    const barraExpProtecao     = document.getElementById('barra-exp-protecao');
    const textoExpProtecao     = document.getElementById('texto-exp-protecao');
    const barraExpVitalidade   = document.getElementById('barra-exp-vitalidade');
    const textoExpVitalidade   = document.getElementById('texto-exp-vitalidade');
    const barraExpInteligencia = document.getElementById('barra-exp-inteligencia');
    const textoExpInteligencia = document.getElementById('texto-exp-inteligencia');

    if (elNome)         elNome.innerText         = heroi.nome_heroi || 'Desconhecido';
    if (elNivel)        elNivel.innerText        = heroi.nivel ?? 1;
    if (elExp)          elExp.innerText          = `${heroi.exp_atual ?? 0} / ${heroi.exp_next_nivel ?? 10}`;
    if (elVida)         elVida.innerText         = `${heroi.vida_atual ?? 0} / ${heroi.vida_maxima ?? 0}`;
    if (elMana)         elMana.innerText         = `${heroi.mana_atual ?? 15} / ${heroi.mana_maxima ?? 15}`;
    if (elForca)        elForca.innerText        = heroi.forca ?? 1;
    if (elProtecao)     elProtecao.innerText     = heroi.protecao ?? 1;
    if (elVitalidade)   elVitalidade.innerText   = heroi.vitalidade ?? 1;
    if (elInteligencia) elInteligencia.innerText = heroi.inteligencia ?? 1;
    if (elAtaque)       elAtaque.innerText       = `${heroi.ataque_minimo ?? 1} - ${heroi.ataque_maximo ?? 2}`;
    if (elDefesa)       elDefesa.innerText       = `${heroi.defesa_minima ?? 1} - ${heroi.defesa_maxima ?? 2}`;

    // Atualizando a barra de EXP de Força
    const expAtualForca = heroi.exp_atual_forca ?? 0;
    const expNextForca  = heroi.exp_next_nivel_forca ?? 10;
    const porcForca     = Math.min(100, Math.max(0, (expAtualForca / expNextForca) * 100));

    if (barraExpForca) barraExpForca.style.width = `${porcForca}%`;
    if (textoExpForca) textoExpForca.innerText   = `${expAtualForca} / ${expNextForca}`;

    // Atualizando a barra de EXP de Proteção
    const expAtualProtecao = heroi.exp_atual_protecao ?? 0;
    const expNextProtecao  = heroi.exp_next_nivel_protecao ?? 10;
    const porcProtecao     = Math.min(100, Math.max(0, (expAtualProtecao / expNextProtecao) * 100));

    if (barraExpProtecao) barraExpProtecao.style.width = `${porcProtecao}%`;
    if (textoExpProtecao) textoExpProtecao.innerText   = `${expAtualProtecao} / ${expNextProtecao}`;

    // Atualizando a barra de EXP de Vitalidade
    const expAtualVit = heroi.exp_atual_vitalidade ?? 0;
    const expNextVit  = heroi.exp_next_nivel_vitalidade ?? 10;
    const porcVit     = Math.min(100, Math.max(0, (expAtualVit / expNextVit) * 100));

    if (barraExpVitalidade) barraExpVitalidade.style.width = `${porcVit}%`;
    if (textoExpVitalidade) textoExpVitalidade.innerText   = `${expAtualVit} / ${expNextVit}`;

    // Atualizando a barra de EXP de Inteligência
    const expAtualInt = heroi.exp_atual_inteligencia ?? 0;
    const expNextInt  = heroi.exp_next_nivel_inteligencia ?? 10;
    const porcInt     = Math.min(100, Math.max(0, (expAtualInt / expNextInt) * 100));

    if (barraExpInteligencia) barraExpInteligencia.style.width = `${porcInt}%`;
    if (textoExpInteligencia) textoExpInteligencia.innerText   = `${expAtualInt} / ${expNextInt}`;
}

export function inicializarMenuEsquerdo() {
    aplicarEstilosEsquerdo();
    renderizarHTMLEsquerto();
    carregarStatus();
}