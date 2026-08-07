// public/modulos/modais/mochila/modal_descricao_objeto_mochila.js

import { abrirModalMochila } from './modal_mochila.js';
import { carregarStatus } from '../../modulo_menu_esquerdo.js';
import { registrarSupply } from '../hunting_analyser/modal_hunting_analyser.js';
import { atualizarTextosBarras } from '../../../motores/motor_combate.js';

function aplicarEstilosDescricaoItem() {
    if (document.getElementById('estilo-modal-descricao-item')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-descricao-item';
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

        .input-qtd-guardar {
            width: 60px;
            padding: 6px;
            background: #121212;
            border: 1px solid #555;
            color: #fff;
            border-radius: 4px;
            text-align: center;
        }

        .btn-guardar {
            flex: 1;
            background: #ffb700;
            color: #121212;
            border: none;
            padding: 6px 12px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            transition: 0.2s;
        }

        .btn-guardar:hover {
            background: #e0a200;
        }

        .btn-consumir {
            width: 100%;
            background: #00ff88;
            color: #121212;
            border: none;
            padding: 8px 12px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            transition: 0.2s;
            margin-top: 5px;
        }

        .btn-consumir:hover {
            background: #00cc6d;
        }
    `;
    document.head.appendChild(style);
}

export function abrirModalDescricaoItem(itemMochila, imgSrc) {
    aplicarEstilosDescricaoItem();

    const objeto = itemMochila.objetos || {};
    
    // Comparação insensível a maiúsculas/minúsculas
    const ehConsumivel = objeto.tipo && objeto.tipo.toLowerCase() === 'consumivel';

    let modal = document.getElementById('modal-descricao-item');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-descricao-item';
        modal.className = 'modal-descricao-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-descricao-content">
            <div class="modal-descricao-header">
                <h4>${objeto.nome || 'Item'}</h4>
                <button id="fechar-modal-descricao" style="background:none; border:none; color:#ff3333; font-weight:bold; cursor:pointer; font-size:16px;">X</button>
            </div>
            <div class="modal-descricao-body">
                <div class="modal-descricao-top">
                    <img src="${imgSrc}" class="modal-descricao-img" onerror="this.onerror=null; this.src='https://placehold.co/50x50/333/fff?text=Item';" alt="${objeto.nome}">
                    <div class="modal-descricao-info">
                        <div><strong>Tipo:</strong> ${objeto.tipo || 'N/A'}</div>
                        <div><strong>Qtd Possuída:</strong> ${itemMochila.quantidade}</div>
                        <div><strong>Venda:</strong> ${objeto.valor_de_venda ?? 0}</div>
                    </div>
                </div>
                <div class="modal-descricao-text">
                    ${objeto.descricao || 'Sem descrição disponível.'}
                </div>
                
                ${ehConsumivel ? `
                    <!-- Botão de Consumir para Itens Consumíveis -->
                    <button id="btn-consumir-item" class="btn-consumir">🍎 Consumir</button>
                ` : ''}

                <!-- Área para guardar no baú -->
                <div class="modal-descricao-acoes">
                    <input type="number" id="qtd-guardar" class="input-qtd-guardar" value="1" min="1" max="${itemMochila.quantidade}">
                    <button id="btn-guardar-bau" class="btn-guardar">Guardar no Baú</button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Ação do Botão Consumir (somente para consumíveis)
    if (ehConsumivel) {
        document.getElementById('btn-consumir-item').onclick = async () => {
            const heroi = JSON.parse(localStorage.getItem('heroi'));

            try {
                const res = await fetch('/api/mochila/consumir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario_id: heroi.id,
                        mochila_id: itemMochila.id
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    if (data.usuario) {
                        // 1. Atualiza o herói no localStorage
                        localStorage.setItem('heroi', JSON.stringify(data.usuario));
                        
                        // 2. Atualiza o menu lateral esquerdo
                        carregarStatus();

                        // 3. Atualiza a barra de vida vermelha da Tela de Combate (se estiver aberta no DOM)
                        const elHpHeroi = document.getElementById('hp-heroi');
                        if (elHpHeroi) {
                            const pctVida = Math.max(0, (data.usuario.vida_atual / data.usuario.vida_maxima) * 100);
                            elHpHeroi.style.width = `${pctVida}%`;
                        }

                        // 4. Atualiza os textos numéricos / porcentagem na Tela de Combate
                        const elTextHpHeroi = document.getElementById('text-hp-heroi');
                        if (elTextHpHeroi) {
                            const usarPorcentagem = localStorage.getItem('opcoes_exibir_porcentagem') === 'true';
                            if (usarPorcentagem) {
                                const pct = Math.max(0, Math.round((data.usuario.vida_atual / data.usuario.vida_maxima) * 100));
                                elTextHpHeroi.innerText = `${pct}%`;
                            } else {
                                elTextHpHeroi.innerText = `${Math.max(0, data.usuario.vida_atual)} - ${data.usuario.vida_maxima}`;
                            }
                        }
                    }

                    // 📊 REGISTRA O GASTO NO HUNTING ANALYSER
                    const valorConsumido = objeto.valor_de_venda ?? 1;
                    registrarSupply(valorConsumido);

                    alert(data.message);
                    modal.style.display = 'none';

                    abrirModalMochila();
                } else {
                    alert(data.error || 'Erro ao consumir item.');
                }
            } catch (err) {
                console.error('Erro ao conectar com servidor:', err);
            }
        };
    }

    // Ação do Botão Guardar
    document.getElementById('btn-guardar-bau').onclick = async () => {
        const heroi = JSON.parse(localStorage.getItem('heroi'));
        const qtdInput = parseInt(document.getElementById('qtd-guardar').value);

        if (!qtdInput || qtdInput <= 0 || qtdInput > itemMochila.quantidade) {
            alert('Quantidade inválida!');
            return;
        }

        try {
            const res = await fetch('/api/bau/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: heroi.id,
                    mochila_id: itemMochila.id,
                    objeto_id: objeto.id,
                    quantidade: qtdInput
                })
            });

            const data = await res.json();
            if (res.ok) {
                modal.style.display = 'none';
                abrirModalMochila();
            } else {
                alert(data.error || 'Erro ao guardar item no baú.');
            }
        } catch (err) {
            console.error('Erro ao conectar com servidor:', err);
        }
    };

    const btnFechar = document.getElementById('fechar-modal-descricao');
    if (btnFechar) {
        btnFechar.onclick = () => modal.style.display = 'none';
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}