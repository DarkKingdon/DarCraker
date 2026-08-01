const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Endpoint para consumir item da mochila
    router.post('/consumir', async (req, res) => {
        const { usuario_id, mochila_id } = req.body;

        if (!usuario_id || !mochila_id) {
            return res.status(400).json({ error: 'Dados inválidos para consumir o item.' });
        }

        try {
            // 1. Busca o item na mochila com os dados do objeto
            const { data: itemMochila, error: errMochila } = await supabase
                .from('mochila')
                .select('*, objetos(*)')
                .eq('id', mochila_id)
                .single();

            if (errMochila || !itemMochila) {
                return res.status(400).json({ error: 'Item não encontrado na mochila.' });
            }

            const objeto = itemMochila.objetos;

            // 2. Validação tolerante a maiúsculas/minúsculas
            if (!objeto.tipo || objeto.tipo.toLowerCase() !== 'consumivel') {
                return res.status(400).json({ error: 'Este item não pode ser consumido.' });
            }

            // 3. Busca o herói no banco para ler/alterar a vida
            const { data: heroi, error: errHeroi } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', usuario_id)
                .single();

            if (errHeroi || !heroi) {
                return res.status(400).json({ error: 'Herói não encontrado.' });
            }

            // Recupera 10 de vida (conforme descrição da Maçã)
            const cura = 10; 
            const novaVida = Math.min(heroi.vida_maxima, heroi.vida_atual + cura);

            // 4. Atualiza a vida do herói no Supabase
            const { data: heroiAtualizado, error: errUpdateHeroi } = await supabase
                .from('usuarios')
                .update({ vida_atual: novaVida })
                .eq('id', usuario_id)
                .select('*')
                .single();

            if (errUpdateHeroi) {
                return res.status(500).json({ error: 'Erro ao atualizar a vida do herói.' });
            }

            // 5. Deduz ou remove o item da mochila
            if (itemMochila.quantidade === 1) {
                await supabase.from('mochila').delete().eq('id', mochila_id);

                // Reorganiza os slots restantes da mochila
                const { data: itensRestantes } = await supabase
                    .from('mochila')
                    .select('*')
                    .eq('usuario_id', usuario_id)
                    .order('slot_index', { ascending: true });

                if (itensRestantes && itensRestantes.length > 0) {
                    for (let index = 0; index < itensRestantes.length; index++) {
                        const item = itensRestantes[index];
                        if (item.slot_index !== index) {
                            await supabase
                                .from('mochila')
                                .update({ slot_index: index })
                                .eq('id', item.id);
                        }
                    }
                }
            } else {
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemMochila.quantidade - 1 })
                    .eq('id', mochila_id);
            }

            res.json({
                message: `Você consumiu ${objeto.nome} e recuperou ${cura} de Vida!`,
                usuario: heroiAtualizado
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao consumir o item.' });
        }
    });

    return router;
};