import { adicionarPontoAtributo } from '../motores/motor_status_heroi.js';

function aplicarEstilosEsquerdo() {
    if (document.getElementById('estilo-menu-esquerdo')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-esquerdo';
    style.innerHTML = `
        .side-panel-left {
            border: 2px solid #ffd700;
            background-color: #22222296;
            padding: 10px;
            border-radius: 6px;
            display: flex; flex-direction: column; gap: 10px;
        }

        .status-box {
            border: 2px solid #ff3333;
            background-color: #1e1e1e;
            padding: 15px; border-radius: 6px;
        }

        .status-header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .status-header-container h3 {
            font-size: 16px;
            color: #ff3333;
            margin: 0;
            border: none;
        }

        .btn-toggle-status {
            background-color: #333;
            color: #ff3333;
            border: 1px solid #ff3333;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            width: 22px;
            height: 22px;
            line-height: 18px;
            text-align: center;
        }

        .btn-toggle-status:hover {
            background-color: #ff3333;
            color: #000;
        }

        .status-box p { font-size: 14px; margin-bottom: 6px; }
        .status-box hr { border: 0; border-top: 1px dashed #444; margin: 8px 0; }

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

function renderizarHTMLEsquerdo() {
    const container = document.getElementById('painel-esquerdo');
    if (container) {
        container.className = 'side-panel-left';
        container.innerHTML = `
            <div id="painel-status" class="status-box">
                <div class="status-header-container">
                    <h3>Status do Herói</h3>
                    <button id="btn-toggle-painel-status" class="btn-toggle-status">-</button>
                </div>

                <div id="status-corpo-conteudo">
                    <p><strong>Nome:</strong> <span id="heroi-nome">---</span></p>
                    <p><strong>Nível:</strong> <span id="heroi-nivel">1</span></p>
                    <p><strong>Pontos Disponíveis:</strong> <span id="heroi-pontos-disponiveis" style="color: #00ff88;">0</span></p>
                    
                    <!-- BARRA DE EXP -->
                    <p><strong>Exp:</strong></p>
                    <div class="barra-container">
                        <div id="barra-exp-nivel" class="barra-progresso-exp"></div>
                        <span id="texto-exp-nivel" class="barra-texto">0 / 10</span>
                    </div>

                    <!-- BARRA DE VIDA -->
                    <p><strong>Vida:</strong></p>
                    <div class="barra-container">
                        <div id="barra-vida" class="barra-progresso-vida"></div>
                        <span id="texto-vida" class="barra-texto">0 / 10</span>
                    </div>

                    <!-- BARRA DE MANA -->
                    <p><strong>Mana:</strong></p>
                    <div class="barra-container">
                        <div id="barra-mana" class="barra-progresso-mana"></div>
                        <span id="texto-mana" class="barra-texto">0 / 15</span>
                    </div>
                    
                    <hr>

                    <p><button id="btn-add-forca" class="btn-add-ponto" style="display:none;">+</button><strong>Força:</strong> <span id="heroi-forca">1</span></p>
                    <div class="barra-container">
                        <div id="barra-exp-forca" class="barra-progresso-forca"></div>
                        <span id="texto-exp-forca" class="barra-texto">0 / 10</span>
                    </div>

                    <p><button id="btn-add-protecao" class="btn-add-ponto" style="display:none;">+</button><strong>Proteção:</strong> <span id="heroi-protecao">1</span></p>
                    <div class="barra-container">
                        <div id="barra-exp-protecao" class="barra-progresso-protecao"></div>
                        <span id="texto-exp-protecao" class="barra-texto">0 / 10</span>
                    </div>

                    <p><button id="btn-add-vitalidade" class="btn-add-ponto" style="display:none;">+</button><strong>Vitalidade:</strong> <span id="heroi-vitalidade">1</span></p>
                    <div class="barra-container">
                        <div id="barra-exp-vitalidade" class="barra-progresso-vitalidade"></div>
                        <span id="texto-exp-vitalidade" class="barra-texto">0 / 10</span>
                    </div>

                    <p><button id="btn-add-inteligencia" class="btn-add-ponto" style="display:none;">+</button><strong>Inteligência:</strong> <span id="heroi-inteligencia">1</span></p>
                    <div class="barra-container">
                        <div id="barra-exp-inteligencia" class="barra-progresso-inteligencia"></div>
                        <span id="texto-exp-inteligencia" class="barra-texto">0 / 10</span>
                    </div>
                    
                    <hr>

                    <p><strong>Ataque:</strong> <span id="heroi-ataque">1 - 2</span></p>
                    <p><strong>Defesa:</strong> <span id="heroi-defesa">1 - 2</span></p>
                </div>
            </div>
        `;
    }
}

export function carregarStatus() {
    const heroiData = localStorage.getItem('heroi');
    if (!heroiData) return;

    const heroi = JSON.parse(heroiData);

    document.getElementById('heroi-nome').innerText = heroi.nome_heroi || 'Desconhecido';
    document.getElementById('heroi-nivel').innerText = heroi.nivel ?? 1;
    document.getElementById('heroi-pontos-disponiveis').innerText = heroi.ponto_disponivel ?? 0;
    
    document.getElementById('heroi-forca').innerText = heroi.forca ?? 1;
    document.getElementById('heroi-protecao').innerText = heroi.protecao ?? 1;
    document.getElementById('heroi-vitalidade').innerText = heroi.vitalidade ?? 1;
    document.getElementById('heroi-inteligencia').innerText = heroi.inteligencia ?? 1;
    document.getElementById('heroi-ataque').innerText = `${heroi.ataque_minimo ?? 1} - ${heroi.ataque_maximo ?? 2}`;
    document.getElementById('heroi-defesa').innerText = `${heroi.defesa_minima ?? 1} - ${heroi.defesa_maxima ?? 2}`;

    const temPontos = (heroi.ponto_disponivel ?? 0) > 0;
    ['forca', 'protecao', 'vitalidade', 'inteligencia'].forEach(attr => {
        const btn = document.getElementById(`btn-add-${attr}`);
        if (btn) btn.style.display = temPontos ? 'inline-block' : 'none';
    });

    const atualizarBarra = (idBarra, idTexto, atual, max) => {
        const porc = Math.min(100, Math.max(0, ((atual || 0) / (max || 1)) * 100));
        const elBarra = document.getElementById(idBarra);
        const elTexto = document.getElementById(idTexto);
        if (elBarra) elBarra.style.width = `${porc}%`;
        if (elTexto) elTexto.innerText = `${atual || 0} / ${max || 1}`;
    };

    // Atualizando todas as barrinhas
    atualizarBarra('barra-exp-nivel', 'texto-exp-nivel', heroi.exp_atual ?? 0, heroi.exp_next_nivel ?? 10);
    atualizarBarra('barra-vida', 'texto-vida', heroi.vida_atual ?? 0, heroi.vida_maxima ?? 10);
    atualizarBarra('barra-mana', 'texto-mana', heroi.mana_atual ?? 0, heroi.mana_maxima ?? 15);

    atualizarBarra('barra-exp-forca', 'texto-exp-forca', heroi.exp_atual_forca ?? 0, heroi.exp_next_nivel_forca ?? 10);
    atualizarBarra('barra-exp-protecao', 'texto-exp-protecao', heroi.exp_atual_protecao ?? 0, heroi.exp_next_nivel_protecao ?? 10);
    atualizarBarra('barra-exp-vitalidade', 'texto-exp-vitalidade', heroi.exp_atual_vitalidade ?? 0, heroi.exp_next_nivel_vitalidade ?? 10);
    atualizarBarra('barra-exp-inteligencia', 'texto-exp-inteligencia', heroi.exp_atual_inteligencia ?? 0, heroi.exp_next_nivel_inteligencia ?? 10);
}

export function inicializarMenuEsquerdo() {
    aplicarEstilosEsquerdo();
    renderizarHTMLEsquerdo();
    carregarStatus();

    const btnToggle = document.getElementById('btn-toggle-painel-status');
    const corpoConteudo = document.getElementById('status-corpo-conteudo');

    if (btnToggle && corpoConteudo) {
        btnToggle.addEventListener('click', () => {
            if (corpoConteudo.style.display === 'none') {
                corpoConteudo.style.display = 'block';
                btnToggle.innerText = '-';
            } else {
                corpoConteudo.style.display = 'none';
                btnToggle.innerText = '+';
            }
        });
    }

    ['forca', 'protecao', 'vitalidade', 'inteligencia'].forEach(attr => {
        document.getElementById(`btn-add-${attr}`)?.addEventListener('click', () => adicionarPontoAtributo(attr));
    });
}