const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Rota para salvar a atualização de status do herói (XP, Nível, Pontos, etc.)
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const novosDados = req.body;

        try {
            const { data, error } = await supabase
                .from('usuarios')
                .update(novosDados)
                .eq('id', id)
                .select('*')
                .single();

            if (error) return res.status(500).json({ error: error.message });
            res.json({ message: 'Heroi atualizado com sucesso!', usuario: data });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao salvar dados do herói.' });
        }
    });

    return router;
};