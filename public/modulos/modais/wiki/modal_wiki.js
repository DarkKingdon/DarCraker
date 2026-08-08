import { abrirModalWikiMonstros } from './modal_wiki_monstros.js';
import { abrirModalWikiLoots } from './modal_wiki_loots.js';

function aplicarEstilosWiki() {
    if (document.getElementById('estilo-modal-wiki')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-wiki';
    style.innerHTML = `
        .modal-wiki-overlay {
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

        .modal-wiki-content {
            background-color: #141414;
            border: 2px solid #00a2ff;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            padding: 20px;
            color: #fff;
            box-shadow: 0 0 15px rgba(0, 162, 255, 0.3);
        }

        .modal-wiki-header {
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 1px solid #333; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
        }

        .grid-wiki-categorias {
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 10px 0;
        }

        .card-wiki-categoria {
            width: 120px;
            height: 120px;
            background: #181818;
            border: 1px solid #444;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            gap: 10px;
        }

        .card-wiki-categoria:hover {
            border-color: #00ff88;
            transform: translateY(-3px);
            background: #222;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        .card-wiki-categoria img {
            width: 48px;
            height: 48px;
            object-fit: contain;
        }

        .card-wiki-categoria span {
            font-size: 14px;
            font-weight: bold;
            color: #00ff88;
        }
    `;
    document.head.appendChild(style);
}

export function abrirModalWiki() {
    aplicarEstilosWiki();

    let modal = document.getElementById('modal-wiki');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki';
        modal.className = 'modal-wiki-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-wiki-content">
            <div class="modal-wiki-header">
                <h3>📖 Wiki DarCraker</h3>
                <button id="fechar-modal-wiki" style="background:none; border:none; color:#ff3333; font-weight:bold; font-size:18px; cursor:pointer;">✕</button>
            </div>

            <div class="grid-wiki-categorias">
                <div class="card-wiki-categoria" id="btn-wiki-monstros">
                    <img src="/img/monstros/poring.png" alt="Monstros" onerror="this.src='https://placehold.co/48x48/333/fff?text=Monstros';">
                    <span>Monstros</span>
                </div>

                <div class="card-wiki-categoria" id="btn-wiki-loots">
                    <img src="/img/icones/mochila.png" alt="Loots" onerror="this.src='https://placehold.co/48x48/333/fff?text=Loots';">
                    <span>Loots</span>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('fechar-modal-wiki').onclick = () => modal.style.display = 'none';

    document.getElementById('btn-wiki-monstros').onclick = () => {
        modal.style.display = 'none';
        abrirModalWikiMonstros();
    };

    document.getElementById('btn-wiki-loots').onclick = () => {
        modal.style.display = 'none';
        abrirModalWikiLoots();
    };
}