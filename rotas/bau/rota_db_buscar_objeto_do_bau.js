// rotas/bau/rota_db_buscar_objeto_do_bau.js

const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Buscar itens do Baú por usuario_id
    router.get('/:usuario_id', async (req, res) => {
        const { usuario_id } = req.params;
        try {
            const { data, error } = await supabase
                .from('bau')
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
            res.status(500).json({ error: 'Erro ao buscar itens do baú.' });
        }
    });

    return router;
};