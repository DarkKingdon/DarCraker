// public/modulos/modulo_menu_superior.js
import { iniciarCombate } from './modulo_tela_de_combate.js';

export function toggleStatus() {
    const painelStatus = document.getElementById('painel-status');
    if (painelStatus) {
        painelStatus.style.display = (painelStatus.style.display === 'none') ? 'block' : 'none';
    }
}

export function sair() {
    localStorage.removeItem('heroi');
    window.location.href = 'index.html';
}

function aplicarEstilosMenu() {
    if (document.getElementById('estilo-menu-superior')) return;

    const style = document.createElement('style');
    style.id = 'estilo-menu-superior';
    style.innerHTML = `
        .top-bar {
            border: 2px solid #00a2ff;
            background-color: #121212;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 6px;
        }

        .btn-menu {
            background-color: #1e1e1e;
            color: #00ff88;
            border: 1px solid #00ff88;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.2s;
        }

        .btn-menu:hover {
            background-color: #00ff88;
            color: #121212;
        }

        .btn-sair {
            border-color: #f44336;
            color: #f44336;
        }

        .btn-sair:hover {
            background-color: #f44336;
            color: #fff;
        }

        /* Modal da Lista de Hunts */
        .modal-hunts-overlay {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999;
        }

        .modal-hunts-content {
            background-color: #1a1a1a;
            border: 2px solid #00a2ff;
            border-radius: 8px;
            width: 320px;
            padding: 15px;
            color: #fff;
        }

        .modal-hunts-header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 12px;
        }

        .item-monstro {
            display: flex; align-items: center; gap: 12px;
            padding: 8px; background: #262626; border: 1px solid #444;
            border-radius: 6px; cursor: pointer; margin-bottom: 8px;
            transition: 0.2s;
        }

        .item-monstro:hover {
            background: #333;
            border-color: #00ff88;
        }

        .item-monstro img {
            width: 40px; height: 40px; border-radius: 4px; object-fit: cover;
        }

        /* Modal Mochila */
        .modal-mochila-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.85); display: flex;
            justify-content: center; align-items: center; z-index: 9999;
        }
        .modal-mochila-content {
            background-color: #181818; border: 2px solid #00a2ff;
            border-radius: 8px; width: 340px; padding: 15px; color: #fff;
        }
        .grid-mochila {
            display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 15px;
        }
        .slot-mochila {
            width: 40px; height: 40px; background-color: #242424;
            border: 1px solid #444; border-radius: 4px; position: relative;
            display: flex; justify-content: center; align-items: center;
        }
        .slot-mochila img { width: 32px; height: 32px; object-fit: contain; }
        .slot-mochila .qtd-badge {
            position: absolute; bottom: 2px; right: 2px;
            background: rgba(0,0,0,0.8); color: #fff; font-size: 10px;
            padding: 1px 3px; border-radius: 3px; font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

function renderizarHTMLMenu() {
    const container = document.getElementById('header-menu');
    if (container) {
        container.className = 'top-bar';
        container.innerHTML = `
            <button id="btn-status" class="btn-menu">Status</button>
            <button id="btn-mochila" class="btn-menu">Mochila</button>
            <button id="btn-hunts" class="btn-menu">Hunts</button>
            <button id="btn-sair" class="btn-menu btn-sair">Sair</button>
        `;
    }
}

// Função para abrir e renderizar a Mochila
export async function abrirModalMochila() {
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
    } catch (e) { console.error(e); }

    // Renderiza 20 slots (40x40 px)
    let slotsHtml = '';
    for (let i = 0; i < 20; i++) {
        const itemNoSlot = itensMochila.find(m => m.slot_index === i);
        if (itemNoSlot) {
            let imgSrc = itemNoSlot.objetos.imagem_url || 'jellopy.png';
            if (!imgSrc.startsWith('/img/') && !imgSrc.startsWith('img/')) imgSrc = 'img/' + imgSrc;

            slotsHtml += `
                <div class="slot-mochila" title="${itemNoSlot.objetos.nome}: ${itemNoSlot.objetos.descricao}">
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
    document.getElementById('fechar-modal-mochila').onclick = () => modal.style.display = 'none';
}

async function abrirModalHunts() {
    let modal = document.getElementById('modal-hunts');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-hunts';
        modal.className = 'modal-hunts-overlay';
        document.body.appendChild(modal);
    }

    let monstros = [
        { id: 1, nome: 'Poring', nivel: 1, imagem_url: '/img/poring.png', vida_atual: 5, vida_maxima: 5, mana_minima: 5, mana_maxima: 5, ataque_minimo: 1, ataque_maximo: 2, defesa_minima: 0, defesa_maxima: 1, recompensa_exp_atual: 1, recompensa_exp_atual_forca: 1, recompensa_exp_atual_protecao: 1, recompensa_exp_atual_vitalidade: 1, recompensa_exp_atual_inteligencia: 1 }
    ];

    try {
        const res = await fetch('/api/monstros');
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) monstros = data;
        }
    } catch (e) { console.log("Usando fallback de monstro local"); }

    modal.innerHTML = `
        <div class="modal-hunts-content">
            <div class="modal-hunts-header">
                <h3>🗡️ Lista de Caçadas</h3>
                <button id="fechar-modal-hunts" style="background:none; border:none; color:#ff3333; font-weight:bold; cursor:pointer;">X</button>
            </div>
            <div class="lista-monstros">
                ${monstros.map(m => {
                    let imgSrc = m.imagem_url || 'poring.png';
                    if (!imgSrc.startsWith('/img/') && !imgSrc.startsWith('img/')) {
                        imgSrc = 'img/' + imgSrc.replace(/^\//, '');
                    }
                    return `
                        <div class="item-monstro" data-id="${m.id}">
                            <img src="${imgSrc}" alt="${m.nome}" onerror="this.onerror=null; this.src='https://placehold.co/40x40/333/fff?text=Poring';">
                            <div>
                                <strong>${m.nome}</strong><br>
                                <small style="color:#aaa;">Nível: ${m.nivel}</small>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('fechar-modal-hunts').onclick = () => modal.style.display = 'none';

    document.querySelectorAll('.item-monstro').forEach((el, index) => {
        el.onclick = () => {
            modal.style.display = 'none';
            iniciarCombate(monstros[index]);
        };
    });
}

export function inicializarMenuSuperior() {
    aplicarEstilosMenu();
    renderizarHTMLMenu();

    document.getElementById('btn-status')?.addEventListener('click', toggleStatus);
    document.getElementById('btn-mochila')?.addEventListener('click', abrirModalMochila);
    document.getElementById('btn-hunts')?.addEventListener('click', abrirModalHunts);
    document.getElementById('btn-sair')?.addEventListener('click', sair);
}