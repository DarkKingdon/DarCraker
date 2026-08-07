// public/modulos/modais/ranking/modal_ranking.js

function aplicarEstilosModalRanking() {
    if (document.getElementById('estilo-modal-ranking')) return;

    const style = document.createElement('style');
    style.id = 'estilo-modal-ranking';
    style.innerHTML = `
        .ranking-modal-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .ranking-modal-content {
            background: #121212;
            border: 2px solid #ffd700;
            border-radius: 8px;
            width: 400px;
            max-width: 90%;
            padding: 20px;
            color: #fff;
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        }

        .ranking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .ranking-table {
            width: 100%;
            border-collapse: collapse;
        }

        .ranking-table th, .ranking-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #222;
        }

        .ranking-table th {
            color: #ffd700;
        }

        .posicao-top1 { color: #ffd700; font-weight: bold; } /* Ouro */
        .posicao-top2 { color: #c0c0c0; font-weight: bold; } /* Prata */
        .posicao-top3 { color: #cd7f32; font-weight: bold; } /* Bronze */

        .btn-fechar-ranking {
            background: transparent;
            border: none;
            color: #ff4d4d;
            font-size: 20px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

export async function abrirModalRanking() {
    aplicarEstilosModalRanking();

    // Remove se já houver um aberto
    document.getElementById('modal-ranking')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-ranking';
    overlay.className = 'ranking-modal-overlay';

    overlay.innerHTML = `
        <div class="ranking-modal-content">
            <div class="ranking-header">
                <h2 style="color: #ffd700;">🏆 Top 10 Jogadores</h2>
                <button class="btn-fechar-ranking" id="fechar-modal-ranking">✖</button>
            </div>
            <div id="corpo-ranking">
                <p>Carregando ranking...</p>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('fechar-modal-ranking').addEventListener('click', () => overlay.remove());

    // Busca os dados da API
    try {
        const res = await fetch('/api/ranking');
        const rankingData = await res.json();

        const container = document.getElementById('corpo-ranking');

        if (!rankingData || rankingData.length === 0) {
            container.innerHTML = '<p>Nenhum jogador encontrado.</p>';
            return;
        }

        let tabelaHTML = `
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Pos.</th>
                        <th>Herói</th>
                        <th>Nível</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rankingData.forEach((jogador, index) => {
            const pos = index + 1;
            let classePosicao = '';
            if (pos === 1) classePosicao = 'posicao-top1';
            else if (pos === 2) classePosicao = 'posicao-top2';
            else if (pos === 3) classePosicao = 'posicao-top3';

            tabelaHTML += `
                <tr class="${classePosicao}">
                    <td>#${pos}</td>
                    <td>${jogador.nome_heroi}</td>
                    <td>Lv. ${jogador.nivel}</td>
                </tr>
            `;
        });

        tabelaHTML += `</tbody></table>`;
        container.innerHTML = tabelaHTML;

    } catch (err) {
        document.getElementById('corpo-ranking').innerHTML = '<p style="color:red;">Erro ao carregar o ranking.</p>';
    }
}