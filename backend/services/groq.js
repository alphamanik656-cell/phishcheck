const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

/**
 * Sends a system + user prompt to Groq's hosted LLM API (OpenAI-compatible).
 * Returns the model's text response.
 *
 * @param {string} systemPrompt - System instructions for the model
 * @param {string} userPrompt - The user-facing question/task
 * @returns {Promise<string>}
 */
async function askGroq(systemPrompt, userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set.');
  }

  let response;
  try {
    response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });
  } catch (err) {
    throw new Error(`Cannot reach Groq API: ${err.message}`);
  }

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error('Groq rejected the API key. Check GROQ_API_KEY.');
    }
    if (response.status === 429) {
      throw new Error('Groq rate limit hit — wait a moment and try again.');
    }
    throw new Error(`Groq API returned ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned an empty response. Try again.');
  }
  return content;
}

module.exports = { askGroq, GROQ_MODEL };
