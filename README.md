# PushBack 🛡️

**AI-powered contract analysis and negotiation coaching for workers who've never been taught to push back.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![AI](https://img.shields.io/badge/AI-Claude%20Sonnet%204.5-blueviolet?logo=anthropic)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)



---

## 🎯 The Problem

Every year, millions of people sign contracts they don't understand. In Quebec, 80% of people don't fully read their insurance contracts, and 50% don't understand the exclusions. Immigrants, gig workers, freelancers, first-time employees, and renters are especially vulnerable — they don't know what's normal, what's exploitative, or that they *can* negotiate. Legal consultations cost $300+/hour.

**The problem isn't that people don't care — it's that they don't have the tools.**

## 💡 What It Does

PushBack is a 3-step AI-powered contract coach:

### 1. 📄 Upload
Drop a PDF or paste contract text.

### 2. 🔍 Analyze
In under 30 seconds, get:
- **Severity-coded clauses** — every clause rated 🔴 Dangerous, 🟡 Concerning, or 🟢 Fair
- **Plain-language explanations** in bullet-point format — no legal jargon
- **Leverage points** — specific things you can say or do to push back
- **Top 3 to Fight** — the three most important clauses to negotiate
- **Real Cost to You** — estimated financial impact of problematic clauses
- **Visual analytics** — donut charts, risk gauges, animated stat counters

### 3. 🤺 Practice Pushing Back
Select any risky clause and enter a **negotiation sparring session**:
- AI plays your counterparty (HR manager, landlord, client)
- **Real-time coaching** after each exchange
- Generates a **personalized negotiation script** — exact phrases to say
- **Voice sparring** via ElevenLabs TTS for realistic practice

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                   Frontend                        │
│  Next.js 16 · React 19 · Tailwind v4 · Motion   │
│  Warm light theme · Animated gradient background  │
└──────────────┬───────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────┐
│              API Routes (Node.js)                 │
│                                                   │
│  POST /api/analyze  → generateObject (structured) │
│  POST /api/spar     → streamText (streaming chat) │
│  POST /api/script   → generateObject (structured) │
│  POST /api/tts      → ElevenLabs voice synthesis  │
│  POST /api/upload   → PDF text extraction         │
│                                                   │
│  Zod validation on every route                    │
└──────────────┬───────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────┐
│              AI Layer                             │
│  AI model via Vercel AI SDK v6                    │
│  generateObject() → typed structured output       │
│  streamText() → real-time streaming chat          │
│  convertToModelMessages() → UIMessage conversion  │
└──────────────┬───────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────┐
│            Auth & Infrastructure                  │
│  Supabase Auth · Google OAuth                     │
│  SSR cookie-based sessions (no client tokens)     │
│  Middleware route protection                      │
│  Zero data storage — contracts never saved        │
└──────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server components, API routes, SSR |
| **Language** | TypeScript 5 | Full-stack type safety |
| **AI Model** | Anthropic Claude | Contract analysis, sparring, script generation |
| **AI SDK** | Vercel AI SDK v6 | `generateObject()` for typed responses, `streamText()` for chat, `DefaultChatTransport` for streaming UI |
| **Validation** | Zod v4 | Runtime schema validation for all AI outputs and API inputs |
| **Auth** | Supabase SSR + Google OAuth | Cookie-based auth with `createServerClient` / `createBrowserClient` |
| **Styling** | Tailwind CSS v4 | `@theme` CSS tokens, no `tailwind.config.ts` |
| **Animations** | Motion (Framer Motion v12) | Staggered entrances, spring physics, layout transitions |
| **Voice** | ElevenLabs TTS API | Text-to-speech for voice sparring mode |
| **PDF** | pdf-parse | Server-side PDF text extraction |
| **Icons** | Lucide React | Tree-shakeable icon set |

### Key Technical Patterns

- **Phase-based state machine** — `contract-section.tsx` manages 7 phases (`upload | preview | analyzing | results | sparring | script | voiceSparring`) via a string union type
- **`useChat` + `DefaultChatTransport`** — `DefaultChatTransport` wrapped in `useMemo` for stable identity; extra body data (clause context) passed via transport config
- **`convertToModelMessages()`** — async in AI SDK v6, converts `UIMessage[]` to `ModelMessage[]` server-side
- **Delimiter-based streaming** — `---COACHING---` delimiter separates counterparty dialog from coaching notes in sparring responses
- **Zod `.describe()` on schema fields** — guides Claude's structured output with field-level instructions
- **`maxDuration = 60` + `runtime = 'nodejs'`** — exported from route files for Vercel serverless compatibility

## 🔒 Safety & Security

