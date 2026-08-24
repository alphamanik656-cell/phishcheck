require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: process.env.OLLAMA_MODEL || 'llama3.2' });
});

app.use('/api', analyzeRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`PhishCheck backend running on http://localhost:${PORT}`);
  console.log(`Using Ollama model: ${process.env.OLLAMA_MODEL || 'llama3.2'}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});
