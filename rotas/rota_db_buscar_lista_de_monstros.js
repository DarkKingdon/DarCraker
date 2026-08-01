const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Rota para buscar a lista de monstros
    router.get('/', async (req, res) => {
        try {
            const { data, error } = await supabase.from('monstros').select('*');
            if (error) return res.status(500).json({ error: error.message });
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar monstros.' });
        }
    });

    return router;
};