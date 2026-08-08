import { abrirModalWiki } from './modal_wiki.js';

function aplicarEstilosWikiMonstros() {
    if (document.getElementById('estilo-modal-wiki-monstros')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-wiki-monstros';
    style.innerHTML = `
        .modal-wiki-monstros-overlay {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999;
        }

        .modal-wiki-monstros-content {
            background-color: #141414;
            border: 2px solid #00a2ff;
            border-radius: 8px;
            width: 90%; max-width: 700px; max-height: 85vh;
            overflow-y: auto; padding: 15px; color: #fff;
        }

        .detalhes-monstro-box {
            background: #1c1c1c;
            border: 1px solid #00a2ff;
            border-radius: 6px;
            padding: 15px;
            margin-top: 15px;
            display: flex;
            gap: 20px;
        }

        .detalhes-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 13px;
            width: 100%;
        }

        .detalhes-info-grid div {
            background: #252525;
            padding: 6px 10px;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

export async function abrirModalWikiMonstros() {
    aplicarEstilosWikiMonstros();

    let modal = document.getElementById('modal-wiki-monstros');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-monstros';
        modal.className = 'modal-wiki-monstros-overlay';
        document.body.appendChild(modal);
    }

    let monstros = [
        { id: 1, nome: 'Poring', nivel: 1, imagem_url: 'poring.png', ataque_minimo: 1, ataque_maximo: 2, defesa_minima: 0, defesa_maxima: 1, recompensa_exp_atual: 1 }
    ];

    try {
        const res = await fetch('/api/monstros');
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) monstros = data;
        }
    } catch (e) {
        console.log("Usando monstro padrao wiki:", e);
    }

    modal.innerHTML = `
        <div class="modal-wiki-monstros-content">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:8px; margin-bottom:15px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <button id="btn-voltar-wiki-monstros" style="background:#222; border:1px solid #444; color:#fff; border-radius:4px; padding:4px 8px; cursor:pointer;">⬅ Voltar</button>
                    <h3>👾 Wiki - Monstros</h3>
                </div>
                <button id="fechar-modal-wiki-monstros" style="background:none; border:none; color:#ff3333; font-weight:bold; font-size:18px; cursor:pointer;">✕</button>
            </div>

            <!-- Grade de Monstros estilo Hunts -->
            <div style="display:flex; flex-wrap:wrap; gap:12px;" id="grid-wiki-monstros">
                ${monstros.map((m, idx) => {
                    let imgName = m.imagem_url || 'poring.png';
                    let imgSrc = imgName.startsWith('http') ? imgName : `/img/monstros/${imgName.replace(/^\/img\/monstros\//, '')}`;
                    return `
                        <div class="card-monstro" data-idx="${idx}" style="width:100px; background:#181818; border:1px solid #444; border-radius:6px; padding:8px; text-align:center; cursor:pointer;">
                            <div style="font-size:12px; font-weight:bold; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.nome}</div>
                            <img src="${imgSrc}" style="width:48px; height:48px; object-fit:contain; margin:4px 0;" onerror="this.src='https://placehold.co/48x48/333/fff?text=Poring';">
                            <div style="font-size:11px; color:#aaa;">Nível ${m.nivel}</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Painel Detalhado do Monstro Selecionado -->
            <div id="painel-detalhe-monstro" style="display:none;" class="detalhes-monstro-box"></div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('fechar-modal-wiki-monstros').onclick = () => modal.style.display = 'none';
    document.getElementById('btn-voltar-wiki-monstros').onclick = () => {
        modal.style.display = 'none';
        abrirModalWiki();
    };

    // Evento ao clicar em um card de monstro
    document.querySelectorAll('#grid-wiki-monstros .card-monstro').forEach(card => {
        card.onclick = () => {
            const idx = card.getAttribute('data-idx');
            const m = monstros[idx];
            let imgName = m.imagem_url || 'poring.png';
            let imgSrc = imgName.startsWith('http') ? imgName : `/img/monstros/${imgName.replace(/^\/img\/monstros\//, '')}`;

            const painel = document.getElementById('painel-detalhe-monstro');
            painel.style.display = 'flex';
            painel.innerHTML = `
                <div style="text-align:center; min-width:120px;">
                    <img src="${imgSrc}" style="width:64px; height:64px; object-fit:contain;" onerror="this.src='https://placehold.co/64x64/333/fff?text=Poring';">
                    <h4 style="color:#00ff88; margin-top:5px;">${m.nome}</h4>
                    <span style="font-size:12px; color:#aaa;">Nível ${m.nivel}</span>
                </div>
                <div class="detalhes-info-grid">
                    <div><b>Ataque:</b> ${m.ataque_minimo} - ${m.ataque_maximo}</div>
                    <div><b>Defesa:</b> ${m.defesa_minima} - ${m.defesa_maxima}</div>
                    <div><b>HP:</b> ${m.vida_maxima || 20}</div>
                    <div><b>EXP Fornecida:</b> ${m.recompensa_exp_atual || 1}</div>
                    <div style="grid-column: span 2;"><b>Drops Conhecidos:</b> Jellopy, Maçã, Zaleia, Cents, DK Coin</div>
                </div>
            `;
        };
    });
}