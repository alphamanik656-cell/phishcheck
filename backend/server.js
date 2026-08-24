require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');
const { currentModelName } = require('./services/llm');

const app = express();
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '1mb' }));

// Serve the frontend from the same server/origin — one deployable service
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: currentModelName() });
});

app.use('/api', analyzeRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`PhishCheck backend running on http://localhost:${PORT}`);
  console.log(`Using model: ${currentModelName()}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});