- **Zero data storage** — contracts processed in memory, never saved to any database
- **Anti-hallucination** — AI forced to quote exact contract text for every clause via Zod schema constraints
- **Input validation** — Zod schemas on every API route; contract text validated (50–100k chars)
- **Prompt injection detection** — all contract uploads scanned before processing
- **Rate limiting** — 10 analyses, 50 sparring messages, 20 scripts per hour
- **Auth-gated** — Google OAuth required, middleware protects all dashboard routes
- **Legal disclaimer** — displayed on every analysis screen; PushBack is a coaching tool, not legal counsel
- **Human handoff** — critical risks surface links to local legal aid resources

## ✨ Features

- **Severity-coded analysis** — visual red/amber/green system
- **Bullet-point formatting** — explanations and leverage broken into scannable points
- **Interactive analytics** — animated donut charts, risk gauges, count-up stat cards
- **Top 3 to Fight** — draggable card stack showing priority clauses
- **Real Cost panel** — estimated financial impact with gradient border
- **AI sparring** — realistic negotiation practice with coaching
- **Voice sparring** — speak and hear responses via ElevenLabs TTS
- **Negotiation scripts** — exact phrases to say, ask, and insist on
- **Animated background** — warm gradient blobs on landing page (21st.dev-inspired)
- **Mobile responsive** — hamburger menu, stacking grids, touch-friendly
- **Reduced motion support** — respects `prefers-reduced-motion`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project with Google OAuth configured
- Anthropic API key (Claude)
- ElevenLabs API key (optional, for voice sparring)

### Installation

```bash
git clone https://github.com/ibrahimmahafza/PushBack.git
cd PushBack
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_key

# ElevenLabs (optional — voice sparring)
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

### Build

```bash
npm run build && npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts     # Contract analysis (generateObject)
│   │   ├── spar/route.ts        # Sparring chat (streamText)
│   │   ├── script/route.ts      # Script generation (generateObject)
│   │   ├── tts/route.ts         # ElevenLabs text-to-speech
│   │   └── upload/route.ts      # PDF text extraction
│   ├── auth/callback/route.ts   # OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx             # Main dashboard (server component)
│   │   ├── contract-section.tsx  # Phase state machine (7 phases)
│   │   ├── layout.tsx           # Dashboard shell + nav
│   │   └── settings/            # User settings
│   ├── login/page.tsx           # Google OAuth login
│   ├── pricing/page.tsx         # Pricing page
│   └── page.tsx                 # Landing page
├── components/
│   ├── AnalysisDashboard.tsx    # Results: charts, stats, clause list
│   ├── AnalysisLoading.tsx      # Animated loading with progress
│   ├── ClauseCard.tsx           # Clause display with severity + leverage
│   ├── ContractUpload.tsx       # PDF upload + paste interface
│   ├── SparringSession.tsx      # Text-based negotiation chat
│   ├── VoiceSparring.tsx        # Voice-based sparring with TTS
│   ├── ScriptCard.tsx           # Generated negotiation script
│   ├── TopThreeFight.tsx        # Draggable priority clause cards
│   ├── RealCostPanel.tsx        # Financial impact display
│   └── ui/
│       ├── BackgroundGradient.tsx  # Animated warm gradient blobs
│       ├── CpuArchitecture.tsx    # SVG chip animation (loading)
│       └── RadialOrbitalTimeline.tsx  # Orbital clause map
├── lib/
│   ├── types.ts                 # Zod schemas + TypeScript types
│   ├── markdown.tsx             # Inline markdown + bullet list renderer
│   ├── prompts/
│   │   ├── analysis.ts          # Contract analysis system prompt
│   │   ├── sparring.ts          # Sparring system prompt
│   │   └── script.ts            # Script generation prompt
│   └── supabase/
│       ├── client.ts            # Browser client (createBrowserClient)
│       ├── server.ts            # Server client (createServerClient + cookies)
│       └── middleware.ts        # Middleware client (request/response cookies)
└── middleware.ts                # Route protection (getUser check)
```

## 🎬 Pitch Deck

A self-contained pitch deck is included at [`presentation.html`](presentation.html). Open in any browser.

- **8 slides** — Hook, Problem, Solution, How It Works, Sparring Demo, Audience, Responsible AI, Closing
- **Arrow keys / swipe** to navigate
- **Animated count-up numbers**, blur-up entrances, warm gradient background
- Light theme matching the app UI
- No dependencies, no internet required

## 👥 Team

- **Ibrahim Mahafza**
- **Levon Gyumishyan**
- **Chloe Lai**

## 📜 License

MIT — see [LICENSE](LICENSE).

## ⚠️ Disclaimer

PushBack is **not a substitute for legal advice**. It's an AI coaching tool that helps you understand your contract and practice negotiating. Always consult a qualified attorney for legal decisions.

---

<p align="center">
  <strong>Understanding what you sign shouldn't be a privilege.</strong><br/>
  <em>This is PushBack.</em>
</p>
