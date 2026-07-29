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
                { nome_heroi, email, senha: senhaHash, vida_atual: 10, vida_maxima: 10 }
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
                vida_atual: usuario.vida_atual,
                vida_maxima: usuario.vida_maxima
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