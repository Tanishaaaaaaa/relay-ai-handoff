# RELAY — Personal Knowledge Handoff AI

RELAY turns messy personal knowledge (messages, notes, receipts, images and voice notes) into a temporary, evidence-backed handoff.

## Why

A lot of important operational knowledge lives in one person's head or in scattered conversations. RELAY reconstructs that context and makes it easier to hand over without pretending uncertain information is true.

## Core ideas

- Evidence-backed answers
- Temporal conflict detection
- Explicit uncertainty
- Source provenance
- Temporary handoff mindset
- Open-weight / local-first AI architecture

## Run locally

Requirements:

- Node.js 20+
- npm 10+

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually:

```text
http://localhost:5173
```

## Screenshot demo

The app ships with realistic demo data so you can immediately capture screenshots of:

- Overview / Handoff Dashboard
- Evidence trace modal
- Ask RELAY
- Source inspector
- Conflict resolution
- Privacy / local-first design

Click **Build handoff** on the Overview screen to show the reconstruction flow.

## Optional: local Gemma / Ollama

The UI is intentionally runnable without a model so the demo never blocks on inference. The next integration step is to route the extraction/QA functions through a local Ollama endpoint serving an open-weight Gemma model.

Recommended local contract:

```text
POST http://localhost:11434/api/chat
```

Keep model access behind a small adapter so the UI remains model-agnostic.

## Repository structure

```text
relay/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.jsx
    └── styles.css
```

## Important

The demo data is synthetic. Replace it with data from your actual friend/use case before publishing the project or writing a submission claiming real-world use.
