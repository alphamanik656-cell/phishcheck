const { askOllama, checkOllamaHealth } = require('./ollama');
const { askGroq, GROQ_MODEL } = require('./groq');

/**
 * Picks the LLM provider: Groq if a key is configured (used in hosted
 * deployments), otherwise local Ollama (used for free local development).
 */
function usingGroq() {
  return Boolean(process.env.GROQ_API_KEY);
}

async function askLLM(systemPrompt, userPrompt) {
  if (usingGroq()) {
    return askGroq(systemPrompt, userPrompt);
  }
  return askOllama(systemPrompt, userPrompt);
}

async function checkLLMHealth() {
  if (usingGroq()) {
    return { ok: true, provider: 'groq', model: GROQ_MODEL };
  }
  const result = await checkOllamaHealth();
  return { ...result, provider: 'ollama' };
}

function currentModelName() {
  if (usingGroq()) return GROQ_MODEL;
  return process.env.OLLAMA_MODEL || 'llama3.2';
}

module.exports = { askLLM, checkLLMHealth, currentModelName };
