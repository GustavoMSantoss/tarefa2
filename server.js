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
        encrypt: true // Dependendo da configuração do seu servidor SQL Server
    }
};

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'front-game')));

// Rota para atualizar informações de veículo e peça
app.post('/atualizarInfo', async (req, res) => {
    const { veiculo, peca, quilometragemAtual, quilometragemTroca } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            MERGE INTO personagem AS target
            USING (VALUES ('${veiculo}', '${peca}', ${quilometragemAtual}, ${quilometragemTroca})) AS source (veiculo, peca, quilometragem_atual, quilometragem_troca)
            ON target.veiculo = source.veiculo AND target.peca = source.peca
            WHEN MATCHED THEN
                UPDATE SET quilometragem_atual = source.quilometragem_atual, quilometragem_troca = source.quilometragem_troca
            WHEN NOT MATCHED THEN
                INSERT (veiculo, peca, quilometragem_atual, quilometragem_troca) VALUES (source.veiculo, source.peca, source.quilometragem_atual, source.quilometragem_troca);
        `);
        res.status(200).send('Informações atualizadas com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar as informações.');
    }
});

// Rota para fornecer os dados do veículo e peça
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const result = await request.query("SELECT * FROM personagem");
        const dados = result.recordset;

        res.json(dados);
    } catch (error) {
        console.error('Erro ao buscar dados do veículo e peça:', error);
        res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
});

// Rota para inserir usuário
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

// Rota para validar usuário
app.get('/validarUsuario', async (req, res) => {
    try {
        const { usuario, senha } = req.query;
        await sql.connect(config);
        const request = new sql.Request();
        const userResult = await request.query(`SELECT * FROM usuario WHERE usuario = '${usuario}' AND senha = '${senha}'`);
        const user = userResult.recordset[0];
        if (user === undefined) {
           return res.status(404).json({ error: 'Usuario não cadastrado' });
        }

        return res.json({ usuario, senha });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do usuario.' });
    }
});

// Rotas para servir os arquivos HTML
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
