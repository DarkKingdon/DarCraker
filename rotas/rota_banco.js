const express = require('express');

module.exports = (supabase) => {
    const router = express.Router();

    // 1. Buscar status do investimento do usuário
    router.get('/status/:usuario_id', async (req, res) => {
        const { usuario_id } = req.params;

        try {
            const { data, error } = await supabase
                .from('investimentos')
                .select('*')
                .eq('usuario_id', usuario_id)
                .eq('coletado', false)
                .maybeSingle();

            if (error) throw error;

            res.json({ investimento: data });
        } catch (err) {
            console.error('Erro ao buscar investimento:', err.message);
            res.status(500).json({ error: 'Erro ao buscar investimento.' });
        }
    });

    // 2. Realizar investimento
    router.post('/investir', async (req, res) => {
        const { usuario_id, quantidade } = req.body;

        const valor = parseInt(quantidade, 10);
        if (!valor || valor <= 0) {
            return res.status(400).json({ error: 'Quantidade inválida para investimento.' });
        }

        try {
            // Verificar se o usuário já tem um investimento ativo
            const { data: existente } = await supabase
                .from('investimentos')
                .select('id')
                .eq('usuario_id', usuario_id)
                .eq('coletado', false)
                .maybeSingle();

            if (existente) {
                return res.status(400).json({ error: 'Você já possui um investimento em andamento.' });
            }

            // Buscar Cents do usuário na mochila (objeto_id = 2 é 'Cents')
            const { data: mochilaItem, error: errMochila } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', usuario_id)
                .eq('objeto_id', 2)
                .maybeSingle();

            if (errMochila || !mochilaItem || mochilaItem.quantidade < valor) {
                return res.status(400).json({ error: 'Você não possui Cents suficientes na mochila!' });
            }

            // Subtrai os Cents da mochila
            const novaQtd = mochilaItem.quantidade - valor;
            if (novaQtd > 0) {
                await supabase.from('mochila').update({ quantidade: novaQtd }).eq('id', mochilaItem.id);
            } else {
                await supabase.from('mochila').delete().eq('id', mochilaItem.id);
            }

            // Registra o investimento no banco
            const { data: novoInvestimento, error: errInv } = await supabase
                .from('investimentos')
                .insert([
                    {
                        usuario_id,
                        tipo: 'lucro_certo',
                        valor_investido: valor,
                        tempo_segundos: 86400, // 👈 Mude de 60 para 86400 (24 Horas)
                        taxa_rendimento: 0.005,
                        data_inicio: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (errInv) throw errInv;

            res.json({ message: 'Investimento realizado com sucesso!', investimento: novoInvestimento });
        } catch (err) {
            console.error('Erro ao investir:', err.message);
            res.status(500).json({ error: 'Erro interno ao processar investimento.' });
        }
    });

    // 3. Resgatar/Coletar investimento + lucros
    router.post('/coletar', async (req, res) => {
        const { usuario_id } = req.body;

        try {
            const { data: inv, error: errInv } = await supabase
                .from('investimentos')
                .select('*')
                .eq('usuario_id', usuario_id)
                .eq('coletado', false)
                .maybeSingle();

            if (errInv || !inv) {
                return res.status(400).json({ error: 'Nenhum investimento ativo para coletar.' });
            }

            // Verificar se já se passaram 60 segundos
            const inicio = new Date(inv.data_inicio).getTime();
            const agora = Date.now();
            const decorridoSeg = Math.floor((agora - inicio) / 1000);

            if (decorridoSeg < inv.tempo_segundos) {
                return res.status(400).json({ error: 'O tempo de investimento ainda não foi concluído.' });
            }

            // Cálculo do Lucro (0.5% arredondado para cima/baixo para ter valor inteiro)
            const lucro = Math.round(inv.valor_investido * inv.taxa_rendimento);
            const totalRetorno = inv.valor_investido + lucro;

            // FAÇA ISSO (Apaga o registro assim que o resgate é feito):
            await supabase.from('investimentos').delete().eq('id', inv.id);

            // Adicionar Cents de volta na mochila
            const { data: mochilaItem } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', usuario_id)
                .eq('objeto_id', 2)
                .maybeSingle();

            if (mochilaItem) {
                await supabase
                    .from('mochila')
                    .update({ quantidade: mochilaItem.quantidade + totalRetorno })
                    .eq('id', mochilaItem.id);
            } else {
                await supabase
                    .from('mochila')
                    .insert([{ usuario_id, objeto_id: 2, quantidade: totalRetorno }]);
            }

            res.json({
                message: 'Investimento resgatado com sucesso!',
                investido: inv.valor_investido,
                lucro: lucro,
                total: totalRetorno
            });
        } catch (err) {
            console.error('Erro ao coletar investimento:', err.message);
            res.status(500).json({ error: 'Erro ao resgatar o investimento.' });
        }
    });

    return router;
};