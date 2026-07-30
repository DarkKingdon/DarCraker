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

// Endpoint para processar e conceder o drop ao derrotar o monstro
app.post('/api/combate/drop', async (req, res) => {
    const { usuario_id, monstro_id } = req.body;

    try {
        // 1. Busca os possíveis drops do monstro
        const { data: drops, error } = await supabase
            .from('monstro_drops')
            .select('*, objetos(*)')
            .eq('monstro_id', monstro_id);

        if (error || !drops || drops.length === 0) {
            return res.json({ dropObtido: null });
        }

        let itemGanho = null;
        let quantidadeGanha = 0;

        // 2. Processa a probabilidade de cada item
        for (const drop of drops) {
            const Sorteio = Math.random() * 100; // Sorteia entre 0 e 100
            if (Sorteio <= drop.chance_porcentagem) {
                // Sorteia a quantidade entre mínima e máxima
                quantidadeGanha = Math.floor(Math.random() * (drop.qtd_maxima - drop.qtd_minima + 1)) + drop.qtd_minima;
                itemGanho = drop.objetos;
                break; // Dropou o item
            }
        }

        if (!itemGanho) {
            return res.json({ dropObtido: null });
        }

        // 3. Adiciona o item à mochila do jogador
        const { data: mochilaAtual } = await supabase
            .from('mochila')
            .select('*')
            .eq('usuario_id', usuario_id);

        // Verifica se o item já existe na mochila
        const itemExistente = mochilaAtual.find(m => m.objeto_id === itemGanho.id);

        if (itemExistente) {
            // Se já tem, incrementa a quantidade
            await supabase
                .from('mochila')
                .update({ quantidade: itemExistente.quantidade + quantidadeGanha })
                .eq('id', itemExistente.id);
        } else {
            // Procura o primeiro slot vago (de 0 a 19)
            const slotsOcupados = mochilaAtual.map(m => m.slot_index);
            let slotLivre = -1;
            for (let i = 0; i < 20; i++) {
                if (!slotsOcupados.includes(i)) {
                    slotLivre = i;
                    break;
                }
            }

            if (slotLivre !== -1) {
                await supabase.from('mochila').insert([
                    { usuario_id, objeto_id: itemGanho.id, quantidade: quantidadeGanha, slot_index: slotLivre }
                ]);
            } else {
                return res.json({ dropObtido: null, mensagem: 'Mochila Cheia!' });
            }
        }

        res.json({ dropObtido: itemGanho, quantidade: quantidadeGanha });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao processar drop.' });
    }
});

// Porta dinâmica (3000 para local ou a fornecida pelo Render/servidor)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando localmente em http://localhost:${PORT}`);
});