const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Garantir que a URL e a Key venham sem espaços e com valor padrão válido
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://gzrdpytgkcbyfseigqai.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cmRweXRna2NieWZzZWlncWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MDkwMDMsImV4cCI6MjEwMDE4NTAwM30.8KHtRsTb8tBPHcnIZlqZ2vVA93q0MDNeRybIngHiS-I').trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false
    }
});

// ==========================================
// IMPORTANDO E REGISTRANDO AS ROTAS SEPARADAS
// ==========================================
const rotaConsumirMaca = require('./rotas/rota_consumir_maca')(supabase);
app.use('/api/mochila', rotaConsumirMaca); 
// Note que agora a rota POST para '/api/mochila/consumir' fica ativa automaticamente!

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de Cadastro
app.post('/api/cadastro', async (req, res) => {
    const { nome_heroi, email, senha } = req.body;

    if (!nome_heroi || !email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                { 
                    nome_heroi, 
                    email, 
                    senha: senhaHash, 
                    nivel: 1,
                    exp_atual: 0,
                    exp_next_nivel: 10,
                    vida_atual: 10,
                    vida_maxima: 10,
                    mana_atual: 15,
                    mana_maxima: 15,

                    forca: 1,
                    exp_atual_forca: 0,
                    exp_next_nivel_forca: 10,

                    protecao: 1,
                    exp_atual_protecao: 0,
                    exp_next_nivel_protecao: 10,

                    vitalidade: 1,
                    exp_atual_vitalidade: 0,
                    exp_next_nivel_vitalidade: 10,

                    inteligencia: 1,
                    exp_atual_inteligencia: 0,
                    exp_next_nivel_inteligencia: 10,
                    
                    ataque_minimo: 1,
                    ataque_maximo: 2,
                    defesa_minima: 1,
                    defesa_maxima: 2
                }
            ])
            .select();

        if (error) {
            console.error('Erro no Supabase:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Herói cadastrado com sucesso!', usuario: data[0] });
    } catch (err) {
        console.error('Erro interno:', err.message);
        res.status(500).json({ error: 'Erro no servidor ao cadastrar.' });
    }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Preencha e-mail e senha!' });
    }

    try {
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !usuario) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos!' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos!' });
        }

        res.json({
            message: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome_heroi: usuario.nome_heroi,
                nivel: usuario.nivel,
                exp_atual: usuario.exp_atual,
                exp_next_nivel: usuario.exp_next_nivel,
                vida_atual: usuario.vida_atual,
                vida_maxima: usuario.vida_maxima,
                mana_atual: usuario.mana_atual,
                mana_maxima: usuario.mana_maxima,

                forca: usuario.forca ?? 1,
                exp_atual_forca: usuario.exp_atual_forca ?? 0,
                exp_next_nivel_forca: usuario.exp_next_nivel_forca ?? 10,

                protecao: usuario.protecao ?? 1,
                exp_atual_protecao: usuario.exp_atual_protecao ?? 0,
                exp_next_nivel_protecao: usuario.exp_next_nivel_protecao ?? 10,

                vitalidade: usuario.vitalidade ?? 1,
                exp_atual_vitalidade: usuario.exp_atual_vitalidade ?? 0,
                exp_next_nivel_vitalidade: usuario.exp_next_nivel_vitalidade ?? 10,

                inteligencia: usuario.inteligencia ?? 1,
                exp_atual_inteligencia: usuario.exp_atual_inteligencia ?? 0,
                exp_next_nivel_inteligencia: usuario.exp_next_nivel_inteligencia ?? 10,

                ataque_minimo: usuario.ataque_minimo ?? 1,
                ataque_maximo: usuario.ataque_maximo ?? 2,
                defesa_minima: usuario.defesa_minima ?? 1,
                defesa_maxima: usuario.defesa_maxima ?? 2
            }
        });
    } catch (err) {
        console.error('Erro interno:', err.message);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// Rota para buscar a lista de monstros
app.get('/api/monstros', async (req, res) => {
    try {
        const { data, error } = await supabase.from('monstros').select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar monstros.' });
    }
});

// Rota para salvar a atualização de status do herói (XP, Nível, Pontos, etc.)
app.put('/api/heroi/:id', async (req, res) => {
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

// Endpoint para buscar a mochila do usuário
app.get('/api/mochila/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const { data, error } = await supabase
            .from('mochila')
            .select(`
                id,
                quantidade,
                slot_index,
                objetos (*)
            `)
            .eq('usuario_id', usuario_id);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar mochila.' });
    }
});

// Endpoint para processar e conceder TODOS os drops do monstro
app.post('/api/combate/drop', async (req, res) => {
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

// Endpoint para buscar o Top 10 jogadores para o Ranking
app.get('/api/ranking', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('nome_heroi, nivel, exp_atual')
            .order('nivel', { ascending: false }) // Maior nível primeiro
            .order('exp_atual', { ascending: false }) // Desempata pelo XP
            .limit(10); // Apenas os 10 primeiros

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar o ranking.' });
    }
});

// Buscar itens do Baú
app.get('/api/bau/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const { data, error } = await supabase
            .from('bau')
            .select(`
                id,
                quantidade,
                slot_index,
                objetos (*)
            `)
            .eq('usuario_id', usuario_id);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar itens do baú.' });
    }
});

// Guardar item da Mochila no Baú (Com auto-organização/reindexação de slots)
app.post('/api/bau/guardar', async (req, res) => {
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

// Retirar item do Baú para a Mochila (Com auto-organização/reindexação de slots)
app.post('/api/bau/retirar', async (req, res) => {
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



// Porta dinâmica (3000 para local ou a fornecida pelo Render/servidor)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando localmente em http://localhost:${PORT}`);
});