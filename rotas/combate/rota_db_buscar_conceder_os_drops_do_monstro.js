const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // Endpoint para processar e conceder TODOS os drops do monstro
    router.post('/drop', async (req, res) => {
        const { usuario_id, monstro_id } = req.body;

        try {
            // 1. Busca os possíveis drops do monstro
            const { data: drops, error } = await supabase
                .from('monstro_drops')
                .select('*, objetos(*)')
                .eq('monstro_id', monstro_id);

            if (error || !drops || drops.length === 0) {
                return res.json({ dropsObtidos: [] });
            }

            const dropsObtidos = [];

            // 2. Busca a mochila atual do usuário
            const { data: mochilaAtual } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', usuario_id);

            let mochilaTemp = [...(mochilaAtual || [])];

            // 3. Testa a porcentagem para CADA item de drop cadastrado
            for (const drop of drops) {
                const Sorteio = Math.random() * 100;
                if (Sorteio <= drop.chance_porcentagem) {
                    const qtdGanha = Math.floor(Math.random() * (drop.qtd_maxima - drop.qtd_minima + 1)) + drop.qtd_minima;
                    const itemGanho = drop.objetos;

                    const itemExistente = mochilaTemp.find(m => m.objeto_id === itemGanho.id);

                    if (itemExistente) {
                        // Incrementa no banco
                        await supabase
                            .from('mochila')
                            .update({ quantidade: itemExistente.quantidade + qtdGanha })
                            .eq('id', itemExistente.id);
                        
                        itemExistente.quantidade += qtdGanha;
                    } else {
                        // Encontra slot livre de 0 a 19
                        const slotsOcupados = mochilaTemp.map(m => m.slot_index);
                        let slotLivre = -1;
                        for (let i = 0; i < 20; i++) {
                            if (!slotsOcupados.includes(i)) {
                                slotLivre = i;
                                break;
                            }
                        }

                        if (slotLivre !== -1) {
                            const { data: novoSlot } = await supabase.from('mochila').insert([
                                { usuario_id, objeto_id: itemGanho.id, quantidade: qtdGanha, slot_index: slotLivre }
                            ]).select().single();

                            if (novoSlot) mochilaTemp.push(novoSlot);
                        }
                    }

                    dropsObtidos.push({ item: itemGanho, quantidade: qtdGanha });
                }
            }

            res.json({ dropsObtidos });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao processar drops.' });
        }
    });

    return router;
};