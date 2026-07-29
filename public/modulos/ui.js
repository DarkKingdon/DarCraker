// public/modulos/ui.js

/**
 * Carrega e exibe os dados do herói salvos no localStorage
 */
export function carregarStatus() {
    const heroiData = localStorage.getItem('heroi');

    if (!heroiData) {
        window.location.href = 'index.html';
        return;
    }

    const heroi = JSON.parse(heroiData);

    const elNome = document.getElementById('heroi-nome');
    const elVida = document.getElementById('heroi-vida');

    if (elNome) elNome.innerText = heroi.nome_heroi || 'Desconhecido';
    if (elVida) elVida.innerText = `${heroi.vida_atual || 0} / ${heroi.vida_maxima || 0} HP`;
}

/**
 * Alterna a exibição do painel de Status (retângulo vermelho)
 */
export function toggleStatus() {
    const painelStatus = document.getElementById('painel-status');
    if (painelStatus) {
        if (painelStatus.style.display === 'none' || painelStatus.style.display === '') {
            painelStatus.style.display = 'block';
        } else {
            painelStatus.style.display = 'none';
        }
    }
}

/**
 * Função de Logout
 */
export function sair() {
    localStorage.removeItem('heroi');
    window.location.href = 'index.html';
}