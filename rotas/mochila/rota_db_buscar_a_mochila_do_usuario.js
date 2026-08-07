// rotas/mochila/rota_db_buscar_a_mochila_do_usuario.js

const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Endpoint para buscar a mochila do usuário
    router.get('/:usuario_id', async (req, res) => {
        const { usuario_id } = req.params;
        try {
            const { data, error } = await supabase
                .from('mochila')
                .select(`
                    id,
                    quantidade,
                    slot_index,
                    objetos (*)
                `)
                .eq('usuario_id', usuario_id);

            if (error) return res.status(500).json({ error: error.message });
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar mochila.' });
        }
    });

    return router;
};