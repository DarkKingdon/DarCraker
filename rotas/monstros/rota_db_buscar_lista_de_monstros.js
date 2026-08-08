// rotas/monstros/rota_db_buscar_lista_de_monstros.js

const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Rota para buscar a lista de monstros incluindo os drops conhecidos
    router.get('/', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('monstros')
                .select(`
                    *,
                    monstro_drops (
                        objetos (
                            nome
                        )
                    )
                `);

            if (error) return res.status(500).json({ error: error.message });

            // Formata o retorno para incluir uma lista com o nome de cada drop
            const monstrosComDrops = data.map(monstro => {
                const dropsNomes = (monstro.monstro_drops || [])
                    .map(d => d.objetos ? d.objetos.nome : null)
                    .filter(Boolean);

                return {
                    ...monstro,
                    drops: dropsNomes
                };
            });

            res.json(monstrosComDrops);
        } catch (err) {
            console.error('Erro ao buscar lista de monstros:', err);
            res.status(500).json({ error: 'Erro ao buscar monstros.' });
        }
    });

    return router;
};