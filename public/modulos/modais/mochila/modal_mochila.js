// public/modulos/modais/mochila/modal_mochila.js

import { abrirModalDescricaoItem } from './modal_descricao_objeto_mochila.js';

function aplicarEstilosMochila() {
    if (document.getElementById('estilo-modal-mochila')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-mochila';
    style.innerHTML = `
        /* Modal Mochila */
        .modal-mochila-overlay {
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

        .modal-mochila-content {
            background-color: #181818; 
            border: 2px solid #00a2ff;
            border-radius: 8px; 
            width: 340px; 
            padding: 15px; 
            color: #fff;
        }

        .grid-mochila {
            display: grid; 
            grid-template-columns: repeat(5, 1fr); 
            gap: 8px; 
            margin-top: 15px;
        }

        .slot-mochila {
            width: 40px; 
            height: 40px; 
            background-color: #242424;
            border: 1px solid #444; 
            border-radius: 4px; 
            position: relative;
            display: flex; 
            justify-content: center; 
            align-items: center;
        }

        .slot-mochila.com-item {
            cursor: pointer;
            transition: border-color 0.2s, background-color 0.2s;
        }

        .slot-mochila.com-item:hover {
            border-color: #00a2ff;
            background-color: #2e2e2e;
        }

        .slot-mochila img { 
            width: 32px; 
            height: 32px; 
            object-fit: contain; 
        }

        .slot-mochila .qtd-badge {
            position: absolute; 
            bottom: 2px; 
            right: 2px;
            background: rgba(0,0,0,0.8); 
            color: #fff; 
            font-size: 10px;
            padding: 1px 3px; 
            border-radius: 3px; 
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

export async function abrirModalMochila() {
    aplicarEstilosMochila();

    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    let modal = document.getElementById('modal-mochila');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-mochila';
        modal.className = 'modal-mochila-overlay';
        document.body.appendChild(modal);
    }

    let itensMochila = [];
    try {
        const res = await fetch(`/api/mochila/${heroi.id}`);
        if (res.ok) itensMochila = await res.json();
    } catch (e) { 
        console.error('Erro ao carregar mochila:', e); 
    }

    // Renderiza 20 slots de forma sequencial e organizada
    let slotsHtml = '';
    for (let i = 0; i < 20; i++) {
        // Pega o item pelo índice da lista para garantir alinhamento à esquerda
        const itemNoSlot = itensMochila[i]; 

        if (itemNoSlot && itemNoSlot.objetos) {
            let imgSrc = itemNoSlot.objetos.imagem_url || 'jellopy.png';
            if (!imgSrc.startsWith('/img/objetos/loots/') && !imgSrc.startsWith('img/objetos/loots/')) {
                imgSrc = 'img/objetos/loots/' + imgSrc;
            }

            slotsHtml += `
                <div class="slot-mochila com-item" data-index="${i}">
                    <img src="${imgSrc}" onerror="this.onerror=null; this.src='https://placehold.co/32x32/333/fff?text=Item';" alt="${itemNoSlot.objetos.nome}">
                    <span class="qtd-badge">${itemNoSlot.quantidade}</span>
                </div>
            `;
        } else {
            slotsHtml += `<div class="slot-mochila"></div>`;
        }
    }

    modal.innerHTML = `
        <div class="modal-mochila-content">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:8px;">
                <h3>🎒 Mochila</h3>
                <button id="fechar-modal-mochila" style="background:none; border:none; color:#ff3333; font-weight:bold; cursor:pointer;">X</button>
            </div>
            <div class="grid-mochila">
                ${slotsHtml}
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Adiciona evento de clique nos slots com itens
    const slotsComItem = modal.querySelectorAll('.slot-mochila.com-item');
    slotsComItem.forEach(slotEl => {
        slotEl.onclick = () => {
            const index = parseInt(slotEl.getAttribute('data-index'));
            const itemClicado = itensMochila[index];
            
            if (itemClicado && itemClicado.objetos) {
                let imgSrc = itemClicado.objetos.imagem_url || 'jellopy.png';
                if (!imgSrc.startsWith('/img/objetos/loots/') && !imgSrc.startsWith('img/objetos/loots/')) {
                    imgSrc = 'img/objetos/loots/' + imgSrc;
                }
                
                abrirModalDescricaoItem(itemClicado, imgSrc);
            }
        };
    });

    // Evento para fechar o modal
    const btnFechar = document.getElementById('fechar-modal-mochila');
    if (btnFechar) {
        btnFechar.onclick = () => modal.style.display = 'none';
    }
}