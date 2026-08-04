import { carregarStatus } from '../modulo_menu_esquerdo.js';

let intervalId = null;

function aplicarEstilosModalSantuario() {
    if (document.getElementById('estilo-modal-santuario')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-santuario';
    style.innerHTML = `
        .santuario-modal-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .santuario-modal-content {
            background: #121212;
            border: 2px solid #00a2ff;
            border-radius: 8px;
            width: 580px;
            max-width: 92%;
            padding: 20px;
            color: #fff;
            box-shadow: 0 0 20px rgba(0, 162, 255, 0.4);
            position: relative;
        }

        .santuario-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }

        .btn-fechar-santuario {
            background: transparent;
            border: none;
            color: #ff4d4d;
            font-size: 20px;
            cursor: pointer;
        }

        /* Seção Superior - Santuário */
        .santuario-info-bloco {
            display: flex;
            gap: 15px;
            align-items: center;
            background: #181818;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #333;
            margin-bottom: 20px;
        }

        .img-santuario-principal {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #00a2ff;
        }

        .santuario-descricao-texto h3 {
            color: #00a2ff;
            margin-bottom: 5px;
        }

        .santuario-descricao-texto p {
            font-size: 13px;
            color: #ccc;
            line-height: 1.4;
        }

        /* Seção Inferior - Restauração */
        .santuario-acao-bloco {
            display: flex;
            gap: 15px;
            align-items: center;
            background: #181818;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #222;
        }

        .santuario-coluna-acao {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
        }

        .img-restauracao {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #00ff88;
            cursor: pointer;
        }

        .status-cooldown {
            font-size: 12px;
            font-weight: bold;
            color: #00ff88;
        }

        .status-cooldown.em-cooldown {
            color: #ff4444;
        }

        .btn-usar-restauracao {
            background: #008844;
            color: #fff;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            transition: background 0.2s;
        }

        .btn-usar-restauracao:hover:not(:disabled) {
            background: #00b359;
        }

        .btn-usar-restauracao:disabled {
            background: #444;
            color: #888;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
}

export function abrirModalSantuario() {
    aplicarEstilosModalSantuario();

    if (intervalId) clearInterval(intervalId);
    document.getElementById('modal-santuario')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-santuario';
    overlay.className = 'santuario-modal-overlay';

    overlay.innerHTML = `
        <div class="santuario-modal-content">
            <div class="santuario-header">
                <h2 style="color: #00a2ff;">🏛️ Santuário</h2>
                <button class="btn-fechar-santuario" id="fechar-modal-santuario">✖</button>
            </div>

            <!-- Topo: Imagem + Descrição Geral -->
            <div class="santuario-info-bloco">
                <img src="/img/santuario/santuario.jpg" alt="Santuário" class="img-santuario-principal" onerror="this.src='https://placehold.co/100x100/222/00a2ff?text=Santuario';">
                <div class="santuario-descricao-texto">
                    <h3>Santuário Sagrado</h3>
                    <p>Um local sagrado reservado para recuperar forças, restaurar sua vida vital ou obter bênçãos e buffs temporários para enfrentar seus combates.</p>
                </div>
            </div>

            <!-- Baixo: Restauração de Vida -->
            <div class="santuario-acao-bloco">
                <div class="santuario-coluna-acao">
                    <img src="/img/santuario/restauracao.jpg" id="img-restauracao-btn" class="img-restauracao" alt="Restauração" onerror="this.src='https://placehold.co/60x60/222/00ff88?text=Vida';">
                    <span id="texto-cooldown" class="status-cooldown">Disponível</span>
                </div>
                <div>
                    <h4 style="color: #00ff88; margin-bottom: 4px;">Restauração Vital</h4>
                    <p style="font-size: 13px; color: #bbb; margin-bottom: 8px;">
                        Restaure sua vida 100%. Possui um tempo de recarga (cooldown) de 30 minutos.
                    </p>
                    <button id="btn-restaurar-vida" class="btn-usar-restauracao">Restaurar Vida</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Eventos
    document.getElementById('fechar-modal-santuario').addEventListener('click', () => {
        if (intervalId) clearInterval(intervalId);
        overlay.remove();
    });

    const btnRestaurar = document.getElementById('btn-restaurar-vida');
    const imgBtn = document.getElementById('img-restauracao-btn');

    btnRestaurar.addEventListener('click', executarRestauracao);
    imgBtn.addEventListener('click', () => {
        if (!btnRestaurar.disabled) executarRestauracao();
    });

    atualizarEstadoCooldown();
}

function atualizarEstadoCooldown() {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    const textoCooldown = document.getElementById('texto-cooldown');
    const btnRestaurar = document.getElementById('btn-restaurar-vida');
    if (!textoCooldown || !btnRestaurar) return;

    const cooldownMs = 30 * 60 * 1000;
    const ultimoUso = heroi.ultimo_uso_santuario ? new Date(heroi.ultimo_uso_santuario) : null;
    const agora = new Date();

    if (ultimoUso && (agora - ultimoUso < cooldownMs)) {
        btnRestaurar.disabled = true;
        textoCooldown.classList.add('em-cooldown');

        const atualizarRelogio = () => {
            const momentoAtual = new Date();
            const restanteMs = cooldownMs - (momentoAtual - ultimoUso);

            if (restanteMs <= 0) {
                clearInterval(intervalId);
                textoCooldown.innerText = "Disponível";
                textoCooldown.classList.remove('em-cooldown');
                btnRestaurar.disabled = false;
            } else {
                const totalSegundos = Math.floor(restanteMs / 1000);
                const hrs = String(Math.floor(totalSegundos / 3600)).padStart(2, '0');
                const mins = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2, '0');
                const segs = String(totalSegundos % 60).padStart(2, '0');
                textoCooldown.innerText = `${hrs}:${mins}:${segs}`;
            }
        };

        atualizarRelogio();
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(atualizarRelogio, 1000);
    } else {
        textoCooldown.innerText = "Disponível";
        textoCooldown.classList.remove('em-cooldown');
        btnRestaurar.disabled = false;
    }
}

async function executarRestauracao() {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    try {
        const res = await fetch('/api/santuario/restaurar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heroi_id: heroi.id })
        });

        const dados = await res.json();

        if (!res.ok) {
            alert(dados.error || 'Não foi possível utilizar a restauração.');
            return;
        }

        // Atualizar localStorage com as informações vindas do banco
        localStorage.setItem('heroi', JSON.stringify(dados.usuario));

        // Atualiza a tela de status do herói
        carregarStatus();

        alert('✨ Sua vida foi completamente restaurada!');
        atualizarEstadoCooldown();

    } catch (err) {
        console.error('Erro na requisição:', err);
        alert('Erro ao conectar com o servidor.');
    }
}