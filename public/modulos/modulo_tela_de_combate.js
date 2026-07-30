// public/modulos/modulo_tela_de_combate.js

/**
 * Injeta os estilos CSS do Retângulo Branco (Tela de Combate / Centro)
 */
function aplicarEstilosCombate() {
    if (document.getElementById('estilo-tela-combate')) return;

    const style = document.createElement('style');
    style.id = 'estilo-tela-combate';
    style.innerHTML = `
        /* ⚪ RETÂNGULO BRANCO (Tela de Combate / Centro) */
        .combat-screen {
            border: 2px solid #ffffff;
            background-color: #121212;
            border-radius: 6px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Renderiza o HTML da tela de combate dentro do elemento central
 */
function renderizarHTMLCombate() {
    const container = document.getElementById('tela-combate');
    if (container) {
        container.className = 'combat-screen';
        container.innerHTML = `
            <h2>⚔️ Tela de Combate</h2>
            <p style="color: #aaa; margin-top: 10px;">Área pronta para o desenvolvimento dos confrontos!</p>
        `;
    }
}

/**
 * Inicializa o Módulo da Tela de Combate
 */
export function inicializarTelaDeCombate() {
    aplicarEstilosCombate();
    renderizarHTMLCombate();
}