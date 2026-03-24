# AskBox Admin — AI-Powered Voice Assistant for Rural India

> **Team Node — Nagmani Jha**
> AI for Social Good — Microsoft Hackathon 2024

AskBox is an AI-powered voice-based educational assistant for rural and underserved communities in India. Students and citizens call a toll-free number, speak in their regional language, and receive curriculum answers and government scheme information — all through natural voice conversation on a basic phone.

---

## 🏗️ AI Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AMD-POWERED BACKEND SERVER                         │
│                                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  Azure    │    │  Azure   │    │   Azure  │    │  Azure   │             │
│  │  Comm.    │───▶│    AI    │───▶│  OpenAI  │───▶│  Neural  │───▶ Caller  │
│  │ Services │    │  Speech  │    │  GPT-4o  │    │   TTS    │    (Phone)  │
│  │ (ACS)    │    │  STT +   │    │ Streaming│    │ Chunked  │             │
│  │ WebSocket│    │ Lang ID  │    │ response │    │  output  │             │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘             │
│        │                              ▲                                    │
│        │              ┌───────────────┘                                    │
│        │              │                                                    │
│  ┌─────▼──────┐  ┌───┴────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Redis    │  │  Azure AI  │  │  Azure   │  │  Azure   │             │
│  │   Cache    │  │   Search   │  │ Cosmos   │  │   Blob   │             │
│  │  Session   │  │    RAG     │  │    DB    │  │ Storage  │             │
│  │  + Cache   │  │ Retrieval  │  │Telemetry │  │   Docs   │             │
│  └────────────┘  └────────────┘  └──────────┘  └──────────┘             │
│                                                                            │
│  Real-time Pipeline: STT → RAG → LLM(stream) → TTS(chunked) → Audio     │
│  Barge-in: AbortController cancels LLM+TTS on user interruption          │
│  Telemetry: Fire-and-forget Cosmos DB writes (never blocks audio)        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD (React / Vite / TailwindCSS)            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Dashboard  │  │  Call Logs │  │ Knowledge  │  │  Analytics │          │
│  │  Live WS   │  │  Cosmos DB │  │  Base Mgmt │  │  Recharts  │          │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Technologies

| Layer | Technology | Why |
|-------|-----------|-----|
| **Compute** | AMD-powered servers | High-throughput audio processing |
| **Voice Gateway** | Azure Communication Services | Toll-free number, WebSocket audio streaming |
| **Speech** | Azure AI Speech (STT + TTS) | 8 Indian language support, Neural voices |
| **Intelligence** | Azure OpenAI GPT-4o (streaming) | Sub-second TTFB with `stream: true` |
| **Knowledge** | Azure AI Search + Redis cache | RAG retrieval with timeout fallback |
| **Telemetry** | Azure Cosmos DB | Non-blocking impact metrics |
| **Frontend** | React 18, Vite 5, TailwindCSS | Admin dashboard with real-time WebSocket |
| **Backend** | Node.js, Express, TypeScript | Production-grade pipeline orchestrator |

### Supported Languages
Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi

---

## 🚀 Quick Start (Judges — Live Demo Setup)

### Prerequisites
- Node.js 18+
- (Optional) PostgreSQL, Redis, Azure credentials

### 1. Install & Configure

```bash
# Backend
cd backend
cp .env.example .env    # Edit with your Azure credentials (or leave blank for mock mode)
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Services

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### 3. Open Dashboard

Visit **http://localhost:5173** and login with:
- **Email**: `admin@askbox.in`
- **Password**: `askbox`

### 4. Test the Voice Pipeline

```bash
# Run the demo script to simulate a 30-second voice call
node test_pipeline.js
```

This sends mock audio to the WebSocket pipeline and displays the full
STT → RAG → LLM → TTS flow in the backend terminal.

---

## 📊 Impact Metrics

Every call automatically logs to Cosmos DB (non-blocking):
- **Call Duration** — time spent per student
- **Language Distribution** — which regions are using AskBox
- **Topic of Inquiry** — curriculum vs government schemes
- **Schemes Accessed** — PMAY, education grants, etc.
- **TTFB Latency** — Time To First Byte for voice response

---

## 📁 Project Structure

```
hackathon-msft/
├── backend/
│   └── src/
│       ├── azure/
│       │   ├── processAudio.ts    # Voice pipeline orchestrator (all 10 checkpoints)
│       │   ├── callSession.ts     # Session lifecycle + barge-in AbortController
│       │   ├── sttService.ts      # Azure Speech STT + Language ID
│       │   ├── ragService.ts      # RAG retrieval + prompt assembly
│       │   ├── llmService.ts      # GPT-4o streaming (AsyncGenerator)
│       │   ├── ttsService.ts      # Neural TTS + semantic chunking
│       │   ├── telemetryService.ts # Non-blocking Cosmos DB logging
│       │   ├── redisClient.ts     # Session state + RAG cache
│       │   ├── cosmosClient.ts    # Cosmos DB client
│       │   ├── searchClient.ts    # Azure AI Search client
│       │   └── storageClient.ts   # Blob Storage client
│       ├── config/                # Environment + logger
│       ├── middleware/            # Auth, error handler
│       ├── modules/
│       │   ├── auth/              # JWT authentication
│       │   ├── calls/             # Call logs (Cosmos DB)
│       │   ├── knowledge/         # Knowledge base management
│       │   ├── analytics/         # Dashboard metrics
│       │   └── settings/          # System configuration
│       ├── database/              # PostgreSQL connection
│       └── app.ts                 # Express + WebSocket server
├── frontend/
│   └── src/
│       ├── components/            # Layout, shared UI
│       ├── pages/                 # Dashboard, Calls, Knowledge, Analytics, Settings
│       ├── services/              # API client with JWT interceptor
│       └── App.tsx                # Router
├── test_pipeline.js               # Demo script for video walkthrough
└── README.md
```

---

## 🔒 Security

- All API keys loaded from environment variables (`.env`)
- JWT authentication with bcrypt password hashing
- Helmet.js security headers
- Rate limiting (100 req/15min per IP)
- CORS restricted to configured origin
- No credentials in source code

---

*Built for Microsoft AI for Social Good Hackathon — Team Node (Nagmani Jha)*
#   a i - u n l o c k e d  
 