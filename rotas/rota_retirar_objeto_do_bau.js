const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Retirar item do Baú para a Mochila (Com auto-organização/reindexação de slots)
    router.post('/retirar', async (req, res) => {
        const { usuario_id, bau_id, objeto_id, quantidade } = req.body;

        if (!usuario_id || !bau_id || !objeto_id || !quantidade || quantidade <= 0) {
            return res.status(400).json({ error: 'Dados inválidos para retirar o item.' });
        }

        try {
            // 1. Verifica a quantidade disponível no Baú
            const { data: itemBau, error: errBau } = await supabase
                .from('bau')
                .select('*')
                .eq('id', bau_id)
                .single();

            if (errBau || !itemBau || itemBau.quantidade < quantidade) {
                return res.status(400).json({ error: 'Quantidade indisponível no baú.' });
            }

            // 2. Busca itens da Mochila para checar se já existe ou se há slot livre
            const { data: itensMochila } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', usuario_id);

            const itemExistenteMochila = (itensMochila || []).find(m => m.objeto_id === objeto_id);

            if (itemExistenteMochila) {
                // Acumula na quantidade da mochila
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemExistenteMochila.quantidade + quantidade })
                    .eq('id', itemExistenteMochila.id);
            } else {
                // Verifica o número de slots ocupados
                const slotsOcupados = (itensMochila || []).map(m => m.slot_index);
                let slotLivre = -1;
                for (let i = 0; i < 20; i++) {
                    if (!slotsOcupados.includes(i)) {
                        slotLivre = i;
                        break;
                    }
                }

                if (slotLivre === -1) {
                    return res.status(400).json({ error: 'Sua mochila está cheia (máximo 20 slots).' });
                }

                // Insere no slot livre da mochila
                await supabase.from('mochila').insert([
                    { usuario_id, objeto_id, quantidade, slot_index: slotLivre }
                ]);
            }

            // 3. Reduz ou remove do Baú
            if (itemBau.quantidade === quantidade) {
                // Remove o registro do Baú se zerou
                await supabase.from('bau').delete().eq('id', bau_id);

                // 🔄 REORGANIZAÇÃO/REINDEXAÇÃO DOS SLOTS DO BAÚ
                const { data: itensRestantesBau } = await supabase
                    .from('bau')
                    .select('*')
                    .eq('usuario_id', usuario_id)
                    .order('slot_index', { ascending: true });

                if (itensRestantesBau && itensRestantesBau.length > 0) {
                    for (let index = 0; index < itensRestantesBau.length; index++) {
                        const item = itensRestantesBau[index];
                        if (item.slot_index !== index) {
                            await supabase
                                .from('bau')
                                .update({ slot_index: index })
                                .eq('id', item.id);
                        }
                    }
                }
            } else {
                // Apenas diminui a quantidade no Baú
                await supabase
                    .from('bau')
                    .update({ quantidade: itemBau.quantidade - quantidade })
                    .eq('id', bau_id);
            }

            res.json({ message: 'Item retirado do baú com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao retirar item do baú.' });
        }
    });

    return router;
};