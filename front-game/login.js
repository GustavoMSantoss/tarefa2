const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuração do banco de dados
const config = {
    user: 'morerao',
    password: 'Gustavo1210',
    server: 'morerao-server.database.windows.net',
    database: 'heroivilao',
    options: {
        encrypt: true
    }
};

// Configurar CORS para permitir requisições do domínio fornecido
app.use(cors({
    origin: 'https://tarefa2-gustavomsantoss-projects.vercel.app'
}));

app.use(express.json());

// Servir arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname, 'front-game')));

// Rota para inserir uma nova manutenção
app.post('/inserirManutencao', async (req, res) => {
    const { veiculo, peca, quilometragemAtual, quilometragemTroca } = req.body;
    console.log('Dados recebidos:', veiculo, peca, quilometragemAtual, quilometragemTroca);

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            INSERT INTO personagem (nome, peca, quilometragemAtual, quilometragemTroca)
            VALUES ('${veiculo}', '${peca}', ${quilometragemAtual}, ${quilometragemTroca});
        `);
        res.status(200).send('Informações de manutenção inseridas com sucesso.');
    } catch (err) {
        console.error('Erro ao inserir informações de manutenção:', err);
        res.status(500).send('Erro ao inserir informações de manutenção.');
    }
});

// Rota para fornecer os dados do veículo e da peça
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query("SELECT * FROM personagem");
        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
});

// Rota para inserir um usuário
app.post('/inserirUsuario', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            MERGE INTO usuario AS target
            USING (VALUES ('${usuario}', '${senha}')) AS source (usuario, senha)
            ON target.usuario = source.usuario
            WHEN MATCHED THEN
                UPDATE SET senha = source.senha
            WHEN NOT MATCHED THEN
                INSERT (usuario, senha) VALUES (source.usuario, source.senha);
        `);
        res.status(200).send('Usuario cadastrado com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao inserir usuario.');
    }
});

// Rota para validar um usuário
app.get('/validarUsuario', async (req, res) => {
    const { usuario, senha } = req.query;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query(`
            SELECT * FROM usuario WHERE usuario = '${usuario}' AND senha = '${senha}'
        `);
        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ error: 'Usuario não cadastrado' });
        }
        res.json({ usuario, senha });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dados do usuario.' });
    }
});

// Rotas para servir os arquivos HTML principais
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/dashboard.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/game.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
