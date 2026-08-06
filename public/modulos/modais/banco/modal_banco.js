// public/modulos/modais/banco/modal_banco.js

let bankInterval = null;

function aplicarEstilosModalBanco() {
    if (document.getElementById('estilo-modal-banco')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-banco';
    style.innerHTML = `
        .banco-modal-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .banco-modal-content {
            background: #121212;
            border: 2px solid #ffd700;
            border-radius: 8px;
            width: 520px;
            max-width: 92%;
            padding: 20px;
            color: #fff;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            position: relative;
        }

        .banco-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }

        .btn-fechar-banco {
            background: transparent;
            border: none;
            color: #ff4d4d;
            font-size: 20px;
            cursor: pointer;
        }

        .banco-card-opcao {
            background: #181818;
            border: 1px solid #ffd700;
            border-radius: 6px;
            padding: 15px;
            margin-top: 10px;
        }

        .banco-inputs-area {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .banco-inputs-area input {
            flex: 1;
            padding: 8px;
            background: #222;
            border: 1px solid #444;
            color: #fff;
            border-radius: 4px;
            outline: none;
        }

        .btn-banco-acao {
            background: #ffd700;
            color: #111;
            border: none;
            padding: 8px 16px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            transition: 0.2s;
        }

        .btn-banco-acao:hover {
            background: #ffea75;
        }

        .btn-banco-acao:disabled {
            background: #444;
            color: #888;
            cursor: not-allowed;
        }

        .banco-detalhes-inv {
            background: #222;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
}

export function abrirModalBanco() {
    aplicarEstilosModalBanco();

    if (bankInterval) clearInterval(bankInterval);
    document.getElementById('modal-banco')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-banco';
    overlay.className = 'banco-modal-overlay';

    overlay.innerHTML = `
        <div class="banco-modal-content">
            <div class="banco-header">
                <h2 style="color: #ffd700;">🏦 Banco do Reino</h2>
                <button class="btn-fechar-banco" id="fechar-modal-banco">✖</button>
            </div>

            <div class="banco-card-opcao">
                <h3 style="color: #ffd700;">💰 Investimento: Lucro Certo</h3>
                <p style="font-size: 12px; color: #ccc; margin-top: 4px;">
                Rendimento: <strong>0.5%</strong> a cada <strong>24 horas</strong>.
            </p>

                <div id="area-investimento-conteudo">
                    <!-- Dinâmico: formulário ou progresso -->
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('fechar-modal-banco').addEventListener('click', () => {
        if (bankInterval) clearInterval(bankInterval);
        overlay.remove();
    });

    carregarStatusInvestimento();
}

async function carregarStatusInvestimento() {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    const container = document.getElementById('area-investimento-conteudo');
    if (!container) return;

    try {
        const res = await fetch(`/api/banco/status/${heroi.id}`);
        const data = await res.json();

        if (data.investimento) {
            renderizarProgresso(data.investimento);
        } else {
            renderizarFormulario();
        }
    } catch (err) {
        container.innerHTML = `<p style="color:red; margin-top:10px;">Erro ao carregar dados do banco.</p>`;
    }
}

function renderizarFormulario() {
    const container = document.getElementById('area-investimento-conteudo');
    container.innerHTML = `
        <div class="banco-inputs-area">
            <input type="number" id="input-cents-investir" placeholder="Quantidade de Cents" min="1">
            <button id="btn-investir-cents" class="btn-banco-acao">Investir</button>
        </div>
    `;

    document.getElementById('btn-investir-cents').addEventListener('click', realizarInvestimento);
}

function renderizarProgresso(inv) {
    const container = document.getElementById('area-investimento-conteudo');
    const lucro = Math.round(inv.valor_investido * inv.taxa_rendimento);
    const total = inv.valor_investido + lucro;

    container.innerHTML = `
        <div class="banco-detalhes-inv">
            <p><strong>Investido:</strong> ${inv.valor_investido} Cents</p>
            <p><strong>Rendimento:</strong> ${lucro} Cents (+0.5%)</p>
            <p><strong>Total no Resgate:</strong> ${total} Cents</p>
            <p style="margin-top: 5px;"><strong>Tempo Restante:</strong> <span id="tempo-restante-inv" style="color: #ffd700;">--</span></p>
        </div>
        <button id="btn-coletar-investimento" class="btn-banco-acao" style="width: 100%; margin-top: 10px;" disabled>Aguardando...</button>
    `;

    const btnColetar = document.getElementById('btn-coletar-investimento');
    const txtTempo = document.getElementById('tempo-restante-inv');

    const inicio = new Date(inv.data_inicio).getTime();

    const atualizarTimer = () => {
    const agora = Date.now();
    const decorridoSeg = Math.floor((agora - inicio) / 1000);
    const restante = inv.tempo_segundos - decorridoSeg;

    if (restante <= 0) {
        clearInterval(bankInterval);
        txtTempo.innerText = "Pronto para coleta!";
        txtTempo.style.color = "#00ff88";
        btnColetar.innerText = `Coletar ${total} Cents`;
        btnColetar.disabled = false;
    } else {
        // Converte os segundos restantes para Horas, Minutos e Segundos
        const horas = Math.floor(restante / 3600);
        const minutos = Math.floor((restante % 3600) / 60);
        const segundos = restante % 60;

        txtTempo.innerText = `${horas}h ${minutos}m ${segundos}s`;
    }
};

    atualizarTimer();
    if (bankInterval) clearInterval(bankInterval);
    bankInterval = setInterval(atualizarTimer, 1000);

    btnColetar.addEventListener('click', coletarInvestimento);
}

async function realizarInvestimento() {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    const qtdInput = document.getElementById('input-cents-investir');
    const valor = parseInt(qtdInput?.value, 10);

    if (!valor || valor <= 0) {
        alert('Digite uma quantia válida de Cents para investir!');
        return;
    }

    try {
        const res = await fetch('/api/banco/investir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: heroi.id, quantidade: valor })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Erro ao investir.');
            return;
        }

        carregarStatusInvestimento();
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
}

async function coletarInvestimento() {
    const heroi = JSON.parse(localStorage.getItem('heroi'));

    try {
        const res = await fetch('/api/banco/coletar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: heroi.id })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Erro ao resgatar.');
            return;
        }

        alert(`✨ Resgate efetuado!\n\nInvestido: ${data.investido} Cents\nRendimento: ${data.lucro} Cents\nTotal Resgatado: ${data.total} Cents`);
        carregarStatusInvestimento();
    } catch (err) {
        alert('Erro ao resgatar investimento.');
    }
}