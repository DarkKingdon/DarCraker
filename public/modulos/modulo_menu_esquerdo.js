import { adicionarPontoAtributo } from '../motores/motor_status_heroi.js';

function aplicarEstilosEsquerdo() {
    if (document.getElementById('estilo-menu-esquerdo')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-esquerdo';
    style.innerHTML = `
        .side-panel-left {
            border: 2px solid #ffd700;
            background-color: #121212;
            padding: 10px;
            border-radius: 6px;
            display: flex; flex-direction: column; gap: 10px;
        }

        .status-box {
            border: 2px solid #ff3333;
            background-color: #1e1e1e;
            padding: 15px; border-radius: 6px;
        }

        .status-box h3 { font-size: 16px; color: #ff3333; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px; }
        .status-box p { font-size: 14px; margin-bottom: 6px; }
        .status-box hr { border: 0; border-top: 1px dashed #444; margin: 8px 0; }

        .btn-add-ponto {
            background-color: #00ff88; color: #000; border: none; font-weight: bold;
            border-radius: 3px; cursor: pointer; width: 18px; height: 18px;
            line-height: 18px; text-align: center; display: inline-block; margin-right: 5px;
        }

        .barra-container {
            width: 100%; background-color: #333; border-radius: 4px; height: 12px;
            margin-top: 2px; margin-bottom: 8px; overflow: hidden; border: 1px solid #555; position: relative;
        }
        .barra-progresso-forca { height: 100%; background-color: #ff9900; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-protecao { height: 100%; background-color: #0099ff; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-vitalidade { height: 100%; background-color: #28a745; width: 0%; transition: width 0.3s ease; }
        .barra-progresso-inteligencia { height: 100%; background-color: #9933ff; width: 0%; transition: width 0.3s ease; }

        .barra-texto {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            font-size: 9px; color: #fff; display: flex; align-items: center;
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
                <h3>Status do Herói</h3>
                <p><strong>Nome:</strong> <span id="heroi-nome">---</span></p>
                <p><strong>Nível:</strong> <span id="heroi-nivel">1</span></p>
                <p><strong>Pontos Disp.:</strong> <span id="heroi-pontos-disponiveis" style="color: #00ff88;">0</span></p>
                <p><strong>Exp:</strong> <span id="heroi-exp">--/--</span></p>
                <p><strong>Vida:</strong> <span id="heroi-vida">--/--</span></p>
                <p><strong>Mana:</strong> <span id="heroi-mana">--/--</span></p>
                
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
    document.getElementById('heroi-exp').innerText = `${heroi.exp_atual ?? 0} / ${heroi.exp_next_nivel ?? 10}`;
    document.getElementById('heroi-vida').innerText = `${heroi.vida_atual ?? 0} / ${heroi.vida_maxima ?? 10}`;
    document.getElementById('heroi-mana').innerText = `${heroi.mana_atual ?? 15} / ${heroi.mana_maxima ?? 15}`;
    document.getElementById('heroi-forca').innerText = heroi.forca ?? 1;
    document.getElementById('heroi-protecao').innerText = heroi.protecao ?? 1;
    document.getElementById('heroi-vitalidade').innerText = heroi.vitalidade ?? 1;
    document.getElementById('heroi-inteligencia').innerText = heroi.inteligencia ?? 1;
    document.getElementById('heroi-ataque').innerText = `${heroi.ataque_minimo ?? 1} - ${heroi.ataque_maximo ?? 2}`;
    document.getElementById('heroi-defesa').innerText = `${heroi.defesa_minima ?? 1} - ${heroi.defesa_maxima ?? 2}`;

    // Exibir/Ocultar os botões de adicionar ponto "+"
    const temPontos = (heroi.ponto_disponivel ?? 0) > 0;
    ['forca', 'protecao', 'vitalidade', 'inteligencia'].forEach(attr => {
        const btn = document.getElementById(`btn-add-${attr}`);
        if (btn) btn.style.display = temPontos ? 'inline-block' : 'none';
    });

    // Atualiza barras de EXP dos treinos
    const atualizarBarra = (idBarra, idTexto, atual, max) => {
        const porc = Math.min(100, Math.max(0, (atual / max) * 100));
        document.getElementById(idBarra).style.width = `${porc}%`;
        document.getElementById(idTexto).innerText = `${atual} / ${max}`;
    };

    atualizarBarra('barra-exp-forca', 'texto-exp-forca', heroi.exp_atual_forca ?? 0, heroi.exp_next_nivel_forca ?? 10);
    atualizarBarra('barra-exp-protecao', 'texto-exp-protecao', heroi.exp_atual_protecao ?? 0, heroi.exp_next_nivel_protecao ?? 10);
    atualizarBarra('barra-exp-vitalidade', 'texto-exp-vitalidade', heroi.exp_atual_vitalidade ?? 0, heroi.exp_next_nivel_vitalidade ?? 10);
    atualizarBarra('barra-exp-inteligencia', 'texto-exp-inteligencia', heroi.exp_atual_inteligencia ?? 0, heroi.exp_next_nivel_inteligencia ?? 10);
}

export function inicializarMenuEsquerdo() {
    aplicarEstilosEsquerdo();
    renderizarHTMLEsquerdo();
    carregarStatus();

    // Eventos dos botões "+"
    ['forca', 'protecao', 'vitalidade', 'inteligencia'].forEach(attr => {
        document.getElementById(`btn-add-${attr}`)?.addEventListener('click', () => adicionarPontoAtributo(attr));
    });
}