// rotas/ranking/rota_db_buscar_top10_ranking.js

const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Endpoint para buscar o Top 10 jogadores para o Ranking
    router.get('/', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('nome_heroi, nivel, exp_atual')
                .order('nivel', { ascending: false }) // Maior nível primeiro
                .order('exp_atual', { ascending: false }) // Desempata pelo XP
                .limit(10); // Apenas os 10 primeiros

            if (error) return res.status(500).json({ error: error.message });
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar o ranking.' });
        }
    });

    return router;
};