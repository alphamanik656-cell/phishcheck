# 🎣 PhishCheck

Paste a suspicious email and get an instant, evidence-based breakdown of exactly what makes it phishing — quoted red flags, a risk score, and what to do next. Or, if it's safe, PhishCheck says so plainly instead of manufacturing flags to look thorough.

Built for [HackMatrix](https://events.mlh.com/events/14628-hackmatrix) (MLH, Jaipur).

## Why

Most phishing detectors just say "this is phishing" without explaining why — which doesn't teach anyone to spot the next one. PhishCheck quotes the exact suspicious text for every flag it raises and names the specific technique (domain spoofing, urgency pressure, mismatched sender, suspicious attachments, credential-harvesting links), so the reader actually learns what to look for.

## How it works

1. Paste an email (or click one of the built-in samples: Phishing / Suspicious / Legit)
2. The backend sends it to an LLM with a phishing-analyst prompt — [Ollama](https://ollama.com) (Llama 3.2) locally for free, or [Groq](https://groq.com) in the hosted deployment
3. Get back a verdict, a color-coded risk gauge, and a numbered list of quoted red flags with plain-English explanations

The backend serves the frontend directly, so it's one deployable service, one URL.

## Tech stack

- **Backend:** Node.js / Express (also serves the static frontend)
- **AI:** Ollama + Llama 3.2 locally (free, offline) — Groq (free tier) in the hosted deployment
- **Frontend:** Plain HTML/CSS/JS, no build step

## Running it locally

### Prerequisites
- Node.js 18+
- [Ollama](https://ollama.com) installed and running (`ollama serve`), with `llama3.2` pulled (`ollama pull llama3.2`)

### Run
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:3002 — the backend serves the frontend at the same address.

## Deploying it publicly (free)

The app auto-switches to [Groq](https://groq.com)'s free API when `GROQ_API_KEY` is set, so it can run on a public host without needing your machine (or Ollama) to stay on.

1. Get a free key at [console.groq.com/keys](https://console.groq.com/keys) (no credit card required)
2. On [Render](https://render.com): **New → Blueprint**, connect this repo — it reads [`render.yaml`](render.yaml) and provisions the service automatically
3. When prompted, paste in your `GROQ_API_KEY`
4. Deploy — Render gives you a public URL serving the full app

## Project structure

```
phishcheck/
├── render.yaml
├── backend/
│   ├── server.js          ← also serves frontend/ as static files
│   ├── routes/analyze.js
│   ├── services/
│   │   ├── llm.js         ← picks Groq (if configured) or Ollama
│   │   ├── groq.js
│   │   └── ollama.js
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
