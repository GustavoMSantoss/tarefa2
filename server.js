const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.static(path.join(__dirname, 'public')));

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
            WHEN NOT MATCHED
