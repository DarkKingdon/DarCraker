import { abrirModalWiki } from './modal_wiki.js';

export async function abrirModalWikiLoots() {
    let modal = document.getElementById('modal-wiki-loots');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-loots';
        modal.className = 'modal-wiki-monstros-overlay'; // reaproveita estilo overlay
        document.body.appendChild(modal);
    }

    // Função utilitária para garantir o caminho correto da imagem
    const getImgSrc = (nomeImg) => {
        if (!nomeImg) return 'https://placehold.co/48x48/333/fff?text=Item';
        if (nomeImg.startsWith('http') || nomeImg.startsWith('/')) return nomeImg;
        // Tenta buscar dentro de /img/icones/
        return `/img/objetos/loots/${nomeImg}`;
    };

    // Loots de exemplo baseados nos objetos cadastrados
    const lootsExemplo = [
        { id: 1, nome: 'Jellopy', tipo: 'material', valor_venda: 1, imagem: 'jellopy.png', descricao: 'Um pequeno e cristalino fragmento de geleia.', dropa_de: 'Poring' },
        { id: 2, nome: 'Cents', tipo: 'moeda', valor_venda: 0, imagem: 'cents.png', descricao: 'A moeda oficial do reino utilizada para negociações.', dropa_de: 'Poring' },
        { id: 3, nome: 'Maçã', tipo: 'consumivel', valor_venda: 1, imagem: 'maca.png', descricao: 'Uma maçã suculenta e bem vermelha. Restaura 10 de vida.', dropa_de: 'Poring' },
        { id: 4, nome: 'Zaleia', tipo: 'material', valor_venda: 1, imagem: 'zaleia.png', descricao: 'Uma substância pegajosa e consistente obtida de monstros.', dropa_de: 'Poring' },
        { id: 5, nome: 'DK Coin', tipo: 'coin', valor_venda: 0, imagem: 'dkcoin.png', descricao: 'Uma moeda especial com o símbolo DK.', dropa_de: 'Poring' }
    ];

    modal.innerHTML = `
        <div class="modal-wiki-monstros-content">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:8px; margin-bottom:15px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <button id="btn-voltar-wiki-loots" style="background:#222; border:1px solid #444; color:#fff; border-radius:4px; padding:4px 8px; cursor:pointer;">⬅ Voltar</button>
                    <h3>💎 Wiki - Loots & Itens</h3>
                </div>
                <button id="fechar-modal-wiki-loots" style="background:none; border:none; color:#ff3333; font-weight:bold; font-size:18px; cursor:pointer;">✕</button>
            </div>

            <!-- Grade de Cards dos Loots -->
            <div style="display:flex; flex-wrap:wrap; gap:12px;" id="grid-wiki-loots">
                ${lootsExemplo.map((item, idx) => {
                    const srcFinal = getImgSrc(item.imagem);
                    return `
                        <div class="card-loot" data-idx="${idx}" style="width:100px; background:#181818; border:1px solid #444; border-radius:6px; padding:8px; text-align:center; cursor:pointer;">
                            <div style="font-size:12px; font-weight:bold; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.nome}</div>
                            <img src="${srcFinal}" style="width:48px; height:48px; object-fit:contain; margin:4px 0;" onerror="this.onerror=null; this.src='/img/${item.imagem}';">
                            <div style="font-size:11px; color:#aaa;">${item.tipo}</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Detalhes do Loot Selecionado -->
            <div id="painel-detalhe-loot" style="display:none;" class="detalhes-monstro-box"></div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('fechar-modal-wiki-loots').onclick = () => modal.style.display = 'none';
    document.getElementById('btn-voltar-wiki-loots').onclick = () => {
        modal.style.display = 'none';
        abrirModalWiki();
    };

    // Clique no Card do Loot
    document.querySelectorAll('#grid-wiki-loots .card-loot').forEach(card => {
        card.onclick = () => {
            const idx = card.getAttribute('data-idx');
            const item = lootsExemplo[idx];
            const srcFinal = getImgSrc(item.imagem);

            const painel = document.getElementById('painel-detalhe-loot');
            painel.style.display = 'flex';
            painel.innerHTML = `
                <div style="text-align:center; min-width:120px;">
                    <img src="${srcFinal}" style="width:64px; height:64px; object-fit:contain;" onerror="this.onerror=null; this.src='/img/${item.imagem}';">
                    <h4 style="color:#00ff88; margin-top:5px;">${item.nome}</h4>
                    <span style="font-size:12px; color:#aaa;">${item.tipo}</span>
                </div>
                <div class="detalhes-info-grid">
                    <div><b>Valor de Venda:</b> ${item.valor_venda} Cents</div>
                    <div><b>Dropa de:</b> ${item.dropa_de}</div>
                    <div style="grid-column: span 2;"><b>Descrição:</b> ${item.descricao}</div>
                </div>
            `;
        };
    });
}