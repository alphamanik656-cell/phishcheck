const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * Sends a system + user prompt to the local Ollama model.
 * Returns the model's text response.
 *
 * @param {string} systemPrompt - System instructions for the model
 * @param {string} userPrompt - The user-facing question/task
 * @returns {Promise<string>}
 */
async function askOllama(systemPrompt, userPrompt) {
  const body = {
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: false,
    options: {
      temperature: 0.2,
      top_p: 0.9,
    },
  };

  let response;
  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(
      `Cannot reach Ollama at ${OLLAMA_URL}. Make sure Ollama is running (run "ollama serve" in a terminal). Original error: ${err.message}`
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama returned ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data?.message?.content;
  if (!content) {
    throw new Error('Ollama returned an empty response. Try again.');
  }
  return content;
}

/**
 * Checks whether Ollama is running and the model is available.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
async function checkOllamaHealth() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!res.ok) return { ok: false, reason: 'Ollama responded with an error.' };
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    const hasModel = models.some((name) => name.includes(OLLAMA_MODEL.split(':')[0]));
    if (!hasModel) {
      return {
        ok: false,
        reason: `Model "${OLLAMA_MODEL}" not found. Run: ollama pull ${OLLAMA_MODEL}`,
      };
    }
    return { ok: true, models };
  } catch (err) {
    return { ok: false, reason: `Ollama not reachable: ${err.message}` };
  }
}

module.exports = { askOllama, checkOllamaHealth };
