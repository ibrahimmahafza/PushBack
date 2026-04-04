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
  Mic,
  Square,
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
/*  Siri-style orb — white bg version                                  */
/* ------------------------------------------------------------------ */
function SiriOrb({ state }: { state: 'idle' | 'listening' | 'thinking' | 'speaking' }) {
  const isActive = state !== 'idle';

  const blobs = {
    idle: ['rgba(80,80,100,0.3)', 'rgba(60,60,80,0.2)', 'rgba(100,100,120,0.2)'],
    listening: ['rgba(80,120,255,0.7)', 'rgba(120,50,220,0.6)', 'rgba(50,200,150,0.5)'],
    thinking: ['rgba(234,88,12,0.6)', 'rgba(200,60,180,0.5)', 'rgba(80,180,120,0.4)'],
    speaking: ['rgba(50,220,120,0.7)', 'rgba(80,100,255,0.5)', 'rgba(200,50,200,0.5)'],
  };

  const colors = blobs[state];
  const speed = state === 'listening' ? 1.5 : state === 'speaking' ? 2 : state === 'thinking' ? 3 : 6;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      {/* Ambient glow on white */}
      {isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 200, height: 200, background: `radial-gradient(circle, ${colors[0].replace(/[\d.]+\)$/, '0.08)')}, transparent 70%)` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Dark glass sphere */}
      <div className="absolute rounded-full" style={{
        width: 150, height: 150,
        background: 'radial-gradient(circle at 35% 30%, #2a2a3a, #0a0a15 70%)',
        boxShadow: `inset 0 0 40px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.15)`,
      }} />

      {/* Internal color blobs */}
      <div className="absolute rounded-full overflow-hidden" style={{ width: 146, height: 146 }}>
        {colors.map((color, i) => (
          <motion.div
            key={`${state}-${i}`}
            className="absolute rounded-full"
            style={{
              width: 70 + i * 10, height: 70 + i * 10,
              left: '50%', top: '50%', marginLeft: -(35 + i * 5), marginTop: -(35 + i * 5),
              background: `radial-gradient(circle, ${color}, transparent 70%)`,
              filter: 'blur(6px)',
            }}
            animate={{
              x: [-20 + i * 15, 20 - i * 10, -10 + i * 5, 15 - i * 12, -20 + i * 15],
              y: [10 - i * 12, -15 + i * 8, 20 - i * 10, -10 + i * 15, 10 - i * 12],
              scale: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{ duration: speed + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Specular highlight */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: 150, height: 150,
        background: 'radial-gradient(ellipse 60% 40% at 38% 25%, rgba(255,255,255,0.2), transparent 60%)',
      }} />
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
  const [audioError, setAudioError] = useState('');

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestTranscriptRef = useRef('');
  const spokenIdsRef = useRef<Set<string>>(new Set());

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

  // ── TTS with detailed error handling ──
  const speakText = useCallback(async (text: string) => {
    if (isMuted) { setOrbState('idle'); return; }
    setOrbState('speaking');
    setAudioError('');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 1000) }),
      });

      const ct = res.headers.get('content-type') ?? '';

      if (res.ok && ct.includes('audio')) {
        const blob = await res.blob();
        if (blob.size < 100) {
          console.warn('[voice] Audio blob too small:', blob.size);
          setOrbState('idle');
          return;
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        // Set volume explicitly
        audio.volume = 1.0;

        await new Promise<void>((resolve) => {
          audio.onended = () => { setOrbState('idle'); URL.revokeObjectURL(url); resolve(); };
          audio.onerror = (e) => {
            console.error('[voice] Audio playback error:', e);
            setAudioError('Audio playback failed. Check your volume.');
            setOrbState('idle');
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.play().then(() => {
            console.log('[voice] Playing ElevenLabs audio, size:', blob.size);
          }).catch((err) => {
            console.error('[voice] Play blocked:', err);
            setAudioError('Browser blocked audio. Click the orb to retry.');
            setOrbState('idle');
            resolve();
          });
        });
        return;
      } else {
        const body = await res.text().catch(() => '');
        console.warn('[voice] TTS returned non-audio:', res.status, ct, body.slice(0, 200));
      }
    } catch (err) {
      console.error('[voice] TTS fetch error:', err);
    }

    // Browser fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        u.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const pref = voices.find((v: SpeechSynthesisVoice) => v.lang.startsWith('en'));
        if (pref) u.voice = pref;
        u.onend = () => { setOrbState('idle'); resolve(); };
        u.onerror = () => { setOrbState('idle'); resolve(); };
        window.speechSynthesis.speak(u);
      });
      return;
    }

    setOrbState('idle');
  }, [isMuted]);

  // ── Watch for completed responses ──
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') return;
    const lastMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastMsg) return;
    const text = getMsgText(lastMsg);
    if (!text || spokenIdsRef.current.has(lastMsg.id)) return;
    spokenIdsRef.current.add(lastMsg.id);

    const { reply, coaching } = parseMessage(text);
    setLastResponse(text);
    setLastCoaching(coaching);
    setTipIndex((p) => (p + 1) % TIPS.length);
    if (reply) speakText(reply);
  }, [messages, status, speakText]);

  // ── Push-to-talk ──
  const startListening = useCallback(() => {
    if (!speechSupported || isLoading) return;
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setAudioError('');

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setOrbState('listening');
    recognition.onresult = (event: any) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) full += event.results[i][0].transcript;
      setTranscript(full);
      latestTranscriptRef.current = full;
    };
    recognition.onend = () => {
      const final = latestTranscriptRef.current.trim();
      if (final) { setOrbState('thinking'); sendMessage({ text: final }); }
      else setOrbState('idle');
      setTranscript(''); latestTranscriptRef.current = '';
    };
    recognition.onerror = () => { setOrbState('idle'); setTranscript(''); latestTranscriptRef.current = ''; };
    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, isLoading, sendMessage]);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); }, []);

  const handleOrbTap = useCallback(() => {
    if (orbState === 'listening') stopListening();
    else if (orbState === 'speaking') {
      window.speechSynthesis?.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setOrbState('idle');
    } else if (orbState === 'idle') startListening();
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

  // Instruction text based on state
  const instruction = orbState === 'idle'
    ? (lastResponse ? '🎤 Click the orb to reply' : '🎤 Click the orb to start speaking')
    : orbState === 'listening'
      ? '🔴 Recording... click orb when done'
      : orbState === 'thinking'
        ? '⏳ Generating response...'
        : '🔊 Speaking... click to interrupt';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Negotiation Partner</p>
        <h2 className="text-lg font-semibold text-foreground">
          {contractType === 'employment' || contractType === 'independent_contractor' ? 'Jordan, HR Director'
            : contractType === 'nda' || contractType === 'non_compete' ? 'Alex, Legal Counsel'
            : 'Sam, Account Manager'}
        </h2>
        <p className="text-sm text-muted mt-1">Practicing: <span className="font-medium text-foreground">{clause.title}</span></p>
      </motion.div>

      {/* Clear instruction */}
      <AnimatePresence mode="wait">
        <motion.p
          key={instruction}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className={`text-sm font-medium mb-4 ${orbState === 'listening' ? 'text-red-600' : orbState === 'speaking' ? 'text-green-600' : 'text-muted'}`}
        >
          {instruction}
        </motion.p>
      </AnimatePresence>

      {/* Orb — white background, dark sphere */}
      <motion.div
        className="cursor-pointer mb-4 rounded-full p-6"
        onClick={handleOrbTap}
        whileTap={{ scale: 0.95 }}
      >
        <SiriOrb state={isLoading && orbState !== 'speaking' ? 'thinking' : orbState} />
      </motion.div>

      {/* Action button below orb for extra clarity */}
      <div className="mb-6">
        {orbState === 'idle' && !isLoading && (
          <button onClick={startListening} className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-colors cursor-pointer">
            <Mic className="h-4 w-4" />
            {lastResponse ? 'Reply' : 'Start Speaking'}
          </button>
        )}
        {orbState === 'listening' && (
          <button onClick={stopListening} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer animate-pulse">
            <Square className="h-3.5 w-3.5" />
            Done Speaking
          </button>
        )}
      </div>

      {/* Audio error */}
      {audioError && (
        <div className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 mb-4 text-center">
          <p className="text-xs text-amber-800">{audioError}</p>
        </div>
      )}

      {/* Live transcript */}
      <AnimatePresence mode="wait">
        {transcript && (
          <motion.div key="transcript" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-md rounded-xl bg-accent/5 border border-accent/20 px-4 py-3 mb-4">
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
            className="w-full max-w-md rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 mb-4">
            <p className="text-xs font-medium text-accent mb-1">🎯 Coaching Note</p>
            <p className="text-sm text-foreground/70 leading-relaxed">{renderMarkdown(lastCoaching)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <motion.div className="w-full max-w-md rounded-xl border border-dashed border-neutral-300 bg-white/40 px-4 py-3 mb-4" layout>
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
