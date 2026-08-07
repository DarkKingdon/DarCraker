// public/modulos/modais/correio/modal_correio.js

import { verificarNotificacaoCorreio } from '../../modulo_menu_superior.js';

function aplicarEstilosCorreio() {
    if (document.getElementById('estilo-modal-correio')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-correio';
    style.innerHTML = `
        .modal-correio-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .modal-correio-content {
            background-color: #181818;
            border: 2px solid #00a2ff;
            border-radius: 8px;
            width: 450px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 15px;
            color: #fff;
            font-family: Arial, sans-serif;
        }

        .correio-tabs {
            display: flex;
            gap: 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .tab-btn {
            background: #242424;
            color: #ccc;
            border: 1px solid #444;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
        }

        .tab-btn.active {
            background: #00a2ff;
            color: #fff;
            border-color: #00a2ff;
            font-weight: bold;
        }

        .correio-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .input-group {
            display: flex;
            gap: 6px;
        }

        .input-group input, .correio-form textarea {
            background: #121212;
            border: 1px solid #444;
            color: #fff;
            padding: 6px;
            border-radius: 4px;
            width: 100%;
        }

        .btn-verificar {
            background: #00a2ff;
            color: #fff;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            white-space: nowrap;
        }

        .slots-anexo-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-top: 5px;
        }

        .slot-anexo {
            width: 60px;
            height: 60px;
            background: #242424;
            border: 1px dashed #555;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            cursor: pointer;
            position: relative;
        }

        .slot-anexo img {
            width: 28px;
            height: 28px;
        }

        .btn-enviar-mail {
            background: #00ff88;
            color: #121212;
            border: none;
            padding: 8px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }

        .card-email {
            background: #222;
            border: 1px solid #444;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 10px;
        }

        .card-email-header {
            display: flex;
            justify-content: space-between;
            color: #00a2ff;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 5px;
        }

        .btn-resgatar {
            background: #ffb700;
            color: #121212;
            border: none;
            padding: 5px 10px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 6px;
        }
    `;
    document.head.appendChild(style);
}

let itensAnexados = []; // máximo 5
let destinatarioConfirmado = null;

export async function abrirModalCorreio() {
    aplicarEstilosCorreio();

    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    let modal = document.getElementById('modal-correio');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-correio';
        modal.className = 'modal-correio-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-correio-content">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:8px;">
                <h3>📬 Correio</h3>
                <button id="fechar-modal-correio" style="background:none; border:none; color:#ff3333; font-weight:bold; cursor:pointer;">X</button>
            </div>

            <div class="correio-tabs">
                <button id="tab-escrever" class="tab-btn active">Escrever</button>
                <button id="tab-recebidos" class="tab-btn">Caixa de Entrada</button>
            </div>

            <div id="conteudo-tab-escrever" class="correio-form">
                <label style="font-size:12px;">Destinatário:</label>
                <div class="input-group">
                    <input type="text" id="input-destinatario-nome" placeholder="Nome do jogador">
                    <button id="btn-verificar-dest" class="btn-verificar">Verificar</button>
                </div>
                <div id="info-destinatario" style="font-size:12px; color:#00ff88; display:none;"></div>

                <label style="font-size:12px;">Descrição:</label>
                <textarea id="input-descricao" rows="3" placeholder="Mensagem opcional..."></textarea>

                <label style="font-size:12px;">Cents a enviar:</label>
                <input type="number" id="input-cents" min="0" value="0">

                <label style="font-size:12px;">Anexar Itens (Até 5):</label>
                <div class="slots-anexo-grid" id="container-slots-anexo"></div>

                <button id="btn-enviar-correio" class="btn-enviar-mail">Enviar E-mail</button>
            </div>

            <div id="conteudo-tab-recebidos" style="display:none;"></div>
        </div>
    `;

    modal.style.display = 'flex';

    // Inicializa os 5 slots vazios
    renderizarSlotsAnexo(heroi.id);

    // Fechar
    document.getElementById('fechar-modal-correio').onclick = () => modal.style.display = 'none';

    // Tabs
    const tabEscrever = document.getElementById('tab-escrever');
    const tabRecebidos = document.getElementById('tab-recebidos');
    const contEscrever = document.getElementById('conteudo-tab-escrever');
    const contRecebidos = document.getElementById('conteudo-tab-recebidos');

    tabEscrever.onclick = () => {
        tabEscrever.classList.add('active');
        tabRecebidos.classList.remove('active');
        contEscrever.style.display = 'flex';
        contRecebidos.style.display = 'none';
    };

    tabRecebidos.onclick = () => {
        tabRecebidos.classList.add('active');
        tabEscrever.classList.remove('active');
        contEscrever.style.display = 'none';
        contRecebidos.style.display = 'block';
        carregarEmailsRecebidos(heroi.id);
    };

    // Evento Verificar Jogador
    document.getElementById('btn-verificar-dest').onclick = async () => {
        const nome = document.getElementById('input-destinatario-nome').value.trim();
        const infoDiv = document.getElementById('info-destinatario');

        if (!nome) return alert('Digite o nome do jogador!');

        try {
            const res = await fetch(`/api/correio/verificar/${nome}`);
            const data = await res.json();

            if (res.ok) {
                destinatarioConfirmado = data;
                infoDiv.style.display = 'block';
                infoDiv.innerText = `✅ Jogador Encontrado: ${data.nome_heroi} (Nível ${data.nivel})`;
            } else {
                destinatarioConfirmado = null;
                infoDiv.style.display = 'block';
                infoDiv.style.color = '#f44336';
                infoDiv.innerText = `❌ ${data.error}`;
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Evento Enviar Correio
    document.getElementById('btn-enviar-correio').onclick = async () => {
        if (!destinatarioConfirmado) {
            return alert('Verifique o nome do destinatário antes de enviar!');
        }

        const descricao = document.getElementById('input-descricao').value;
        const cents = parseInt(document.getElementById('input-cents').value) || 0;

        try {
            const res = await fetch('/api/correio/enviar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remetente_id: heroi.id,
                    destinatario_id: destinatarioConfirmado.id,
                    descricao,
                    cents,
                    itens: itensAnexados
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Correio enviado com sucesso!');
                itensAnexados = [];
                destinatarioConfirmado = null;
                modal.style.display = 'none';
            } else {
                alert(data.error || 'Erro ao enviar correio.');
            }
        } catch (err) {
            console.error(err);
        }
    };
}

async function renderizarSlotsAnexo(usuarioId) {
    const container = document.getElementById('container-slots-anexo');
    if (!container) return;

    // Buscar itens da mochila para anexar
    let mochila = [];
    try {
        const res = await fetch(`/api/mochila/${usuarioId}`);
        if (res.ok) mochila = await res.json();
    } catch (e) {}

    container.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const itemSlot = itensAnexados[i];
        const slotEl = document.createElement('div');
        slotEl.className = 'slot-anexo';

        if (itemSlot) {
            let imgSrc = itemSlot.objeto.imagem_url || 'jellopy.png';
            if (!imgSrc.startsWith('/img/objetos/loots/') && !imgSrc.startsWith('img/objetos/loots/')) {
                imgSrc = 'img/objetos/loots/' + imgSrc;
            }

            slotEl.innerHTML = `
                <img src="${imgSrc}">
                <span>${itemSlot.quantidade}x</span>
            `;

            slotEl.onclick = () => {
                itensAnexados.splice(i, 1);
                renderizarSlotsAnexo(usuarioId);
            };
        } else {
            slotEl.innerText = '+ Anexar';
            slotEl.onclick = () => abrirSeletorItemMochila(mochila, usuarioId);
        }

        container.appendChild(slotEl);
    }
}

function abrirSeletorItemMochila(mochila, usuarioId) {
    if (itensAnexados.length >= 5) return alert('Máximo 5 itens anexados!');
    if (!mochila || mochila.length === 0) return alert('Sua mochila está vazia!');

    const selecao = prompt(
        "Selecione o item para anexar digitando o número:\n" +
        mochila.map((m, idx) => `${idx + 1}. ${m.objetos.nome} (Qtd: ${m.quantidade})`).join("\n")
    );

    const index = parseInt(selecao) - 1;
    if (isNaN(index) || !mochila[index]) return;

    const itemEscolhido = mochila[index];
    const qtdPrompt = prompt(`Quantos "${itemEscolhido.objetos.nome}" deseja enviar? (1 a ${itemEscolhido.quantidade})`);
    const qtd = parseInt(qtdPrompt);

    if (isNaN(qtd) || qtd <= 0 || qtd > itemEscolhido.quantidade) {
        return alert('Quantidade inválida!');
    }

    itensAnexados.push({
        objeto_id: itemEscolhido.objetos.id,
        quantidade: qtd,
        objeto: itemEscolhido.objetos
    });

    renderizarSlotsAnexo(usuarioId);
}

async function carregarEmailsRecebidos(usuarioId) {
    const contRecebidos = document.getElementById('conteudo-tab-recebidos');
    contRecebidos.innerHTML = 'Carregando...';

    try {
        const res = await fetch(`/api/correio/recebidos/${usuarioId}`);
        const emails = await res.json();

        if (!res.ok || emails.length === 0) {
            contRecebidos.innerHTML = '<p style="color:#aaa;">Nenhum e-mail recebido.</p>';
            return;
        }

        contRecebidos.innerHTML = emails.map(m => {
            const itensTxt = m.correio_itens && m.correio_itens.length > 0 
                ? m.correio_itens.map(i => `${i.quantidade}x ${i.objetos.nome}`).join(', ') 
                : 'Nenhum';

            return `
                <div class="card-email">
                    <div class="card-email-header">
                        <span>De: ${m.remetente ? m.remetente.nome_heroi : 'Desconhecido'} (Níver: ${m.remetente?.nivel ?? 1})</span>
                        <span style="font-size:10px; color:#aaa;">${new Date(m.criado_em).toLocaleString()}</span>
                    </div>
                    <div style="font-size:12px; margin-bottom:6px;">${m.descricao || '<em>Sem descrição</em>'}</div>
                    <div style="font-size:11px; color:#ffb700;"><strong>Cents:</strong> ${m.cents} | <strong>Itens:</strong> ${itensTxt}</div>
                    <button class="btn-resgatar" onclick="resgatarCorreio(${m.id}, ${usuarioId})">🎁 Resgatar e Excluir</button>
                </div>
            `;
        }).join('');
    } catch (e) {
        contRecebidos.innerHTML = 'Erro ao carregar mensagens.';
    }
}

window.resgatarCorreio = async function(correioId, usuarioId) {
    try {
        const res = await fetch('/api/correio/resgatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioId, correio_id: correioId })
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            carregarEmailsRecebidos(usuarioId);
            verificarNotificacaoCorreio(); // 👈 Atualiza o pontinho vermelho imediatamente!
        } else {
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
    }
};