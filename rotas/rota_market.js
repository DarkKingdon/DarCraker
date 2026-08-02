const express = require('express');

module.exports = (supabase) => {
    const router = express.Router();

    // 1. BUSCAR OFERTAS DO MERCADO (Aba 1 - Comprar)
router.get('/ofertas', async (req, res) => {
    try {
        const { tipo, objeto_id } = req.query;

        const { data, error } = await supabase
            .from('market')
            .select(`
                id,
                vendedor_id,
                objeto_id,
                quantidade,
                preco_unitario,
                criado_em,
                vendedor:usuarios!vendedor_id (id, nome_heroi),
                objeto:objetos!objeto_id (id, nome, imagem_url, tipo)
            `)
            .order('criado_em', { ascending: false });

        if (error) throw error;

        let resultados = data || [];

        // Filtro por tipo
        if (tipo && tipo !== 'todos') {
            resultados = resultados.filter(item => item.objeto && item.objeto.tipo === tipo);
        }

        // Filtro por item específico (objeto_id)
        if (objeto_id && objeto_id !== 'todos') {
            resultados = resultados.filter(item => item.objeto && item.objeto.id === parseInt(objeto_id));
        }

        res.json(resultados);
    } catch (err) {
        console.error('Erro ao buscar ofertas:', err);
        res.status(500).json({ error: 'Erro ao carregar mercado.' });
    }
});

    // 2. BUSCAR APENAS AS MINHAS OFERTAS (Aba 2 - Minhas Ofertas)
    router.get('/minhas-ofertas/:usuario_id', async (req, res) => {
        const { usuario_id } = req.params;

        try {
            const { data, error } = await supabase
                .from('market')
                .select(`
                    id,
                    vendedor_id,
                    objeto_id,
                    quantidade,
                    preco_unitario,
                    criado_em,
                    objeto:objetos!objeto_id (id, nome, imagem_url, tipo)
                `)
                .eq('vendedor_id', usuario_id)
                .order('criado_em', { ascending: false });

            if (error) throw error;
            res.json(data || []);
        } catch (err) {
            console.error('Erro ao buscar minhas ofertas:', err);
            res.status(500).json({ error: 'Erro ao carregar suas ofertas.' });
        }
    });

    // 3. ANUNCIAR ITEM (Aba 3 - Vender)
    router.post('/vender', async (req, res) => {
        const { vendedor_id, mochila_id, objeto_id, quantidade, preco_unitario } = req.body;

        if (!vendedor_id || !mochila_id || !objeto_id || !quantidade || !preco_unitario) {
            return res.status(400).json({ error: 'Preencha todos os campos!' });
        }

        if (quantidade <= 0 || preco_unitario <= 0) {
            return res.status(400).json({ error: 'Quantidade e preço devem ser maiores que zero!' });
        }

        try {
            // Verifica se o item existe na mochila
            const { data: itemMochila, error: errMochila } = await supabase
                .from('mochila')
                .select('*')
                .eq('id', mochila_id)
                .eq('usuario_id', vendedor_id)
                .single();

            if (errMochila || !itemMochila || itemMochila.quantidade < quantidade) {
                return res.status(400).json({ error: 'Quantidade insuficiente na mochila!' });
            }

            // Remove ou diminui a quantidade na mochila
            if (itemMochila.quantidade === quantidade) {
                await supabase.from('mochila').delete().eq('id', mochila_id);
            } else {
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemMochila.quantidade - quantidade })
                    .eq('id', mochila_id);
            }

            // Insere a oferta na tabela market
            const { error: errMarket } = await supabase
                .from('market')
                .insert([{ vendedor_id, objeto_id, quantidade, preco_unitario }]);

            if (errMarket) throw errMarket;

            res.json({ message: 'Item anunciado no mercado com sucesso!' });
        } catch (err) {
            console.error('Erro ao anunciar item:', err);
            res.status(500).json({ error: 'Erro ao cadastrar oferta.' });
        }
    });

    // 4. COMPRAR ITEM (Com suporte a quantidade parcial)
    router.post('/comprar', async (req, res) => {
        const { comprador_id, oferta_id, quantidade } = req.body;

        const qtdDesejada = parseInt(quantidade);

        if (!comprador_id || !oferta_id || !qtdDesejada || qtdDesejada <= 0) {
            return res.status(400).json({ error: 'Dados ou quantidade inválidos!' });
        }

        try {
            // 1. Busca a oferta
            const { data: oferta, error: errOferta } = await supabase
                .from('market')
                .select('*')
                .eq('id', oferta_id)
                .single();

            if (errOferta || !oferta) {
                return res.status(404).json({ error: 'Oferta não encontrada ou já vendida.' });
            }

            if (oferta.vendedor_id === comprador_id) {
                return res.status(400).json({ error: 'Você não pode comprar seu próprio item!' });
            }

            if (qtdDesejada > oferta.quantidade) {
                return res.status(400).json({ error: `Apenas ${oferta.quantidade} unidade(s) disponível(is) no anúncio.` });
            }

            const valorTotal = qtdDesejada * oferta.preco_unitario;

            // 2. Busca Cents (objeto_id = 2) na mochila do comprador[cite: 3]
            const { data: itemCentsComprador, error: errCentsComprador } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', comprador_id)
                .eq('objeto_id', 2)
                .single();

            if (errCentsComprador || !itemCentsComprador || itemCentsComprador.quantidade < valorTotal) {
                return res.status(400).json({ error: `Você não tem Cents suficientes! Necessário: ${valorTotal} Cents.` });
            }

            // 3. Desconta Cents do comprador[cite: 3]
            if (itemCentsComprador.quantidade === valorTotal) {
                await supabase.from('mochila').delete().eq('id', itemCentsComprador.id);
            } else {
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemCentsComprador.quantidade - valorTotal })
                    .eq('id', itemCentsComprador.id);
            }

            // 4. Paga Cents ao vendedor[cite: 3]
            const { data: itemCentsVendedor } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', oferta.vendedor_id)
                .eq('objeto_id', 2)
                .single();

            if (itemCentsVendedor) {
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemCentsVendedor.quantidade + valorTotal })
                    .eq('id', itemCentsVendedor.id);
            } else {
                await supabase
                    .from('mochila')
                    .insert([{ usuario_id: oferta.vendedor_id, objeto_id: 2, quantidade: valorTotal, slot_index: 0 }]);
            }

            // 5. Adiciona o item comprado na mochila do comprador[cite: 3]
            const { data: itemCompradoExistente } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', comprador_id)
                .eq('objeto_id', oferta.objeto_id)
                .single();

            if (itemCompradoExistente) {
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemCompradoExistente.quantidade + qtdDesejada })
                    .eq('id', itemCompradoExistente.id);
            } else {
                await supabase
                    .from('mochila')
                    .insert([{ usuario_id: comprador_id, objeto_id: oferta.objeto_id, quantidade: qtdDesejada, slot_index: 0 }]);
            }

            // 6. Atualiza ou Deleta a oferta do Market[cite: 3]
            if (oferta.quantidade === qtdDesejada) {
                await supabase.from('market').delete().eq('id', oferta_id);
            } else {
                await supabase
                    .from('market')
                    .update({ quantidade: oferta.quantidade - qtdDesejada })
                    .eq('id', oferta_id);
            }

            res.json({ message: `Compra de ${qtdDesejada} unidade(s) realizada com sucesso!` });
        } catch (err) {
            console.error('Erro ao comprar item:', err);
            res.status(500).json({ error: 'Erro ao processar compra.' });
        }
    });

    // 5. CANCELAR OFERTA
    router.post('/cancelar', async (req, res) => {
        const { vendedor_id, oferta_id } = req.body;

        if (!vendedor_id || !oferta_id) {
            return res.status(400).json({ error: 'Dados incompletos!' });
        }

        try {
            // Busca a oferta
            const { data: oferta, error: errOferta } = await supabase
                .from('market')
                .select('*')
                .eq('id', oferta_id)
                .eq('vendedor_id', vendedor_id)
                .single();

            if (errOferta || !oferta) {
                return res.status(404).json({ error: 'Oferta não encontrada.' });
            }

            // Devolve o item para a mochila do vendedor[cite: 3]
            const { data: itemMochila } = await supabase
                .from('mochila')
                .select('*')
                .eq('usuario_id', vendedor_id)
                .eq('objeto_id', oferta.objeto_id)
                .single();

            if (itemMochila) {
                await supabase
                    .from('mochila')
                    .update({ quantidade: itemMochila.quantidade + oferta.quantidade })
                    .eq('id', itemMochila.id);
            } else {
                await supabase
                    .from('mochila')
                    .insert([{ usuario_id: vendedor_id, objeto_id: oferta.objeto_id, quantidade: oferta.quantidade, slot_index: 0 }]);
            }

            // Remove a oferta do Market
            await supabase.from('market').delete().eq('id', oferta_id);

            res.json({ message: 'Oferta cancelada e item devolvido para a mochila!' });
        } catch (err) {
            console.error('Erro ao cancelar oferta:', err);
            res.status(500).json({ error: 'Erro ao cancelar oferta.' });
        }
    });

    return router;
};