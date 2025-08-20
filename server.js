const express = require('express');
const pool = require('./db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/ranking', async (req, res) => {
  const { nome, pontuacao } = req.body;
  if (!nome || pontuacao === undefined) return res.status(400).json({ error: 'Dados inválidos' });

  try {
    await pool.query('INSERT INTO ranking_geografia (nome, pontuacao) VALUES (?, ?)', [nome, pontuacao]);
    res.json({ message: 'Ranking salvo com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar ranking' });
  }
});

app.get('/ranking', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT nome, pontuacao FROM ranking_geografia ORDER BY pontuacao DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
