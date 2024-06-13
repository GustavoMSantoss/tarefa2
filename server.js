const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
    user: 'morerao',
    password: 'Gustavo1210',
    server: 'morerao-server.database.windows.net',
    database: 'heroivilao',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'front-game')));

app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Atualizar vida do herói
        await request.query(`
            MERGE INTO personagem AS target
            USING (VALUES ('heroi', @vidaHeroi)) AS source (nome, vida)
            ON target.nome = source.nome
            WHEN MATCHED THEN
                UPDATE SET vida = source.vida
            WHEN NOT MATCHED THEN
                INSERT (nome, vida) VALUES (source.nome, source.vida);
        `, {
            vidaHeroi
        });

        // Atualizar vida do vilão
        await request.query(`
            MERGE INTO personagem AS target
            USING (VALUES ('vilao', @vidaVilao)) AS source (nome, vida)
            ON target.nome = source.nome
            WHEN MATCHED THEN
                UPDATE SET vida = source.vida
            WHEN NOT MATCHED THEN
                INSERT (nome, vida) VALUES (source.nome, source.vida);
        `, {
            vidaVilao
        });

        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error('Erro ao atualizar a vida do herói e do vilão:', err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Buscar dados do herói
        const heroResult = await request.query("SELECT * FROM personagem WHERE nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        // Buscar dados do vilão
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
            USING (VALUES (@usuario, @senha)) AS source (usuario, senha)
            ON target.usuario = source.usuario
            WHEN MATCHED THEN
                UPDATE SET senha = source.senha
            WHEN NOT MATCHED THEN
                INSERT (usuario, senha) VALUES (source.usuario, source.senha);
        `, {
            usuario,
            senha
        });

        res.status(200).send('Usuário cadastrado com sucesso.');
    } catch (err) {
        console.error('Erro ao inserir usuário:', err);
        res.status(500).send('Erro ao inserir usuário.');
    }
});

app.post('/validarUsuario', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        const result = await request.query(`
            SELECT * FROM usuario WHERE usuario = @usuario AND senha = @senha
        `, {
            usuario,
            senha
        });

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ error: 'Usuário não cadastrado' });
        }

        res.status(200).json({ message: 'Login bem sucedido.' });
    } catch (err) {
        console.error('Erro ao validar usuário:', err);
        res.status(500).json({ error: 'Erro ao validar usuário.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/dashboard.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/game.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
