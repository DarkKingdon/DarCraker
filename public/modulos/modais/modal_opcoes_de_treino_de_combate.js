// public/modulos/modais/modal_opcoes_de_treino_de_combate.js

function aplicarEstilosModalTreino() {
    if (document.getElementById('estilo-modal-treino-combate')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-treino-combate';
    style.innerHTML = `
        .modal-treino-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.75); display: flex;
            justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-treino-content {
            background-color: #1a1a1a; border: 2px solid #ff9900;
            border-radius: 8px; width: 320px; padding: 18px;
            box-shadow: 0 0 15px rgba(255, 153, 0, 0.3); color: #fff; font-family: Arial, sans-serif;
        }
        .modal-treino-header {
            font-size: 16px; font-weight: bold; color: #ff9900;
            border-bottom: 1px solid #444; padding-bottom: 8px; margin-bottom: 10px;
            display: flex; align-items: center; gap: 8px;
        }
        .modal-treino-descricao {
            font-size: 12px; color: #aaa; margin-bottom: 15px;
        }
        .treino-opcoes-lista {
            display: flex; flex-direction: column; gap: 8px;
        }
        .treino-opcao-item {
            display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;
            padding: 10px; background: #222; border-radius: 6px; border: 1px solid #333;
            transition: 0.2s;
        }
        .treino-opcao-item:hover { border-color: #ff9900; background: #2a2215; }
        .treino-opcao-item input[type="radio"] { accent-color: #ff9900; cursor: pointer; }
        .btn-fechar-treino {
            background: #ff9900; color: #111; border: none; padding: 8px 12px;
            font-size: 13px; font-weight: bold; border-radius: 4px; cursor: pointer;
            margin-top: 15px; width: 100%; transition: 0.2s;
        }
        .btn-fechar-treino:hover { background: #e68a00; }
    `;
    document.head.appendChild(style);
}

export function abrirModalOpcoesTreinoCombate(treinoAtual, aoSelecionarTreino) {
    aplicarEstilosModalTreino();

    let modal = document.getElementById('modal-treino-combate');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-treino-combate';
        modal.className = 'modal-treino-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-treino-content">
            <div class="modal-treino-header">
                <span>💪 Opções de Treino de Combate</span>
            </div>

            <div class="modal-treino-descricao">
                Escolha qual atributo você deseja treinar abaixo:
            </div>

            <div class="treino-opcoes-lista">
                <label class="treino-opcao-item">
                    <input type="radio" name="opt-treino" value="forca" ${treinoAtual === 'forca' ? 'checked' : ''}>
                    <span>⚔️ Treinar Força</span>
                </label>
                <label class="treino-opcao-item">
                    <input type="radio" name="opt-treino" value="protecao" ${treinoAtual === 'protecao' ? 'checked' : ''}>
                    <span>🛡️ Treinar Proteção</span>
                </label>
                <label class="treino-opcao-item">
                    <input type="radio" name="opt-treino" value="vitalidade" ${treinoAtual === 'vitalidade' ? 'checked' : ''}>
                    <span>❤️ Treinar Vitalidade</span>
                </label>
                <label class="treino-opcao-item">
                    <input type="radio" name="opt-treino" value="inteligencia" ${treinoAtual === 'inteligencia' ? 'checked' : ''}>
                    <span>🧠 Treinar Inteligência</span>
                </label>
            </div>

            <button id="btn-fechar-treino" class="btn-fechar-treino">CONFIRMAR TREINO</button>
        </div>
    `;

    modal.style.display = 'flex';

    document.querySelectorAll('input[name="opt-treino"]').forEach(radio => {
        radio.onchange = (e) => {
            if (aoSelecionarTreino) aoSelecionarTreino(e.target.value);
        };
    });

    document.getElementById('btn-fechar-treino').onclick = () => {
        modal.style.display = 'none';
    };
}