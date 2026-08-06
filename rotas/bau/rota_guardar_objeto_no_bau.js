// rotas/bau/rota_guardar_objeto_no_bau.js

const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Guardar item da Mochila no Baú (Com auto-organização/reindexação de slots)
    router.post('/guardar', async (req, res) => {
        const { usuario_id, mochila_id, objeto_id, quantidade } = req.body;

        if (!usuario_id || !mochila_id || !objeto_id || !quantidade || quantidade <= 0) {
            return res.status(400).json({ error: 'Dados inválidos para guardar o item.' });
        }

        try {
            // 1. Verifica a quantidade na mochila
            const { data: itemMochila, error: errMochila } = await supabase
                .from('mochila')
                .select('*')
                .eq('id', mochila_id)
                .single();

            if (errMochila || !itemMochila || itemMochila.quantidade < quantidade) {
                return res.status(400).json({ error: 'Quantidade indisponível na mochila.' });
            }

            // 2. Busca itens do Baú para achar slot ou acumular
            const { data: itensBau } = await supabase
                .from('bau')
                .select('*')
                .eq('usuario_id', usuario_id);

            const itemExistenteBau = (itensBau || []).find(b => b.objeto_id === objeto_id);

            if (itemExistenteBau) {
                // Atualiza quantidade no baú
                await supabase
                    .from('bau')
                    .update({ quantidade: itemExistenteBau.quantidade + quantidade })
                    .eq('id', itemExistenteBau.id);
            } else {
                // Encontra o primeiro slot livre de 0 a 39 no baú
                const slotsOcupados = (itensBau || []).map(b => b.slot_index);
                let slotLivre = -1;
                for (let i = 0; i < 40; i++) {
                    if (!slotsOcupados.includes(i)) {
                        slotLivre = i;
                        break;
                    }
                }

                if (slotLivre === -1) {
                    return res.status(400).json({ error: 'O baú está cheio (máximo 40 slots).' });
                }

                // Insere novo slot no baú
                await supabase.from('bau').insert([
                    { usuario_id, objeto_id, quantidade, slot_index: slotLivre }
                ]);
            }

            // 3. Deduz ou remove da mochila
            if (itemMochila.quantidade === quantidade) {
                // Remove o item que esgotou
                await supabase.from('mochila').delete().eq('id', mochila_id);

                // 🔄 REORGANIZAÇÃO/REINDEXAÇÃO DOS SLOTS DA MOCHILA
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
                // Apenas diminui a quantidade
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemMochila.quantidade - quantidade })
                    .eq('id', mochila_id);
            }

            res.json({ message: 'Item guardado no baú com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao guardar item no baú.' });
        }
    });

    return router;
};