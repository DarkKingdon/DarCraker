// public/modulos/modais/modal_market.js

function aplicarEstilosMarket() {
    if (document.getElementById('estilo-modal-market')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-market';
    style.innerHTML = `
        .modal-market-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.85); display: flex;
            justify-content: center; align-items: center; z-index: 9999;
        }
        .modal-market-content {
            background-color: #181818; border: 2px solid #00a2ff;
            border-radius: 8px; width: 620px; max-height: 85vh;
            padding: 15px; color: #fff; display: flex; flex-direction: column; gap: 10px;
            font-family: Arial, sans-serif;
        }
        .market-header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #333; padding-bottom: 8px;
        }
        .market-header h3 { margin: 0; color: #00a2ff; }
        .market-top-bar {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #333; padding-bottom: 8px; gap: 10px; flex-wrap: wrap;
        }
        .market-tabs { display: flex; gap: 5px; }
        .tab-btn {
            background: #222; border: 1px solid #444; color: #ccc;
            padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;
        }
        .tab-btn.active {
            background: #00a2ff; color: #fff; border-color: #00a2ff; font-weight: bold;
        }
        .area-filtros-container {
            display: flex; gap: 6px; align-items: center;
        }
        .select-filtro {
            background: #222; color: #00ff88; border: 1px solid #444;
            padding: 5px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;
        }
        .market-list {
            display: flex; flex-direction: column; gap: 8px;
            max-height: 380px; overflow-y: auto; padding-right: 5px; min-height: 200px;
        }
        .market-item-row {
            display: flex; align-items: center; justify-content: space-between;
            background: #222; border: 1px solid #333; border-radius: 5px; padding: 8px 12px;
        }
        .market-item-info { display: flex; align-items: center; gap: 10px; }
        .market-item-info img { width: 32px; height: 32px; object-fit: contain; }
        .btn-comprar {
            background: #00ff88; color: #121212; border: none; padding: 6px 12px;
            border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;
        }
        .btn-comprar:hover { background: #00cc6d; }
        .btn-cancelar {
            background: #ff4444; color: #fff; border: none; padding: 6px 12px;
            border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;
        }
        .btn-cancelar:hover { background: #cc0000; }
        
        /* Formulário Vender */
        .form-vender {
            display: flex; flex-direction: column; gap: 12px; padding: 10px; background: #222;
            border-radius: 6px; border: 1px solid #333;
        }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-group label { font-size: 12px; color: #aaa; }
        .form-group select, .form-group input {
            background: #141414; border: 1px solid #444; color: #fff;
            padding: 8px; border-radius: 4px;
        }
        .btn-anunciar {
            background: #00a2ff; color: #fff; border: none; padding: 10px;
            border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 5px;
        }
        .btn-anunciar:hover { background: #0088cc; }

        /* Modal Interno de Seleção de Quantidade */
        .modal-qtd-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.7); display: flex;
            justify-content: center; align-items: center; z-index: 10000;
        }
        .modal-qtd-card {
            background: #1c1c1c; border: 2px solid #00ff88; border-radius: 8px;
            padding: 18px; width: 320px; display: flex; flex-direction: column;
            gap: 12px; color: #fff; font-family: Arial, sans-serif; box-shadow: 0 0 15px rgba(0,255,136,0.2);
        }
        .modal-qtd-card h4 { margin: 0; color: #00ff88; font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 6px; }
        .modal-qtd-card input {
            background: #101010; border: 1px solid #444; color: #fff;
            padding: 8px; border-radius: 4px; font-size: 14px; width: 100%; box-sizing: border-box;
        }
        .modal-qtd-btns { display: flex; justify-content: flex-end; gap: 8px; margin-top: 5px; }
        .btn-confirmar-qtd { background: #00ff88; color: #111; border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; }
        .btn-cancelar-qtd { background: #444; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
    `;
    document.head.appendChild(style);
}

let abaAtual = 'comprar';
let todasOfertasCarregadas = [];

export async function abrirModalMarket() {
    aplicarEstilosMarket();

    let modal = document.getElementById('modal-market');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-market';
        modal.className = 'modal-market-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-market-content">
            <div class="market-header">
                <h3>⚖️ Mercado (Market)</h3>
                <button id="fechar-modal-market" style="background:none; border:none; color:#ff3333; font-weight:bold; cursor:pointer; font-size:16px;">X</button>
            </div>

            <div class="market-top-bar">
                <div class="market-tabs">
                    <button class="tab-btn active" id="tab-comprar">🛒 Ofertas</button>
                    <button class="tab-btn" id="tab-minhas">📦 Minhas Ofertas</button>
                    <button class="tab-btn" id="tab-vender">➕ Vender Item</button>
                </div>

                <div id="area-filtro" class="area-filtros-container">
                    <select id="filtro-tipo" class="select-filtro">
    <option value="todos">Todos os Tipos</option>
    <option value="material">Materiais</option>
    <option value="consumivel">Consumíveis</option>
    <option value="equipamento">Equipamentos</option>
    <option value="coin">Coins</option> <!-- Alterado de moeda para coin -->
</select>

                    <select id="filtro-item" class="select-filtro">
                        <option value="todos">Todos os Itens</option>
                    </select>
                </div>
            </div>

            <div id="market-body" class="market-list">
                <p style="text-align:center;">Carregando ofertas...</p>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('fechar-modal-market').onclick = () => modal.style.display = 'none';

    document.getElementById('tab-comprar').onclick = () => alternarAba('comprar');
    document.getElementById('tab-minhas').onclick = () => alternarAba('minhas');
    document.getElementById('tab-vender').onclick = () => alternarAba('vender');

    document.getElementById('filtro-tipo').onchange = async () => {
        await buscarOfertasDoServidor();
    };

    document.getElementById('filtro-item').onchange = () => {
        renderizarOfertasFiltradas();
    };

    alternarAba('comprar');
}

function alternarAba(aba) {
    abaAtual = aba;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${aba}`)?.classList.add('active');

    const areaFiltro = document.getElementById('area-filtro');
    if (areaFiltro) {
        areaFiltro.style.display = (aba === 'comprar') ? 'flex' : 'none';
    }

    if (aba === 'comprar') buscarOfertasDoServidor();
    if (aba === 'minhas') carregarMinhasOfertas();
    if (aba === 'vender') carregarFormularioVender();
}

async function buscarOfertasDoServidor() {
    const container = document.getElementById('market-body');
    if (!container) return;

    const tipoFiltro = document.getElementById('filtro-tipo')?.value || 'todos';

    try {
        const res = await fetch(`/api/market/ofertas?tipo=${tipoFiltro}`);
        todasOfertasCarregadas = await res.json();

        atualizarOpcoesDoSelectDeItens();
        renderizarOfertasFiltradas();
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:#ff4444; text-align:center;">Erro ao carregar mercado.</p>';
    }
}

function atualizarOpcoesDoSelectDeItens() {
    const selectItem = document.getElementById('filtro-item');
    if (!selectItem) return;

    const valorAnterior = selectItem.value;

    const itensUnicosMap = new Map();
    if (Array.isArray(todasOfertasCarregadas)) {
        todasOfertasCarregadas.forEach(oferta => {
            if (oferta.objeto && !itensUnicosMap.has(oferta.objeto.id)) {
                itensUnicosMap.set(oferta.objeto.id, oferta.objeto.nome);
            }
        });
    }

    let optionsHtml = '<option value="todos">Todos os Itens</option>';
    itensUnicosMap.forEach((nome, id) => {
        optionsHtml += `<option value="${id}">${nome}</option>`;
    });

    selectItem.innerHTML = optionsHtml;

    if (itensUnicosMap.has(parseInt(valorAnterior))) {
        selectItem.value = valorAnterior;
    } else {
        selectItem.value = 'todos';
    }
}

function renderizarOfertasFiltradas() {
    const container = document.getElementById('market-body');
    if (!container) return;

    const itemFiltro = document.getElementById('filtro-item')?.value || 'todos';

    let ofertasExibicao = todasOfertasCarregadas || [];

    if (itemFiltro !== 'todos') {
        ofertasExibicao = ofertasExibicao.filter(item => item.objeto && item.objeto.id === parseInt(itemFiltro));
    }

    if (ofertasExibicao.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Nenhuma oferta encontrada para este item.</p>';
        return;
    }

    const heroi = JSON.parse(localStorage.getItem('heroi'));
    let html = '';

    ofertasExibicao.forEach(item => {
        const precoTotal = item.quantidade * item.preco_unitario;
        let imgSrc = item.objeto?.imagem_url || 'jellopy.png';
        if (!imgSrc.startsWith('/img/objetos/loots/') && !imgSrc.startsWith('img/objetos/loots/')) {
            imgSrc = 'img/objetos/loots/' + imgSrc;
        }

        const ehMeuItem = heroi && heroi.id === item.vendedor_id;

        html += `
            <div class="market-item-row">
                <div class="market-item-info">
                    <img src="${imgSrc}" alt="${item.objeto?.nome}">
                    <div>
                        <strong>${item.objeto?.nome}</strong> (x${item.quantidade})<br>
                        <small style="color:#aaa;">Vendedor: ${item.vendedor?.nome_heroi || 'Desconhecido'}</small>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="text-align: right;">
                        <div style="color: #ffb700; font-weight: bold;">${precoTotal} Cents</div>
                        <small style="color: #888;">(${item.preco_unitario} un)</small>
                    </div>
                    ${ehMeuItem ? `
                        <span style="color:#888; font-size:12px;">Seu Anúncio</span>
                    ` : `
                        <button class="btn-comprar" data-id="${item.id}">Comprar</button>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.onclick = () => abrirModalQuantidadeCompra(btn.getAttribute('data-id'));
    });
}

// Abrir modal de seleção de quantidade
function abrirModalQuantidadeCompra(ofertaId) {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return alert('Faça login para comprar!');

    const oferta = todasOfertasCarregadas.find(o => o.id === parseInt(ofertaId));
    if (!oferta) return alert('Oferta não encontrada.');

    let modalQtd = document.getElementById('modal-qtd-compra');
    if (!modalQtd) {
        modalQtd = document.createElement('div');
        modalQtd.id = 'modal-qtd-compra';
        modalQtd.className = 'modal-qtd-overlay';
        document.body.appendChild(modalQtd);
    }

    modalQtd.innerHTML = `
        <div class="modal-qtd-card">
            <h4>Comprar ${oferta.objeto?.nome || 'Item'}</h4>
            <div style="font-size:13px; color:#aaa;">
                Disponível: <strong style="color:#fff;">${oferta.quantidade}</strong> un.<br>
                Preço un: <strong style="color:#ffb700;">${oferta.preco_unitario} Cents</strong>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:4px;">
                <label style="font-size:12px; color:#ccc;">Quantidade a comprar:</label>
                <input type="number" id="input-modal-qtd" min="1" max="${oferta.quantidade}" value="1">
            </div>

            <div style="text-align:right; font-size:13px;">
                Total: <strong id="lbl-total-modal-qtd" style="color:#ffb700;">${oferta.preco_unitario} Cents</strong>
            </div>

            <div class="modal-qtd-btns">
                <button class="btn-cancelar-qtd" id="btn-fechar-modal-qtd">Cancelar</button>
                <button class="btn-confirmar-qtd" id="btn-confirmar-compra-qtd">Confirmar</button>
            </div>
        </div>
    `;

    modalQtd.style.display = 'flex';

    const inputQtd = document.getElementById('input-modal-qtd');
    const lblTotal = document.getElementById('lbl-total-modal-qtd');

    inputQtd.oninput = () => {
        let qtd = parseInt(inputQtd.value) || 1;
        if (qtd > oferta.quantidade) qtd = oferta.quantidade;
        if (qtd < 1) qtd = 1;
        lblTotal.textContent = `${qtd * oferta.preco_unitario} Cents`;
    };

    document.getElementById('btn-fechar-modal-qtd').onclick = () => {
        modalQtd.style.display = 'none';
    };

    document.getElementById('btn-confirmar-compra-qtd').onclick = async () => {
        const quantidade = parseInt(inputQtd.value);
        if (!quantidade || quantidade <= 0 || quantidade > oferta.quantidade) {
            return alert('Insira uma quantidade válida!');
        }

        modalQtd.style.display = 'none';
        await realizarCompra(oferta.id, quantidade);
    };
}

async function realizarCompra(ofertaId, quantidade) {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return alert('Faça login para comprar!');

    try {
        const res = await fetch('/api/market/comprar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comprador_id: heroi.id,
                oferta_id: parseInt(ofertaId),
                quantidade: quantidade
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            buscarOfertasDoServidor();
        } else {
            alert(data.error || 'Erro ao comprar item.');
        }
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
}

// ==========================================
// ABA 2: MINHAS OFERTAS
// ==========================================
async function carregarMinhasOfertas() {
    const container = document.getElementById('market-body');
    if (!container) return;

    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    try {
        const res = await fetch(`/api/market/minhas-ofertas/${heroi.id}`);
        const ofertas = await res.json();

        if (!ofertas || ofertas.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Você não tem itens à venda no momento.</p>';
            return;
        }

        let html = '';
        ofertas.forEach(item => {
            const precoTotal = item.quantidade * item.preco_unitario;
            let imgSrc = item.objeto?.imagem_url || 'jellopy.png';
            if (!imgSrc.startsWith('/img/objetos/loots/') && !imgSrc.startsWith('img/objetos/loots/')) {
                imgSrc = 'img/objetos/loots/' + imgSrc;
            }

            html += `
                <div class="market-item-row">
                    <div class="market-item-info">
                        <img src="${imgSrc}" alt="${item.objeto?.nome}">
                        <div>
                            <strong>${item.objeto?.nome}</strong> (x${item.quantidade})<br>
                            <small style="color:#888;">Unitário: ${item.preco_unitario} Cents</small>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="color: #ffb700; font-weight: bold;">${precoTotal} Cents</div>
                        <button class="btn-cancelar" data-id="${item.id}">Cancelar</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('.btn-cancelar').forEach(btn => {
            btn.onclick = () => cancelarOferta(btn.getAttribute('data-id'));
        });

    } catch (err) {
        container.innerHTML = '<p style="color:#ff4444; text-align:center;">Erro ao carregar suas ofertas.</p>';
    }
}

async function cancelarOferta(ofertaId) {
    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    if (!confirm('Deseja cancelar esta oferta? O item retornará para sua mochila.')) return;

    try {
        const res = await fetch('/api/market/cancelar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vendedor_id: heroi.id,
                oferta_id: parseInt(ofertaId)
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            carregarMinhasOfertas();
        } else {
            alert(data.error || 'Erro ao cancelar oferta.');
        }
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
}

// ==========================================
// ABA 3: VENDER ITEM
// ==========================================
async function carregarFormularioVender() {
    const container = document.getElementById('market-body');
    if (!container) return;

    const heroi = JSON.parse(localStorage.getItem('heroi'));
    if (!heroi) return;

    container.innerHTML = '<p style="text-align:center;">Buscando itens da sua mochila...</p>';

    try {
        const res = await fetch(`/api/mochila/${heroi.id}`);
        const itensMochila = await res.json();

        const itensVendaveis = (itensMochila || []).filter(item => item.objetos && item.objetos.tipo !== 'moeda');

        if (itensVendaveis.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Sua mochila não possui itens vendáveis no momento.</p>';
            return;
        }

        let optionsItens = '<option value="">Selecione um item...</option>';
        itensVendaveis.forEach(item => {
            const objId = item.objetos ? item.objetos.id : item.objeto_id;
            optionsItens += `<option value="${item.id}" data-objeto="${objId}" data-max="${item.quantidade}">${item.objetos.nome} (Qtd disponível: ${item.quantidade})</option>`;
        });

        container.innerHTML = `
            <form id="form-vender-market" class="form-vender">
                <div class="form-group">
                    <label>Selecione o Item da Mochila:</label>
                    <select id="select-item-vender" required>${optionsItens}</select>
                </div>

                <div class="form-group">
                    <label>Quantidade a vender:</label>
                    <input type="number" id="input-qtd-vender" min="1" value="1" required disabled>
                </div>

                <div class="form-group">
                    <label>Preço por Unidade (Cents):</label>
                    <input type="number" id="input-preco-vender" min="1" placeholder="Ex: 2" required>
                </div>

                <div style="background:#141414; padding:8px; border-radius:4px; font-size:13px; text-align:right;">
                    Total da Venda: <strong id="lbl-total-venda" style="color:#ffb700;">0 Cents</strong>
                </div>

                <button type="submit" class="btn-anunciar">🚀 Colocar no Mercado</button>
            </form>
        `;

        const selectItem = document.getElementById('select-item-vender');
        const inputQtd = document.getElementById('input-qtd-vender');
        const inputPreco = document.getElementById('input-preco-vender');
        const lblTotal = document.getElementById('lbl-total-venda');

        selectItem.onchange = () => {
            const selectedOpt = selectItem.options[selectItem.selectedIndex];
            if (selectedOpt.value) {
                const maxQtd = parseInt(selectedOpt.getAttribute('data-max'));
                inputQtd.max = maxQtd;
                inputQtd.value = 1;
                inputQtd.disabled = false;
            } else {
                inputQtd.disabled = true;
                inputQtd.value = 1;
            }
            calcularTotal();
        };

        inputQtd.oninput = calcularTotal;
        inputPreco.oninput = calcularTotal;

        function calcularTotal() {
            const qtd = parseInt(inputQtd.value) || 0;
            const preco = parseInt(inputPreco.value) || 0;
            lblTotal.textContent = `${qtd * preco} Cents`;
        }

        document.getElementById('form-vender-market').onsubmit = async (e) => {
            e.preventDefault();

            const selectedOpt = selectItem.options[selectItem.selectedIndex];
            if (!selectedOpt || !selectedOpt.value) return alert('Selecione um item!');

            const mochilaId = parseInt(selectedOpt.value);
            const objetoId = parseInt(selectedOpt.getAttribute('data-objeto'));
            const quantidade = parseInt(inputQtd.value);
            const precoUnitario = parseInt(inputPreco.value);

            if (!mochilaId || !objetoId || !quantidade || !precoUnitario) {
                return alert('Por favor, selecione um item válido e preencha todos os campos.');
            }

            try {
                const resAnuncio = await fetch('/api/market/vender', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendedor_id: heroi.id,
                        mochila_id: mochilaId,
                        objeto_id: objetoId,
                        quantidade,
                        preco_unitario: precoUnitario
                    })
                });

                const dataAnuncio = await resAnuncio.json();
                if (resAnuncio.ok) {
                    alert(dataAnuncio.message);
                    alternarAba('minhas');
                } else {
                    alert(dataAnuncio.error || 'Erro ao colocar item à venda.');
                }
            } catch (err) {
                alert('Erro de conexão com o servidor.');
            }
        };

    } catch (err) {
        container.innerHTML = '<p style="color:#ff4444; text-align:center;">Erro ao carregar sua mochila.</p>';
    }
}