// public/modulos/modais/modal_final_do_combate.js

function aplicarEstilosModalFinal() {
    if (document.getElementById('estilo-modal-final-combate')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-final-combate';
    style.innerHTML = `
        .modal-final-overlay {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.75);
            display: none; justify-content: center; align-items: center;
            z-index: 1000;
        }
        .modal-final-content {
            background-color: #1a1a1a;
            border: 2px solid #ff9900;
            border-radius: 8px;
            width: 320px;
            padding: 15px;
            box-shadow: 0 0 15px rgba(255, 153, 0, 0.4);
            color: #fff;
            text-align: center;
            font-family: Arial, sans-serif;
        }
        .modal-final-header {
            font-size: 18px;
            font-weight: bold;
            color: #00ff88;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .modal-final-secao {
            background: #111;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 10px;
            text-align: left;
            font-size: 13px;
        }
        .modal-final-secao h4 {
            margin-bottom: 6px;
            font-size: 12px;
            color: #aaa;
            text-transform: uppercase;
        }
        .item-loot-container {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #222;
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid #444;
        }
        .item-loot-img {
            width: 25px;
            height: 25px;
            object-fit: cover;
            border-radius: 3px;
        }
        .btn-modal-fechar {
            background: #ff9900;
            color: #000;
            border: none;
            padding: 8px 16px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            margin-top: 5px;
        }
        .btn-modal-fechar:hover {
            background: #e68a00;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Exibe o modal final do combate com as recompensas de XP e Drop.
 * @param {Object} monstro - Dados do monstro derrotado
 * @param {String} treinoSelecionado - Nome da habilidade treinada ('forca', 'protecao', etc.)
 * @param {Object|null} dropInfo - Objeto com { dropObtido, quantidade } enviado pela API
 */
export function abrirModalFinalDoCombate(monstro, treinoSelecionado, dropInfo) {
    aplicarEstilosModalFinal();

    let modal = document.getElementById('modal-final-combate');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-final-combate';
        modal.className = 'modal-final-overlay';
        document.body.appendChild(modal);
    }

    const expNivel = monstro.recompensa_exp_atual || 1;
    const campoExpTreino = `recompensa_exp_atual_${treinoSelecionado}`;
    const expTreino = monstro[campoExpTreino] || 1;
    const nomeTreino = treinoSelecionado ? treinoSelecionado.toUpperCase() : 'TREINO';

    // Aceita tanto a lista de dropsObtidos (novo) quanto dropObtido (antigo para retrocompatibilidade)
    const listaDrops = dropInfo?.dropsObtidos || (dropInfo?.dropObtido ? [{ item: dropInfo.dropObtido, quantidade: dropInfo.quantidade }] : []);

    let lootHtml = `<span style="color: #777;">Nenhum item obtido.</span>`;

    if (listaDrops.length > 0) {
        lootHtml = listaDrops.map(drop => {
            const item = drop.item;
            const quantidade = drop.quantidade || 1;

            let imgSrc = item.imagem_url || 'jellopy.png';
            if (!imgSrc.startsWith('/img/objetos/loots/') && !imgSrc.startsWith('img/objetos/loots/')) {
                imgSrc = 'img/objetos/loots/' + imgSrc.replace(/^\//, '');
            }

            return `
                <div class="item-loot-container" style="margin-bottom: 5px;">
                    <img class="item-loot-img" src="${imgSrc}" onerror="this.onerror=null; this.src='https://placehold.co/25x25/333/fff?text=Loot';" alt="${item.nome}">
                    <div>
                        <strong>${quantidade}x</strong> ${item.nome}
                    </div>
                </div>
            `;
        }).join('');
    }

    modal.innerHTML = `
        <div class="modal-final-content">
            <div class="modal-final-header">🏆 Vitória em Combate!</div>
            
            <p style="font-size: 13px; color: #ccc; margin-bottom: 10px;">Você derrotou o <strong>${monstro.nome}</strong>!</p>
            
            <div class="modal-final-secao">
                <h4>⭐ Experiência Ganha</h4>
                <div>• XP de Nível: <strong style="color: #00ff88;">+${expNivel}</strong></div>
                <div>• XP de ${nomeTreino}: <strong style="color: #ff9900;">+${expTreino}</strong></div>
            </div>

            <div class="modal-final-secao">
                <h4>🎁 Loot Obtido</h4>
                ${lootHtml}
            </div>

            <button id="btn-fechar-modal-final" class="btn-modal-fechar">CONTINUAR</button>
        </div>
    `;

    modal.style.display = 'flex';

    // Função centralizada para fechar o modal e limpar o timer
    const fecharModal = () => {
        modal.style.display = 'none';
        if (timerAutoFechar) {
            clearTimeout(timerAutoFechar);
        }
    };

    // Fecha ao clicar no botão "CONTINUAR"
    document.getElementById('btn-fechar-modal-final').onclick = fecharModal;

    // Fecha automaticamente após 4 segundos (4000ms)
    const timerAutoFechar = setTimeout(fecharModal, 4000);
}