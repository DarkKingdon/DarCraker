// public/modulos/modais/modal_hunts.js
import { iniciarCombate } from '../modulo_tela_de_combate.js';

function aplicarEstilosHunts() {
    if (document.getElementById('estilo-modal-hunts')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-hunts';
    style.innerHTML = `
        /* Modal Hunts */
        .modal-hunts-overlay {
            position: fixed;
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex; 
            justify-content: center; 
            align-items: center;
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
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 1px solid #333; 
            padding-bottom: 8px; 
            margin-bottom: 12px;
        }

        .item-monstro {
            display: flex; 
            align-items: center; 
            gap: 12px;
            padding: 8px; 
            background: #262626; 
            border: 1px solid #444;
            border-radius: 6px; 
            cursor: pointer; 
            margin-bottom: 8px;
            transition: 0.2s;
        }

        .item-monstro:hover {
            background: #333;
            border-color: #00ff88;
        }

        .item-monstro img {
            width: 40px; 
            height: 40px; 
            border-radius: 4px; 
            object-fit: cover;
        }
    `;
    document.head.appendChild(style);
}

export async function abrirModalHunts() {
    // Injeta os estilos do modal se ainda não foram injetados
    aplicarEstilosHunts();

    let modal = document.getElementById('modal-hunts');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-hunts';
        modal.className = 'modal-hunts-overlay';
        document.body.appendChild(modal);
    }

    let monstros = [
        { 
            id: 1, 
            nome: 'Poring', 
            nivel: 1, 
            imagem_url: '/img/monstros/poring.png', 
            vida_atual: 5, 
            vida_maxima: 5, 
            mana_minima: 5, 
            mana_maxima: 5, 
            ataque_minimo: 1, 
            ataque_maximo: 2, 
            defesa_minima: 0, 
            defesa_maxima: 1, 
            recompensa_exp_atual: 1, 
            recompensa_exp_atual_forca: 1, 
            recompensa_exp_atual_protecao: 1, 
            recompensa_exp_atual_vitalidade: 1, 
            recompensa_exp_atual_inteligencia: 1 
        }
    ];

    try {
        const res = await fetch('/api/monstros');
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) monstros = data;
        }
    } catch (e) { 
        console.log("Usando fallback de monstro local:", e); 
    }

    modal.innerHTML = `
        <div class="modal-hunts-content">
            <div class="modal-hunts-header">
                <h3>🗡️ Lista de Caçadas</h3>
                <button id="fechar-modal-hunts" style="background:none; border:none; color:#ff3333; font-weight:bold; cursor:pointer;">X</button>
            </div>
            <div class="lista-monstros">
                ${monstros.map(m => {
                    let imgSrc = m.imagem_url || '/img/monstros/poring.png';
                    if (!imgSrc.startsWith('/img/monstros/') && !imgSrc.startsWith('img/monstros/')) {
                        imgSrc = 'img/monstros/' + imgSrc.replace(/^\//, '');
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

    const btnFechar = document.getElementById('fechar-modal-hunts');
    if (btnFechar) {
        btnFechar.onclick = () => modal.style.display = 'none';
    }

    document.querySelectorAll('.item-monstro').forEach((el, index) => {
        el.onclick = () => {
            modal.style.display = 'none';
            iniciarCombate(monstros[index]);
        };
    });
}