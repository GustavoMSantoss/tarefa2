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
app.use(express.static(path.join(__dirname, 'front-game')));

// Rota para atualizar as informações do veículo e peça
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

// Rota para obter todas as informações da tabela personagem
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        
        // Consulta para obter todos os dados da tabela personagem
        const result = await request.query("SELECT * FROM personagem");
        const personagens = result.recordset;

        res.json(personagens);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Erro ao buscar dados.' });
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
