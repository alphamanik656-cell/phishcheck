# Backend — PhishCheck

Node.js/Express server that serves the frontend as static files and bridges it to an LLM — local Ollama in dev, Groq in hosted deployments.

## Entry Point

`server.js` — starts on port 3002 (configurable via `PORT` in `.env`), also serves `../frontend/` as static files.

## Key Files

| File | Role |
|------|------|
| `server.js` | Express app setup, static frontend serving, CORS, error handler |
| `routes/analyze.js` | `/api/analyze` and `/api/health` handlers |
| `services/llm.js` | Picks Groq (if `GROQ_API_KEY` set) or Ollama otherwise |
| `services/groq.js` | Wraps Groq's OpenAI-compatible `/chat/completions` endpoint |
| `services/ollama.js` | Wraps Ollama's `/api/chat` endpoint |
| `prompts/phishing.js` | System + user prompt for phishing analysis, with few-shot examples |

## Changing the Prompt

Edit `prompts/phishing.js`. Exports `SYSTEM_PROMPT` (string) and `buildUserPrompt(emailText)` (function).

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3002 | Server listen port |
| `OLLAMA_URL` | http://localhost:11434 | Ollama API base URL (local dev) |
| `OLLAMA_MODEL` | llama3.2 | Ollama text model name (local dev) |
| `GROQ_API_KEY` | — | If set, switches the app to Groq (hosted deployments) |
| `GROQ_MODEL` | llama-3.3-70b-versatile | Groq model name |
| `FRONTEND_URL` | http://localhost:8080 | CORS allowed origin (only matters if frontend is served separately) |

## Error Handling

- Ollama unreachable → clear message telling user to run `ollama serve`
- Ollama model not found → message with `ollama pull` command
- Groq key missing/invalid → clear message pointing at `GROQ_API_KEY`
- Groq rate limited → clear retry message
- Empty/oversized email text → 400 with explanation
- All unhandled errors → caught by Express error middleware in `server.js`

## Development

```bash
npm install
cp .env.example .env
npm run dev   # nodemon watches for changes
```
Visit http://localhost:3002 — serves both the UI and the API.

Test with curl:
```bash
curl -X POST http://localhost:3002/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"emailText": "From: security@paypa1.com\nSubject: Urgent: Verify your account now\n\nDear Customer, your account will be suspended in 24 hours..."}'
```

## Switching providers

`services/llm.js` is the single switch point — it uses Groq automatically whenever `GROQ_API_KEY` is set in the environment, and falls back to Ollama otherwise. No other file needs to change to move between local dev and a hosted deployment.
