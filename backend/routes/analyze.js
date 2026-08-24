const express = require('express');
const { askOllama, checkOllamaHealth } = require('../services/ollama');
const { SYSTEM_PROMPT, buildUserPrompt } = require('../prompts/phishing');

const router = express.Router();

// Health check — lets the frontend verify Ollama is reachable
router.get('/health', async (req, res) => {
  const result = await checkOllamaHealth();
  res.status(result.ok ? 200 : 503).json(result);
});

// POST /api/analyze — full phishing analysis of a submitted email
router.post('/analyze', async (req, res, next) => {
  try {
    const { emailText } = req.body || {};

    if (!emailText || !emailText.trim()) {
      return res.status(400).json({ error: 'No email text provided. Send JSON body { "emailText": "..." }.' });
    }
    if (emailText.length > 20000) {
      return res.status(400).json({ error: 'Email text too long (max 20,000 characters).' });
    }

    console.log(`[analyze] Received email (${emailText.length} chars), sending to Ollama...`);
    const startTime = Date.now();

    const content = await askOllama(SYSTEM_PROMPT, buildUserPrompt(emailText));

    console.log(`[analyze] Response received in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    res.json({
      type: 'analysis',
      content,
      model: process.env.OLLAMA_MODEL || 'llama3.2',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
