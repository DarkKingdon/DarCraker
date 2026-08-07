// rotas/correio/rota_correio.js

const express = require('express');

module.exports = function(supabase) {
    const router = express.Router();

    // 1. Buscar destinatário por nome e retornar Nome + Nível
    router.get('/verificar/:nome', async (req, res) => {
        const { nome } = req.params;
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id, nome_heroi, nivel')
                .ilike('nome_heroi', nome.trim())
                .maybeSingle();

            if (error) return res.status(500).json({ error: error.message });
            if (!data) return res.status(404).json({ error: 'Jogador não encontrado!' });

            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao verificar jogador.' });
        }
    });

    // 2. Enviar mensagem com Cents e até 5 Itens
    router.post('/enviar', async (req, res) => {
        const { remetente_id, destinatario_id, descricao, cents, itens } = req.body;

        if (!remetente_id || !destinatario_id) {
            return res.status(400).json({ error: 'Parâmetros inválidos.' });
        }

        if (remetente_id === destinatario_id) {
            return res.status(400).json({ error: 'Você não pode enviar correio para si mesmo!' });
        }

        const qtdCents = parseInt(cents) || 0;
        if (qtdCents < 0) {
            return res.status(400).json({ error: 'Quantidade de cents inválida.' });
        }

        try {
            // Verificar Cents na mochila ou saldo do remetente
            if (qtdCents > 0) {
                const { data: itemCents } = await supabase
                    .from('mochila')
                    .select('*')
                    .eq('usuario_id', remetente_id)
                    .eq('objeto_id', 2) // Objeto 2 = Cents
                    .single();

                if (!itemCents || itemCents.quantidade < qtdCents) {
                    return res.status(400).json({ error: 'Você não possui Cents suficientes na mochila!' });
                }
            }

            // Validar itens enviados
            if (itens && itens.length > 5) {
                return res.status(400).json({ error: 'Você só pode enviar no máximo 5 itens!' });
            }

            // Validação de posse dos itens na mochila
            if (itens && itens.length > 0) {
                for (const item of itens) {
                    const { data: mochilaSlot } = await supabase
                        .from('mochila')
                        .select('*')
                        .eq('usuario_id', remetente_id)
                        .eq('objeto_id', item.objeto_id)
                        .single();

                    if (!mochilaSlot || mochilaSlot.quantidade < item.quantidade) {
                        return res.status(400).json({ error: 'Item insuficiente na sua mochila!' });
                    }
                }
            }

            // Criar a mensagem no correio
            const { data: novoCorreio, error: errCorreio } = await supabase
                .from('correio')
                .insert([{
                    remetente_id,
                    destinatario_id,
                    descricao: descricao || '',
                    cents: qtdCents
                }])
                .select()
                .single();

            if (errCorreio) throw errCorreio;

            // Descontar Cents da mochila do remetente
            if (qtdCents > 0) {
                const { data: itemCents } = await supabase
                    .from('mochila')
                    .select('id, quantidade')
                    .eq('usuario_id', remetente_id)
                    .eq('objeto_id', 2)
                    .single();

                if (itemCents.quantidade === qtdCents) {
                    await supabase.from('mochila').delete().eq('id', itemCents.id);
                } else {
                    await supabase.from('mochila').update({
                        quantidade: itemCents.quantidade - qtdCents
                    }).eq('id', itemCents.id);
                }
            }

            // Processar e remover itens anexados da mochila do remetente
            if (itens && itens.length > 0) {
                for (const item of itens) {
                    await supabase.from('correio_itens').insert([{
                        correio_id: novoCorreio.id,
                        objeto_id: item.objeto_id,
                        quantidade: item.quantidade
                    }]);

                    const { data: slotMochila } = await supabase
                        .from('mochila')
                        .select('id, quantidade')
                        .eq('usuario_id', remetente_id)
                        .eq('objeto_id', item.objeto_id)
                        .single();

                    if (slotMochila.quantidade === item.quantidade) {
                        await supabase.from('mochila').delete().eq('id', slotMochila.id);
                    } else {
                        await supabase.from('mochila').update({
                            quantidade: slotMochila.quantidade - item.quantidade
                        }).eq('id', slotMochila.id);
                    }
                }
            }

            res.json({ message: 'Correio enviado com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao processar envio do correio.' });
        }
    });

    // 3. Listar correios recebidos pelo jogador
    router.get('/recebidos/:usuario_id', async (req, res) => {
        const { usuario_id } = req.params;
        try {
            const { data, error } = await supabase
                .from('correio')
                .select(`
                    id,
                    descricao,
                    cents,
                    lido,
                    criado_em,
                    remetente:usuarios!remetente_id (nome_heroi, nivel),
                    correio_itens (
                        id,
                        quantidade,
                        objetos (*)
                    )
                `)
                .eq('destinatario_id', usuario_id)
                .order('criado_em', { ascending: false });

            if (error) return res.status(500).json({ error: error.message });
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao carregar mensagens do correio.' });
        }
    });

    // 4. Resgatar itens/cents do correio para a mochila
    router.post('/resgatar', async (req, res) => {
        const { usuario_id, correio_id } = req.body;

        try {
            const { data: mail, error } = await supabase
                .from('correio')
                .select(`
                    *,
                    correio_itens (
                        id,
                        objeto_id,
                        quantidade
                    )
                `)
                .eq('id', correio_id)
                .eq('destinatario_id', usuario_id)
                .single();

            if (error || !mail) return res.status(404).json({ error: 'Mensagem não encontrada.' });

            // Creditar Cents na mochila do recebedor
            if (mail.cents > 0) {
                const { data: slotCents } = await supabase
                    .from('mochila')
                    .select('*')
                    .eq('usuario_id', usuario_id)
                    .eq('objeto_id', 2)
                    .maybeSingle();

                if (slotCents) {
                    await supabase.from('mochila').update({
                        quantidade: slotCents.quantidade + mail.cents
                    }).eq('id', slotCents.id);
                } else {
                    await supabase.from('mochila').insert([{
                        usuario_id,
                        objeto_id: 2,
                        quantidade: mail.cents,
                        slot_index: 0
                    }]);
                }
            }

            // Creditar itens na mochila
            if (mail.correio_itens && mail.correio_itens.length > 0) {
                for (const item of mail.correio_itens) {
                    const { data: slotItem } = await supabase
                        .from('mochila')
                        .select('*')
                        .eq('usuario_id', usuario_id)
                        .eq('objeto_id', item.objeto_id)
                        .maybeSingle();

                    if (slotItem) {
                        await supabase.from('mochila').update({
                            quantidade: slotItem.quantidade + item.quantidade
                        }).eq('id', slotItem.id);
                    } else {
                        await supabase.from('mochila').insert([{
                            usuario_id,
                            objeto_id: item.objeto_id,
                            quantidade: item.quantidade,
                            slot_index: 0
                        }]);
                    }
                }
            }

            // Exclui o e-mail resgatado
            await supabase.from('correio').delete().eq('id', correio_id);

            res.json({ message: 'Recompensas resgatadas com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao resgatar correio.' });
        }
    });

    // 5. Verificar se existem e-mails pendentes (para a bolinha de notificação)
    router.get('/pendentes/:usuario_id', async (req, res) => {
        const { usuario_id } = req.params;
        try {
            const { count, error } = await supabase
                .from('correio')
                .select('id', { count: 'exact', head: true })
                .eq('destinatario_id', usuario_id);

            if (error) return res.status(500).json({ error: error.message });

            res.json({ temPendentes: (count || 0) > 0, total: count || 0 });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao verificar mensagens pendentes.' });
        }
    });

    return router;
};