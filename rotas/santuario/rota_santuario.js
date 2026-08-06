// rotas/santuario/rota_santuario.js

const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Restaurar Vida 100%
    router.post('/restaurar', async (req, res) => {
        const { heroi_id } = req.body;

        if (!heroi_id) {
            return res.status(400).json({ error: 'ID do herói é obrigatório.' });
        }

        try {
            // 1. Busca os dados atuais do herói
            const { data: heroi, error } = await supabase
                .from('usuarios')
                .select('vida_maxima, ultimo_uso_santuario')
                .eq('id', heroi_id)
                .single();

            if (error || !heroi) {
                return res.status(404).json({ error: 'Herói não encontrado.' });
            }

            const agora = new Date();
            const cooldownMs = 30 * 60 * 1000; // 30 minutos em milissegundos

            // 2. Verifica Cooldown
            if (heroi.ultimo_uso_santuario) {
                const ultimoUso = new Date(heroi.ultimo_uso_santuario);
                const tempoDecorrido = agora - ultimoUso;

                if (tempoDecorrido < cooldownMs) {
                    const restanteSegundos = Math.ceil((cooldownMs - tempoDecorrido) / 1000);
                    return res.status(400).json({ 
                        error: 'Restauração em tempo de recarga.',
                        restante: restanteSegundos 
                    });
                }
            }

            // 3. Atualiza Vida e grava a nova Timestamp
            const { data: usuarioAtualizado, error: errorUpdate } = await supabase
                .from('usuarios')
                .update({
                    vida_atual: heroi.vida_maxima,
                    ultimo_uso_santuario: agora.toISOString()
                })
                .eq('id', heroi_id)
                .select('*')
                .single();

            if (errorUpdate) {
                return res.status(500).json({ error: errorUpdate.message });
            }

            return res.json({ 
                message: 'Vida restaurada em 100% com sucesso!', 
                usuario: usuarioAtualizado 
            });

        } catch (err) {
            console.error('Erro no Santuário:', err);
            res.status(500).json({ error: 'Erro interno ao processar restauração.' });
        }
    });

    return router;
};