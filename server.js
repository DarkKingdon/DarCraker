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

const rotaDbBuscarAMochilaDoUsuario = require('./rotas/rota_db_buscar_a_mochila_do_usuario')(supabase);
app.use('/api/mochila', rotaDbBuscarAMochilaDoUsuario);

const rotaRetirarObjetoDoBau = require('./rotas/rota_retirar_objeto_do_bau')(supabase);
app.use('/api/bau', rotaRetirarObjetoDoBau);

const rotaGuardarObjetoNoBau = require('./rotas/rota_guardar_objeto_no_bau')(supabase);
app.use('/api/bau', rotaGuardarObjetoNoBau);

const rotaDbBuscarObjetoDoBau = require('./rotas/rota_db_buscar_objeto_do_bau')(supabase);
app.use('/api/bau', rotaDbBuscarObjetoDoBau);

const rotaDbBuscarTop10Ranking = require('./rotas/rota_db_buscar_top10_ranking')(supabase);
app.use('/api/ranking', rotaDbBuscarTop10Ranking);

const rotaDbBuscarConcederOsDropsDoMonstro = require('./rotas/rota_db_buscar_conceder_os_drops_do_monstro')(supabase);
app.use('/api/combate', rotaDbBuscarConcederOsDropsDoMonstro);

const rotaSalvarEAtualizarStatusDoHeroi = require('./rotas/rota_salvar_e_atualizar_status_do_heroi')(supabase);
app.use('/api/heroi', rotaSalvarEAtualizarStatusDoHeroi);

const rotaDbBuscarListaDeMonstros = require('./rotas/rota_db_buscar_lista_de_monstros')(supabase);
app.use('/api/monstros', rotaDbBuscarListaDeMonstros);

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

// Porta dinâmica (3000 para local ou a fornecida pelo Render/servidor)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando localmente em http://localhost:${PORT}`);
});