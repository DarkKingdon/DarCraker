const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o Supabase PostgreSQL (SSL é obrigatório)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Rota de Cadastro
app.post('/api/cadastro', async (req, res) => {
    const { nome_heroi, email, senha } = req.body;

    if (!nome_heroi || !email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    try {
        // Criptografa a senha antes de salvar
        const senhaHash = await bcrypt.hash(senha, 10);

        const result = await pool.query(
            `INSERT INTO usuarios (nome_heroi, email, senha, vida_atual, vida_maxima) 
             VALUES ($1, $2, $3, 10, 10) RETURNING id, nome_heroi, email, vida_atual, vida_maxima`,
            [nome_heroi, email, senhaHash]
        );

        res.status(201).json({ message: 'Heroi cadastrado com sucesso!', usuario: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Nome do Herói ou E-mail já cadastrado!' });
        }
        console.error(err);
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
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado!' });
        }

        const usuario = result.rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(400).json({ error: 'Senha incorreta!' });
        }

        // Retorna os dados do herói (sem a senha)
        res.json({
            message: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome_heroi: usuario.nome_heroi,
                email: usuario.email,
                vida_atual: usuario.vida_atual,
                vida_maxima: usuario.vida_maxima
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor ao fazer login.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});