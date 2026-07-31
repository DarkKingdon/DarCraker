// public/modulos/modais/modal_descricao_objeto_bau.js
import { abrirModalBau } from './modal_bau.js';

function aplicarEstilosDescricaoBau() {
    if (document.getElementById('estilo-modal-descricao-bau')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-descricao-bau';
    style.innerHTML = `
        .modal-descricao-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }

        .modal-descricao-content {
            background-color: #1e1e1e;
            border: 2px solid #ffb700;
            border-radius: 8px;
            width: 280px;
            padding: 15px;
            color: #fff;
            box-shadow: 0 0 15px rgba(0,0,0,0.8);
            font-family: Arial, sans-serif;
        }

        .modal-descricao-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #444;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .modal-descricao-header h4 {
            margin: 0;
            color: #ffb700;
            font-size: 16px;
        }

        .modal-descricao-body {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .modal-descricao-top {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .modal-descricao-img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            background-color: #2a2a2a;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 2px;
        }

        .modal-descricao-info {
            font-size: 13px;
            line-height: 1.4;
        }

        .modal-descricao-text {
            font-size: 12px;
            color: #ccc;
            background: #141414;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #333;
            max-height: 80px;
            overflow-y: auto;
        }

        .modal-descricao-acoes {
            display: flex;
            gap: 8px;
            margin-top: 10px;
            align-items: center;
        }

        .input-qtd-retirar {
            width: 60px;
            padding: 6px;
            background: #121212;
            border: 1px solid #555;
            color: #fff;
            border-radius: 4px;
            text-align: center;
        }

        .btn-retirar {
            flex: 1;
            background: #00a2ff;
            color: #fff;
            border: none;
            padding: 6px 12px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            transition: 0.2s;
        }

        .btn-retirar:hover {
            background: #0088cc;
        }
    `;
    document.head.appendChild(style);
}

export function abrirModalDescricaoItemBau(itemBau, imgSrc) {
    aplicarEstilosDescricaoBau();

    const objeto = itemBau.objetos || {};

    let modal = document.getElementById('modal-descricao-item-bau');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-descricao-item-bau';
        modal.className = 'modal-descricao-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-descricao-content">
            <div class="modal-descricao-header">
                <h4>${objeto.nome || 'Item'}</h4>
                <button id="fechar-modal-descricao-bau" style="background:none; border:none; color:#ff3333; font-weight:bold; cursor:pointer; font-size:16px;">X</button>
            </div>
            <div class="modal-descricao-body">
                <div class="modal-descricao-top">
                    <img src="${imgSrc}" class="modal-descricao-img" onerror="this.onerror=null; this.src='https://placehold.co/50x50/333/fff?text=Item';" alt="${objeto.nome}">
                    <div class="modal-descricao-info">
                        <div><strong>Tipo:</strong> ${objeto.tipo || 'N/A'}</div>
                        <div><strong>Qtd no Baú:</strong> ${itemBau.quantidade}</div>
                        <div><strong>Venda:</strong> ${objeto.valor_de_venda ?? 0}</div>
                    </div>
                </div>
                <div class="modal-descricao-text">
                    ${objeto.descricao || 'Sem descrição disponível.'}
                </div>
                
                <!-- Área para retirar para a mochila -->
                <div class="modal-descricao-acoes">
                    <input type="number" id="qtd-retirar" class="input-qtd-retirar" value="1" min="1" max="${itemBau.quantidade}">
                    <button id="btn-retirar-mochila" class="btn-retirar">Retirar para Mochila</button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Ação do Botão Retirar
    document.getElementById('btn-retirar-mochila').onclick = async () => {
        const heroi = JSON.parse(localStorage.getItem('heroi'));
        const qtdInput = parseInt(document.getElementById('qtd-retirar').value);

        if (!qtdInput || qtdInput <= 0 || qtdInput > itemBau.quantidade) {
            alert('Quantidade inválida!');
            return;
        }

        try {
            const res = await fetch('/api/bau/retirar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: heroi.id,
                    bau_id: itemBau.id,
                    objeto_id: objeto.id,
                    quantidade: qtdInput
                })
            });

            const data = await res.json();
            if (res.ok) {
                modal.style.display = 'none';
                // Atualiza o modal do baú para refletir a remoção/redução do item
                abrirModalBau();
            } else {
                alert(data.error || 'Erro ao retirar item do baú.');
            }
        } catch (err) {
            console.error('Erro ao conectar com servidor:', err);
        }
    };

    const btnFechar = document.getElementById('fechar-modal-descricao-bau');
    if (btnFechar) {
        btnFechar.onclick = () => modal.style.display = 'none';
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}