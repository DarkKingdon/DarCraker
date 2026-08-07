// public/modulos/modais/combate/modal_opcoes_de_combate.js

function aplicarEstilosModalOpcoes() {
    if (document.getElementById('estilo-modal-opcoes-combate')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-opcoes-combate';
    style.innerHTML = `
        .modal-opcoes-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.75); display: flex;
            justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-opcoes-content {
            background-color: #1a1a1a; border: 2px solid #555;
            border-radius: 8px; width: 300px; padding: 15px;
            box-shadow: 0 0 12px rgba(0,0,0,0.8); color: #fff; font-family: Arial, sans-serif;
        }
        .modal-opcoes-header {
            font-size: 16px; font-weight: bold; color: #ff9900;
            border-bottom: 1px solid #444; padding-bottom: 8px; margin-bottom: 12px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .opcao-item {
            display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;
            padding: 8px; background: #222; border-radius: 4px; border: 1px solid #333;
        }
        .opcao-item:hover { border-color: #666; }
        .btn-fechar-opcoes {
            background: #333; color: #fff; border: 1px solid #555; padding: 6px 12px;
            font-size: 12px; border-radius: 4px; cursor: pointer; margin-top: 15px; width: 100%;
        }
        .btn-fechar-opcoes:hover { background: #444; }
    `;
    document.head.appendChild(style);
}

export function abrirModalOpcoesCombate(aoAlterarOpcao) {
    aplicarEstilosModalOpcoes();

    let modal = document.getElementById('modal-opcoes-combate');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-opcoes-combate';
        modal.className = 'modal-opcoes-overlay';
        document.body.appendChild(modal);
    }

    const exibirPorcentagem = localStorage.getItem('opcoes_exibir_porcentagem') === 'true';

    modal.innerHTML = `
        <div class="modal-opcoes-content">
            <div class="modal-opcoes-header">
                <span>⚙️ Opções de Combate</span>
            </div>

            <label class="opcao-item">
                <input type="checkbox" id="chk-porcentagem" ${exibirPorcentagem ? 'checked' : ''}>
                <span>Mostrar Vida/Mana por Porcentagem (%)</span>
            </label>

            <button id="btn-fechar-opcoes" class="btn-fechar-opcoes">FECHAR E SALVAR</button>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('chk-porcentagem').onchange = (e) => {
        localStorage.setItem('opcoes_exibir_porcentagem', e.target.checked);
        if (aoAlterarOpcao) aoAlterarOpcao();
    };

    document.getElementById('btn-fechar-opcoes').onclick = () => {
        modal.style.display = 'none';
    };
}