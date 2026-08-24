# Backend — PhishCheck

Node.js/Express server that bridges the frontend and the local Ollama model.

## Entry Point

`server.js` — starts on port 3002 (configurable via `PORT` in `.env`)

## Key Files

| File | Role |
|------|------|
| `server.js` | Express app setup, CORS, error handler |
| `routes/analyze.js` | `/api/analyze` POST handler |
| `services/ollama.js` | Wraps Ollama's `/api/chat` endpoint |
| `prompts/phishing.js` | System + user prompt for phishing analysis |

## Changing the Prompt

Edit `prompts/phishing.js`. Exports `SYSTEM_PROMPT` (string) and `buildUserPrompt(emailText)` (function).

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3002 | Server listen port |
| `OLLAMA_URL` | http://localhost:11434 | Ollama API base URL |
| `OLLAMA_MODEL` | llama3.2 | Text model name |
| `FRONTEND_URL` | http://localhost:8080 | CORS allowed origin |

## Error Handling

- Ollama unreachable → clear message telling user to run `ollama serve`
- Model not found → message with `ollama pull` command
- Empty/oversized email text → 400 with explanation
- All unhandled errors → caught by Express error middleware in `server.js`

## Development

```bash
npm install
cp .env.example .env
npm run dev   # nodemon watches for changes
```

Test with curl:
```bash
curl -X POST http://localhost:3002/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"emailText": "From: security@paypa1.com\nSubject: Urgent: Verify your account now\n\nDear Customer, your account will be suspended in 24 hours..."}'
```

## Switching to Claude API later

If a paid API key becomes available and higher-quality output is wanted for the demo, add back `services/claude.js` (Claude Opus 5 via `@anthropic-ai/sdk`) and swap the `require` in `routes/analyze.js` — the route logic and `prompts/phishing.js` don't need to change.
