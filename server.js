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
    database: 'projeto1',
    options: {
        encrypt: true // Dependendo da configuração do seu servidor SQL Server
    }
};

app.use(cors());

app.use(express.json());

// Servir arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname, 'front-game')));

// Rota para atualizar a vida do herói e do vilão
app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
      MERGE INTO personagem AS target
      USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (nome, vida)
      ON target.nome = source.nome
      WHEN MATCHED THEN
        UPDATE SET vida = source.vida
      WHEN NOT MATCHED THEN
        INSERT (nome, vida) VALUES (source.nome, source.vida);
      `);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

// Rota para fornecer os dados do herói e do vilão
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Consulta para obter os dados do herói
        const heroResult = await request.query("SELECT * FROM personagem WHERE nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        // Consulta para obter os dados do vilão
        const villainResult = await request.query("SELECT * FROM personagem WHERE nome = 'vilao'");
        const vilao = villainResult.recordset[0];

        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

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


app.get('/validarUsuario', async (req, res) => {
    try {
        const { usuario, senha } = req.query;
        await sql.connect(config);
        const request = new sql.Request();

        // Consulta para obter os dados do herói
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

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/login.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/game.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/dashboard.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
