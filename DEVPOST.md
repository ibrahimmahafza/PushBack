# DevPost Submission

## Project Name
PushBack

## Elevator Pitch
AI-powered contract analysis and negotiation coaching. Upload any contract, get severity-coded clause breakdown, practice pushing back with a voice-enabled AI counterparty, and leave with a ready-to-use script.

## Built With
next.js, typescript, vercel, tailwind, css, motion, lucide, react, pdf-parse, claude, anthropic, supabase, zod, vercel-ai-sdk, web-speech-api

## Try It Out Links
- GitHub: https://github.com/ibrahimmahafza/PushBack
- Live Demo: (your Vercel URL here)

---

## Project Story

### Inspiration

Every year, millions of workers sign contracts they don't fully understand. Immigrants navigating unfamiliar labor laws. Gig workers accepting take-it-or-leave-it terms. Freelancers facing one-sided agreements. First-time employees who were never taught that negotiation is even an option.

A legal consultation costs $300+ per hour, putting real contract review out of reach for the people who need it most. We wanted to build something that could bridge that gap: not a replacement for a lawyer, but a tool that gives people the confidence and knowledge to advocate for themselves.

The idea was simple. What if AI could break down a contract in plain language, tell you what's dangerous, and then *coach you* through the conversation?

### What it does

PushBack is a three-step contract intelligence tool:

1. **Upload and Analyze.** Drop a PDF or paste contract text. Claude Sonnet 4.5 analyzes every clause and rates it by severity: red for dangerous, amber for concerning, green for fair. You get animated charts showing severity distribution, a risk gauge, financial impact estimates, and an interactive orbital clause map.

2. **Practice Negotiating.** Pick any risky clause and enter a sparring session. The AI plays a realistic counterparty (HR director, landlord, legal counsel) and responds to your arguments. After each exchange, you get real-time coaching notes evaluating your approach. Choose between text chat or voice mode with an animated Siri-style orb that listens, thinks, and speaks back.

3. **Get Your Script.** After practicing, PushBack generates a personalized negotiation script with exact phrases to say, ask, and insist on, plus tone and delivery tips. Walk into the meeting prepared.

### How we built it

The frontend is built with **Next.js 16** (App Router) and **React 19**, styled with **Tailwind CSS v4** using a warm yellow-50 design system inspired by premium SaaS landing pages. Animations use the **Motion** library (Framer Motion v12) for staggered entrances, layout transitions, and interactive elements like the orbital clause map and voice orb.

The AI layer uses **Claude Sonnet 4.5** through the **Vercel AI SDK v6**. Contract analysis uses `generateObject()` with **Zod** schemas for type-safe structured output. The sparring chat uses `streamText()` for real-time streaming responses. A custom delimiter protocol (`---COACHING---`) separates the counterparty dialog from coaching notes in a single stream.

Voice mode uses the **Web Speech API** (SpeechRecognition + SpeechSynthesis) for a fully hands-free negotiation practice experience. The animated orb visualizes four states: idle, listening, thinking, and speaking.

Authentication runs on **Supabase** with Google OAuth and SSR cookie-based sessions. All contract data is processed in memory and never stored.

Key UI components include:
- An animated **CPU architecture SVG** (from 21st.dev) for the loading screen
- A **radial orbital timeline** showing clauses orbiting a central hub
- **Mouse-tracking glow cards** with spotlight border effects
- A **scrolling marquee** of contract questions on the landing page
- Custom **inline markdown rendering** for AI-generated bold/italic text

### Challenges we faced

**AI output consistency.** Claude's responses sometimes included markdown formatting (`**bold**`) that rendered as literal asterisks. We built a lightweight inline markdown parser rather than pulling in a heavy library, handling `**bold**`, `*italic*`, `*text:*` edge cases, and stray unpaired asterisks.

**Voice mode browser compatibility.** The Web Speech API works differently across browsers. We added feature detection, graceful fallback messaging, and a one-tap switch to text chat for unsupported browsers.

**Prompt injection.** Contract text is user-supplied and goes directly into AI prompts. We built regex-based injection detection that blocks patterns like "ignore previous instructions" and rate limiting (10 analyses/hour, 50 sparring messages/hour per IP) to prevent abuse.

**Theme consistency.** We overhauled the entire design system mid-project from a dark theme to a bright warm palette. Every component (20+ files) needed updating to maintain visual consistency across the landing page, dashboard, analysis, sparring, and pricing flows.

**Structured AI output.** Getting Claude to reliably produce JSON matching a specific Zod schema for contract analysis (with severity ratings, leverage points, financial impact, and top-3 priorities) required careful prompt engineering and schema field descriptions.

### What we learned

- The Vercel AI SDK's `generateObject()` with Zod schemas is remarkably reliable for structured AI output. Schema field `.describe()` annotations act as per-field instructions to the model.
- Voice interfaces need visual feedback at every state transition. Users need to know the system is listening, thinking, or speaking. The animated orb solved this better than any text-based indicator.
- For hackathon demos, the UI *is* the product. Judges spend 2 minutes with your project. If it looks like "AI slop," the technical depth doesn't matter. Investing in animations, interactive visualizations, and polish paid off more than any backend feature.
- Rate limiting and prompt injection detection are table-stakes security, not nice-to-haves. Even for a demo.

### What's next

- PDF report export for sharing analysis results
- Multi-language support for non-English contracts
- Clause comparison database showing what's standard vs. unusual
- Browser extension for analyzing contracts encountered online
- Team features for organizations reviewing contracts at scale
