# 🎣 PhishCheck

Paste a suspicious email and get an instant, evidence-based breakdown of exactly what makes it phishing — quoted red flags, a risk score, and what to do next. Or, if it's safe, PhishCheck says so plainly instead of manufacturing flags to look thorough.

Built for [HackMatrix](https://events.mlh.com/events/14628-hackmatrix) (MLH, Jaipur).

## Why

Most phishing detectors just say "this is phishing" without explaining why — which doesn't teach anyone to spot the next one. PhishCheck quotes the exact suspicious text for every flag it raises and names the specific technique (domain spoofing, urgency pressure, mismatched sender, suspicious attachments, credential-harvesting links), so the reader actually learns what to look for.

## How it works

1. Paste an email (or click one of the built-in samples: Phishing / Suspicious / Legit)
2. The backend sends it to a local LLM ([Ollama](https://ollama.com), running Llama 3.2) with a phishing-analyst prompt
3. Get back a verdict, a color-coded risk gauge, and a numbered list of quoted red flags with plain-English explanations

Runs entirely locally — no API key, no per-request cost, works offline.

## Tech stack

- **Backend:** Node.js / Express
- **AI:** Ollama running Llama 3.2 (local, free)
- **Frontend:** Plain HTML/CSS/JS, no build step

## Running it locally

### Prerequisites
- Node.js 18+
- [Ollama](https://ollama.com) installed and running (`ollama serve`), with `llama3.2` pulled (`ollama pull llama3.2`)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npx serve -l 8080
```
Open http://localhost:8080.

## Project structure

```
phishcheck/
├── backend/
│   ├── server.js
│   ├── routes/analyze.js
│   ├── services/ollama.js
│   └── prompts/phishing.js
└── frontend/
    ├── index.html
    ├── app.js
    └── style.css
```

See [CLAUDE.md](CLAUDE.md) for full architecture and API docs.

## What's next

- A deterministic typosquat/domain-similarity check running alongside the LLM
- Drag-and-drop `.eml` file upload
- Optional swap to a larger hosted model for higher-stakes use cases
