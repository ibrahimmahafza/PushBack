'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Shield,
} from 'lucide-react';
import type { Clause } from '@/lib/types';
import { renderMarkdown } from '@/lib/markdown';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const COACHING_DELIMITER = '---COACHING---';

function parseMessage(text: string) {
  const idx = text.indexOf(COACHING_DELIMITER);
  if (idx === -1) return { reply: text, coaching: null as string | null };
  return { reply: text.slice(0, idx).trim(), coaching: text.slice(idx + COACHING_DELIMITER.length).trim() };
}

function getMsgText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  return msg.parts?.filter((p) => p.type === 'text' && p.text).map((p) => p.text!).join('') ?? '';
}

const TIPS = [
  { icon: Lightbulb, text: 'Start by acknowledging their position before countering.' },
  { icon: Shield, text: 'Ask "what specifically are you trying to protect?" to narrow scope.' },
  { icon: Sparkles, text: 'Use "I understand, and..." instead of "but..."' },
  { icon: Lightbulb, text: 'Reference industry standards: "Most contracts typically..."' },
  { icon: Shield, text: 'Propose alternatives: "What if we adjusted the timeframe?"' },
  { icon: Sparkles, text: 'Confidence comes from preparation. You are prepared.' },
];

/* ------------------------------------------------------------------ */
/*  Siri-style glass orb with internal color blobs                     */
/* ------------------------------------------------------------------ */
function SiriOrb({ state }: { state: 'idle' | 'listening' | 'thinking' | 'speaking' }) {
  const isActive = state !== 'idle';

  // Blob colors per state
  const blobs = {
    idle: ['rgba(120,120,140,0.4)', 'rgba(100,100,120,0.3)', 'rgba(140,140,160,0.3)'],
    listening: ['rgba(80,120,255,0.7)', 'rgba(120,50,220,0.6)', 'rgba(50,200,150,0.5)'],
    thinking: ['rgba(234,88,12,0.6)', 'rgba(200,60,180,0.5)', 'rgba(80,180,120,0.4)'],
    speaking: ['rgba(50,220,120,0.7)', 'rgba(80,100,255,0.5)', 'rgba(200,50,200,0.5)'],
  };

  const colors = blobs[state];
  const speed = state === 'listening' ? 1.5 : state === 'speaking' ? 2 : state === 'thinking' ? 3 : 6;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Ambient glow */}
      {isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 220, height: 220,
            background: `radial-gradient(circle, ${colors[0].replace(/[\d.]+\)$/, '0.12)')}, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Glass sphere shell */}
      <div
        className="absolute rounded-full"
        style={{
          width: 160, height: 160,
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.15), rgba(0,0,0,0.4) 70%)',
          boxShadow: `
            inset 0 0 40px rgba(0,0,0,0.4),
            inset 0 0 10px rgba(255,255,255,0.05),
            0 0 ${isActive ? 60 : 30}px rgba(0,0,0,0.3)
          `,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />

      {/* Internal animated color blobs */}
      <div className="absolute rounded-full overflow-hidden" style={{ width: 156, height: 156 }}>
        {colors.map((color, i) => (
          <motion.div
            key={`${state}-${i}`}
            className="absolute rounded-full"
            style={{
              width: 80 + i * 10,
              height: 80 + i * 10,
              background: `radial-gradient(circle, ${color}, transparent 70%)`,
              filter: 'blur(8px)',
            }}
            animate={{
              x: [
                -20 + i * 15,
                20 - i * 10,
                -10 + i * 5,
                15 - i * 12,
                -20 + i * 15,
              ],
              y: [
                10 - i * 12,
                -15 + i * 8,
                20 - i * 10,
                -10 + i * 15,
                10 - i * 12,
              ],
              scale: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{
              duration: speed + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Top specular highlight */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 160, height: 160,
          background: 'radial-gradient(ellipse 60% 40% at 40% 25%, rgba(255,255,255,0.25), transparent 60%)',
        }}
      />

      {/* Edge rim light */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 160, height: 160,
          background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(255,255,255,0.06), transparent 40%)',
        }}
      />

      {/* Label */}
      <motion.p
        className="absolute -bottom-10 text-sm font-medium whitespace-nowrap"
        style={{ color: isActive ? 'var(--color-foreground)' : 'var(--color-muted)' }}
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {state === 'idle' && 'Tap to start'}
        {state === 'listening' && 'Listening... tap when done'}
        {state === 'thinking' && 'Thinking...'}
        {state === 'speaking' && 'Speaking...'}
      </motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface VoiceSparringProps {
  clause: Clause;
  contractType?: string;
  onBack: () => void;
  onSwitchToChat: () => void;
  onGetScript?: (messages: Array<{ role: string; content: string }>) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function VoiceSparring({ clause, contractType, onBack, onSwitchToChat, onGetScript }: VoiceSparringProps) {
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [lastCoaching, setLastCoaching] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestTranscriptRef = useRef('');
  const spokenResponsesRef = useRef<Set<string>>(new Set());

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/spar', body: { clause, contractType } }),
    [clause.title, clause.originalText, contractType],
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === 'submitted' || status === 'streaming';
  const exchangeCount = messages.filter((m) => m.role === 'assistant').length;

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window));
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTipIndex((p) => (p + 1) % TIPS.length), 8000);
    return () => clearInterval(iv);
  }, []);

  // ── TTS ──
  const speakText = useCallback(async (text: string) => {
    if (isMuted) { setOrbState('idle'); return; }
    setOrbState('speaking');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 1000) }),
      });
      const ct = res.headers.get('content-type') ?? '';
      if (res.ok && ct.includes('audio')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        return new Promise<void>((resolve) => {
          audio.onended = () => { setOrbState('idle'); URL.revokeObjectURL(url); resolve(); };
          audio.onerror = () => { setOrbState('idle'); URL.revokeObjectURL(url); resolve(); };
          audio.play().catch(() => { setOrbState('idle'); resolve(); });
        });
      }
    } catch { /* fallthrough */ }

    // Browser fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      return new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        const voices = window.speechSynthesis.getVoices();
        const pref = voices.find((v: SpeechSynthesisVoice) => v.name.includes('Samantha') || v.name.includes('Google') || v.lang === 'en-US');
        if (pref) u.voice = pref;
        u.onend = () => { setOrbState('idle'); resolve(); };
        u.onerror = () => { setOrbState('idle'); resolve(); };
        window.speechSynthesis.speak(u);
      });
    }
    setOrbState('idle');
  }, [isMuted]);

  // ── Watch for completed AI responses (only when streaming ends) ──
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') return; // wait until done

    const lastMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastMsg) return;
    const text = getMsgText(lastMsg);
    if (!text || spokenResponsesRef.current.has(lastMsg.id)) return;

    spokenResponsesRef.current.add(lastMsg.id);
    const { reply, coaching } = parseMessage(text);
    setLastResponse(text);
    setLastCoaching(coaching);
    setTipIndex((p) => (p + 1) % TIPS.length);
    if (reply) speakText(reply);
  }, [messages, status, speakText]);

  // ── Push-to-talk: START recording ──
  const startListening = useCallback(() => {
    if (!speechSupported || isLoading) return;
    // Stop any playback
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;     // Don't auto-stop on silence
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setOrbState('listening');
    recognition.onresult = (event: any) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
      latestTranscriptRef.current = full;
    };
    recognition.onend = () => {
      // Only fires when we manually stop — send the message
      const final = latestTranscriptRef.current.trim();
      if (final) {
        setOrbState('thinking');
        sendMessage({ text: final });
      } else {
        setOrbState('idle');
      }
      setTranscript('');
      latestTranscriptRef.current = '';
    };
    recognition.onerror = () => {
      setOrbState('idle');
      setTranscript('');
      latestTranscriptRef.current = '';
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, isLoading, sendMessage]);

  // ── Push-to-talk: STOP recording ──
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // triggers onend → sends message
    }
  }, []);

  // ── Orb tap handler ──
  const handleOrbTap = useCallback(() => {
    if (orbState === 'listening') {
      // User is done talking — stop and send
      stopListening();
    } else if (orbState === 'speaking') {
      // Interrupt playback
      window.speechSynthesis?.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setOrbState('idle');
    } else if (orbState === 'idle') {
      startListening();
    }
    // thinking state — do nothing, wait for response
  }, [orbState, startListening, stopListening]);

  const handleGetScript = useCallback(() => {
    if (!onGetScript) return;
    onGetScript(messages.map((m) => {
      let c = getMsgText(m);
      if (m.role === 'assistant') { const i = c.indexOf(COACHING_DELIMITER); if (i !== -1) c = c.slice(0, i).trim(); }
      return { role: m.role, content: c };
    }));
  }, [messages, onGetScript]);

  const tip = TIPS[tipIndex];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
            {isMuted ? <VolumeX className="h-4 w-4 text-muted" /> : <Volume2 className="h-4 w-4 text-muted" />}
          </button>
          <button onClick={onSwitchToChat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 text-xs font-medium text-muted hover:text-foreground hover:bg-black/5 transition-colors cursor-pointer">
            <MessageSquare className="h-3.5 w-3.5" /> Switch to Chat
          </button>
        </div>
      </div>

      {/* AI Identity */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-6">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Negotiation Partner</p>
        <h2 className="text-lg font-semibold text-foreground">
          {contractType === 'employment' || contractType === 'independent_contractor' ? 'Jordan, HR Director'
            : contractType === 'nda' || contractType === 'non_compete' ? 'Alex, Legal Counsel'
            : 'Sam, Account Manager'}
        </h2>
        <p className="text-sm text-muted mt-1">Practicing: <span className="font-medium text-foreground">{clause.title}</span></p>
      </motion.div>

      {/* Siri Orb — dark backdrop for the glass effect */}
      <div className="rounded-3xl bg-[#0a0a1a] p-8 mb-6">
        <motion.div className="cursor-pointer" onClick={handleOrbTap} whileTap={{ scale: 0.95 }}>
          <SiriOrb state={isLoading && orbState !== 'speaking' ? 'thinking' : orbState} />
        </motion.div>
      </div>

      {/* Live transcript */}
      <AnimatePresence mode="wait">
        {transcript && (
          <motion.div key="transcript" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-md rounded-xl bg-accent/5 border border-accent/20 px-4 py-3 mb-6">
            <p className="text-sm text-foreground text-center italic">&ldquo;{transcript}&rdquo;</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last AI response */}
      <AnimatePresence mode="wait">
        {lastResponse && !transcript && orbState !== 'listening' && (
          <motion.div key="response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-xl bg-white/70 border border-black/[0.06] px-4 py-3 mb-4">
            <p className="text-sm text-foreground/80 leading-relaxed">{renderMarkdown(parseMessage(lastResponse).reply)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coaching note */}
      <AnimatePresence>
        {lastCoaching && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 mb-6">
            <p className="text-xs font-medium text-accent mb-1">🎯 Coaching Note</p>
            <p className="text-sm text-foreground/70 leading-relaxed">{renderMarkdown(lastCoaching)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <motion.div className="w-full max-w-md rounded-xl border border-dashed border-neutral-300 bg-white/40 px-4 py-3 mb-6" layout>
        <div className="flex items-start gap-2">
          <tip.icon className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p key={tipIndex} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="text-sm text-muted leading-relaxed">
              {tip.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-muted">
        <span>Exchange {exchangeCount} of 8</span>
        {exchangeCount >= 3 && onGetScript && (
          <button onClick={handleGetScript} disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer">
            <Sparkles className="h-3.5 w-3.5" /> Get My Script
          </button>
        )}
      </div>

      {!speechSupported && (
        <div className="w-full max-w-md mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-sm text-amber-800">Voice not supported in this browser. Use Chrome/Edge, or switch to chat.</p>
        </div>
      )}
    </motion.div>
  );
}
