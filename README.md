# PushBack 🛡️

**AI-powered contract analysis and negotiation coaching for workers who've never been taught to push back.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Pro-orange?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 The Problem

Every year, millions of workers, immigrants, gig workers, freelancers, first-time employees, sign contracts they don't fully understand. They don't know what's normal, what's exploitative, or that they even *can* negotiate. Legal consultations cost $200-500/hour, putting real contract review out of reach.

**PushBack changes that.**

## 💡 What It Does

PushBack is a 3-step AI-powered tool that turns any contract into actionable negotiation intelligence:

### 1. 📄 Upload Your Contract
Drop a PDF or paste contract text. PushBack extracts and processes every clause.

### 2. 🔍 AI-Powered Analysis
In under 30 seconds, get:
- **Severity-coded clauses**: each clause rated as 🔴 Dangerous, 🟡 Concerning, or 🟢 Fair
- **Plain-language explanations**: no legal jargon, just what it actually means for you
- **Your leverage points**: specific angles you can use to negotiate each clause
- **Top 3 to Fight**: the three most important clauses to push back on
- **Real Cost to You**: estimated financial impact of problematic clauses
- **Visual analytics**: donut charts showing severity distribution, risk gauges, animated stats

### 3. 🤺 Practice Pushing Back
Select any risky clause and enter a **negotiation sparring session**:
- AI plays the role of your counterparty (HR manager, landlord, client, etc.)
- Real-time **coaching notes** after each exchange evaluate your approach
- After 5+ exchanges, get a **personalized negotiation script**: exact phrases to say, ask, and insist on

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js 16 · React 19 · Tailwind v4 · Motion  │
│  Glass-card design system · Dark theme           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│               API Routes (Edge)                  │
│                                                  │
│  POST /api/analyze  → generateObject (structured)│
│  POST /api/spar     → streamText (streaming chat)│
│  POST /api/script   → generateObject (structured)│
│                                                  │
│  All routes use Zod schema validation            │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              AI Layer                            │
│  Google Gemini 2.5 Pro via Vercel AI SDK         │
│  Structured output (generateObject) + streaming  │
│  Type-safe schemas with Zod                      │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│            Authentication                        │
│  Supabase Auth · Google OAuth                    │
│  SSR cookie-based sessions                       │
│  Middleware route protection                     │
└─────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 16 (App Router) | Server components, API routes, edge runtime |
| **Language** | TypeScript 5 | Type safety across the entire stack |
| **AI** | Google Gemini 2.5 Pro | Fast structured output, streaming support |
| **AI SDK** | Vercel AI SDK v6 | `generateObject()` for typed responses, `streamText()` for chat |
| **Validation** | Zod v4 | Runtime schema validation for AI outputs and API inputs |
| **Auth** | Supabase SSR + Google OAuth | Secure cookie-based auth with social login |
| **Styling** | Tailwind CSS v4 | Utility-first with `@theme` CSS tokens |
| **Animations** | Motion (Framer Motion v12) | Declarative React animations, layout transitions |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |
| **PDF Parsing** | pdf-parse | Client-side PDF text extraction |

## ✨ Key Features

- **🔒 Zero data storage**: Contracts are processed in memory and never saved
- **🎯 Severity-coded analysis**: Visual red/amber/green system for instant risk assessment
- **📊 Interactive analytics**: Animated donut charts, risk gauges, and stat counters
- **🤺 AI sparring**: Practice negotiation against a realistic AI counterparty
- **📝 Negotiation scripts**: Ready-to-use talking points generated from your sparring session
- **💰 Financial impact**: Estimated real cost of problematic clauses
- **📱 Mobile responsive**: Full experience on any device
- **♿ Accessible**: Reduced motion support, semantic HTML, keyboard navigation
- **⚡ Fast**: Analysis completes in 15-30 seconds with visual progress tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with Google OAuth configured
- A Google AI API key (for Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/ibrahimmahafza/PushBack.git
cd PushBack

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # Contract analysis endpoint
│   │   ├── spar/route.ts       # Sparring chat endpoint (streaming)
│   │   ├── script/route.ts     # Negotiation script generation
│   │   └── upload/route.ts     # PDF upload handler
│   ├── auth/callback/route.ts  # OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx            # Main dashboard (server component)
│   │   ├── contract-section.tsx # State machine orchestrator
│   │   ├── layout.tsx          # Dashboard shell
│   │   └── settings/           # User settings
│   ├── login/page.tsx          # Google OAuth login
│   ├── pricing/page.tsx        # Pricing plans
│   └── page.tsx                # Landing page
├── components/
│   ├── AnalysisDashboard.tsx   # Analysis results with charts
│   ├── AnalysisLoading.tsx     # Animated loading experience
│   ├── ClauseCard.tsx          # Individual clause display
│   ├── ContractUpload.tsx      # PDF upload + paste interface
│   ├── SparringSession.tsx     # Negotiation practice chat
│   ├── ScriptCard.tsx          # Generated negotiation script
│   ├── TopThreeFight.tsx       # Priority clauses to negotiate
│   └── RealCostPanel.tsx       # Financial impact display
├── lib/
│   ├── types.ts                # Zod schemas + TypeScript types
│   ├── prompts/                # AI prompt templates
│   └── supabase/               # Supabase client helpers
└── middleware.ts               # Auth route protection
```

## 🔄 User Flow

```
Landing Page → Sign In (Google OAuth) → Dashboard
                                           │
                                    Upload Contract
                                           │
                                    Preview & Confirm
                                           │
                                   AI Analysis (15-30s)
                                           │
                                ┌──────────┴──────────┐
                                │                     │
                          View Results          Select Clause
                          (Charts, Stats,            │
                           Severity Cards)    Sparring Session
                                                     │
                                              Coaching Notes
                                                     │
                                             Get Script Card
                                                     │
                                              Ready to Negotiate! 🎉
```

## 🎨 Design System

PushBack uses a custom dark-mode design system built on Tailwind v4:

- **Glass-card morphism**: Semi-transparent cards with backdrop blur
- **Severity color system**: Red (dangerous), Amber (concerning), Green (fair)
- **Gradient borders**: CSS mask-based 1px gradient borders
- **Glow effects**: Color-coded box-shadow glows for emphasis
- **Motion animations**: Staggered entrance, spring physics, layout transitions
- **Responsive**: Mobile-first with `sm:` breakpoint adaptations

## 🤝 Contributing

This is a hackathon project. Feel free to fork and build on it!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT License: see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

PushBack is **not a substitute for legal advice**. It provides AI-generated analysis to help you understand your contract and prepare for negotiation. Always consult a qualified attorney for legal decisions.

---

<p align="center">
  <strong>Built for the people who need it most.</strong><br/>
  <em>Immigrants, gig workers, renters: anyone who's never been taught to push back.</em>
</p>
