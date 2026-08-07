// public/modulos/modais/hunts/modal_hunts.js

import { iniciarCombate } from '../../modulo_tela_de_combate.js';

function aplicarEstilosHunts() {
    if (document.getElementById('estilo-modal-hunts')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-hunts';
    style.innerHTML = `
        /* Modal Overlay */
        .modal-hunts-overlay {
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

        /* Janela Principal do Modal */
        .modal-hunts-content {
            background-color: #141414;
            border: 2px solid #00a2ff;
            border-radius: 8px;
            width: 90%;
            max-width: 750px;
            max-height: 85vh;
            overflow-y: auto;
            padding: 15px;
            color: #fff;
            box-shadow: 0 0 15px rgba(0, 162, 255, 0.3);
        }

        .modal-hunts-header {
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 1px solid #333; 
            padding-bottom: 8px; 
            margin-bottom: 15px;
        }

        /* Container da Região (Accordion) */
        .regiao-container {
            border: 1px solid #333;
            border-radius: 6px;
            background: #1e1e1e;
            margin-bottom: 12px;
            overflow: hidden;
        }

        .regiao-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background: #252525;
            cursor: pointer;
            font-weight: bold;
            font-size: 15px;
            border-bottom: 1px solid #333;
            user-select: none;
        }

        .regiao-header:hover {
            background: #2e2e2e;
            color: #00ff88;
        }

        .btn-toggle-regiao {
            background: none;
            border: none;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        /* Grade de Monstros */
        .grid-monstros {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 15px;
        }

        /* Quadradinho do Monstro */
        .card-monstro {
            width: 100px;
            background: #181818;
            border: 1px solid #444;
            border-radius: 6px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }

        .card-monstro:hover {
            border-color: #00ff88;
            transform: translateY(-2px);
            background: #222;
        }

        .card-monstro .nome-monstro {
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }

        .card-monstro img {
            width: 48px;
            height: 48px;
            object-fit: contain;
            margin: 4px 0;
        }

        .card-monstro .nivel-monstro {
            font-size: 11px;
            color: #aaa;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
}

export async function abrirModalHunts() {
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

    // Caso só tenhamos 1 monstro no BD/Fallback, vamos repetir ele para preencher a grade de testes
    let listaExibicao = [...monstros];
    if (listaExibicao.length === 1) {
        for (let i = 0; i < 15; i++) {
            listaExibicao.push({ ...listaExibicao[0], id: i + 2 });
        }
    }

    modal.innerHTML = `
        <div class="modal-hunts-content">
            <div class="modal-hunts-header">
                <h3>🗡️ Lista de Caçadas</h3>
                <button id="fechar-modal-hunts" style="background:none; border:none; color:#ff3333; font-weight:bold; font-size:18px; cursor:pointer;">✕</button>
            </div>

            <!-- Bloco da Região -->
            <div class="regiao-container">
                <div class="regiao-header" id="toggle-regiao-1">
                    <span>Arredores de Asmon - ( Nível 1 - 10 )</span>
                    <span class="btn-toggle-regiao" id="seta-regiao-1">⬇</span>
                </div>
                
                <div class="grid-monstros" id="conteudo-regiao-1">
                    ${listaExibicao.map((m, index) => {
                        let imgSrc = m.imagem_url || '/img/monstros/poring.png';
                        if (!imgSrc.startsWith('/img/monstros/') && !imgSrc.startsWith('img/monstros/')) {
                            imgSrc = 'img/monstros/' + imgSrc.replace(/^\//, '');
                        }
                        return `
                            <div class="card-monstro" data-index="${index}">
                                <span class="nome-monstro">${m.nome}</span>
                                <img src="${imgSrc}" alt="${m.nome}" onerror="this.onerror=null; this.src='https://placehold.co/48x48/333/fff?text=Poring';">
                                <span class="nivel-monstro">Nível ${m.nivel}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Evento de fechar o Modal
    const btnFechar = document.getElementById('fechar-modal-hunts');
    if (btnFechar) {
        btnFechar.onclick = () => modal.style.display = 'none';
    }

    // Funcionalidade do Minimizar/Maximizar
    const headerRegiao = document.getElementById('toggle-regiao-1');
    const conteudoRegiao = document.getElementById('conteudo-regiao-1');
    const setaRegiao = document.getElementById('seta-regiao-1');

    if (headerRegiao && conteudoRegiao) {
        headerRegiao.onclick = () => {
            if (conteudoRegiao.style.display === 'none') {
                conteudoRegiao.style.display = 'flex';
                setaRegiao.innerText = '⬇';
            } else {
                conteudoRegiao.style.display = 'none';
                setaRegiao.innerText = '➡';
            }
        };
    }

    // Evento de clique para iniciar combate com o monstro
    document.querySelectorAll('.card-monstro').forEach(el => {
        el.onclick = () => {
            const idx = el.getAttribute('data-index');
            modal.style.display = 'none';
            iniciarCombate(listaExibicao[idx]);
        };
    });
}