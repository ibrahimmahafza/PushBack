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
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface VoiceSparringProps {
  clause: Clause;
  contractType?: string;
  onBack: () => void;
  onSwitchToChat: () => void;
  onGetScript?: (messages: Array<{ role: string; content: string }>) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const COACHING_DELIMITER = '---COACHING---';

function parseAssistantMessage(text: string) {
  const idx = text.indexOf(COACHING_DELIMITER);
  if (idx === -1) return { counterpartyText: text, coachingNote: null as string | null };
  return {
    counterpartyText: text.slice(0, idx).trim(),
    coachingNote: text.slice(idx + COACHING_DELIMITER.length).trim(),
  };
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  return message.parts?.filter((p) => p.type === 'text' && p.text).map((p) => p.text!).join('') ?? '';
}

/* ------------------------------------------------------------------ */
/*  Tips                                                               */
/* ------------------------------------------------------------------ */
const TIPS = [
  { icon: Lightbulb, text: 'Start by acknowledging their position before countering.' },
  { icon: Shield, text: 'Ask "what specifically are you trying to protect?" to narrow scope.' },
  { icon: Sparkles, text: 'Use "I understand, and..." instead of "but..."' },
  { icon: Lightbulb, text: 'Reference industry standards: "Most contracts typically..."' },
  { icon: Shield, text: 'Propose alternatives: "What if we adjusted the timeframe?"' },
  { icon: Sparkles, text: 'Confidence comes from preparation. You are prepared.' },
];

/* ------------------------------------------------------------------ */
/*  ElevenLabs-style metallic orb                                      */
/* ------------------------------------------------------------------ */
function MetallicOrb({ state }: { state: 'idle' | 'listening' | 'thinking' | 'speaking' }) {
  const gradients: Record<string, string> = {
    idle: 'conic-gradient(from 0deg, #c0c0c0, #808080, #d0d0d0, #909090, #c0c0c0, #707070, #b0b0b0, #808080, #c0c0c0)',
    listening: 'conic-gradient(from 0deg, #93c5fd, #3b82f6, #bfdbfe, #60a5fa, #93c5fd, #2563eb, #bfdbfe, #3b82f6, #93c5fd)',
    thinking: 'conic-gradient(from 0deg, #fde68a, #f59e0b, #fef3c7, #d97706, #fde68a, #b45309, #fef3c7, #f59e0b, #fde68a)',
    speaking: 'conic-gradient(from 0deg, #bbf7d0, #22c55e, #dcfce7, #16a34a, #bbf7d0, #15803d, #dcfce7, #22c55e, #bbf7d0)',
  };

  const isActive = state !== 'idle';
  const rotationDuration = state === 'listening' ? 2 : state === 'speaking' ? 3 : state === 'thinking' ? 4 : 8;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      {isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 180,
            height: 180,
            background: state === 'listening'
              ? 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)'
              : state === 'speaking'
                ? 'radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%)'
                : 'radial-gradient(circle, rgba(245,158,11,0.15), transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 148,
          height: 148,
          background: 'conic-gradient(from 0deg, #1a1a1a, #333, #1a1a1a, #222, #1a1a1a)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      />

      {/* Main metallic orb */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 132,
          height: 132,
          background: gradients[state],
          boxShadow: `
            inset 0 -4px 12px rgba(0,0,0,0.3),
            inset 0 4px 12px rgba(255,255,255,0.2),
            0 0 ${isActive ? '40px' : '20px'} rgba(0,0,0,0.15)
          `,
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: rotationDuration, repeat: Infinity, ease: 'linear' }}
      >
        {/* Central highlight/depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.25) 0%, transparent 50%)',
          }}
        />
        {/* Pinch point in center */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 15%)',
          }}
        />
      </motion.div>

      {/* Scale pulse when active */}
      {isActive && (
        <motion.div
          className="absolute rounded-full border-2"
          style={{
            width: 152,
            height: 152,
            borderColor: state === 'listening' ? 'rgba(59,130,246,0.3)' : state === 'speaking' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* State label */}
      <motion.p
        className="absolute -bottom-10 text-sm font-medium text-muted whitespace-nowrap"
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {state === 'idle' && 'Tap to speak'}
        {state === 'listening' && 'Listening...'}
        {state === 'thinking' && 'Thinking...'}
        {state === 'speaking' && 'Speaking...'}
      </motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function VoiceSparring({
  clause,
  contractType,
  onBack,
  onSwitchToChat,
  onGetScript,
}: VoiceSparringProps) {
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

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/spar', body: { clause, contractType } }),
    [clause.title, clause.originalText, contractType],
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === 'submitted' || status === 'streaming';
  const exchangeCount = messages.filter((m) => m.role === 'assistant').length;

  // Check speech support
  useEffect(() => {
    const hasSR = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setSpeechSupported(hasSR);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => setTipIndex((prev) => (prev + 1) % TIPS.length), 8000);
    return () => clearInterval(interval);
  }, []);

  // Speak text via ElevenLabs API (with browser fallback)
  const speakText = useCallback(async (text: string) => {
    if (isMuted) { setOrbState('idle'); return; }
    setOrbState('speaking');

    try {
      // Try ElevenLabs TTS first
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 1000) }),
      });

      const contentType = res.headers.get('content-type') ?? '';

      if (res.ok && contentType.includes('audio')) {
        // ElevenLabs audio available
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setOrbState('idle'); URL.revokeObjectURL(url); };
        audio.onerror = () => { setOrbState('idle'); URL.revokeObjectURL(url); };
        await audio.play();
        return;
      }
    } catch {
      // ElevenLabs failed, fall through to browser TTS
    }

    // Browser SpeechSynthesis fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;

      // Wait for voices to load
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find((v) =>
          v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US'
        );
        if (preferred) utterance.voice = preferred;
      }

      utterance.onend = () => setOrbState('idle');
      utterance.onerror = () => setOrbState('idle');
      window.speechSynthesis.speak(utterance);
    } else {
      setOrbState('idle');
    }
  }, [isMuted]);

  // Watch for new assistant messages
  useEffect(() => {
    const lastMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastMsg || status === 'streaming') return;
    const text = getMessageText(lastMsg);
    if (!text || text === lastResponse) return;

    const { counterpartyText, coachingNote } = parseAssistantMessage(text);
    setLastResponse(text);
    setLastCoaching(coachingNote);
    setTipIndex((prev) => (prev + 1) % TIPS.length);

    if (counterpartyText) speakText(counterpartyText);
  }, [messages, status, lastResponse, speakText]);

  // Start listening
  const startListening = useCallback(() => {
    if (!speechSupported) return;
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setOrbState('listening');

    recognition.onresult = (event: any) => {
      const result = Array.from(event.results as any)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(result);
      latestTranscriptRef.current = result;
    };

    recognition.onend = () => {
      const finalText = latestTranscriptRef.current.trim();
      if (finalText) {
        setOrbState('thinking');
        sendMessage({ text: finalText });
        setTranscript('');
        latestTranscriptRef.current = '';
      } else {
        setOrbState('idle');
      }
    };

    recognition.onerror = () => {
      setOrbState('idle');
      setTranscript('');
      latestTranscriptRef.current = '';
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Handle orb tap
  const handleOrbTap = useCallback(() => {
    if (orbState === 'listening') stopListening();
    else if (orbState === 'speaking') {
      window.speechSynthesis?.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setOrbState('idle');
    } else if (orbState === 'idle' && !isLoading) startListening();
  }, [orbState, isLoading, startListening, stopListening]);

  // Get script
  const handleGetScript = useCallback(() => {
    if (!onGetScript) return;
    const extracted = messages.map((m) => {
      let content = getMessageText(m);
      if (m.role === 'assistant') {
        const idx = content.indexOf(COACHING_DELIMITER);
        if (idx !== -1) content = content.slice(0, idx).trim();
      }
      return { role: m.role, content };
    });
    onGetScript(extracted);
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
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer" title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX className="h-4 w-4 text-muted" /> : <Volume2 className="h-4 w-4 text-muted" />}
          </button>
          <button onClick={onSwitchToChat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 text-xs font-medium text-muted hover:text-foreground hover:bg-black/5 transition-colors cursor-pointer">
            <MessageSquare className="h-3.5 w-3.5" /> Switch to Chat
          </button>
        </div>
      </div>

      {/* AI Identity */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Negotiation Partner</p>
        <h2 className="text-lg font-semibold text-foreground">
          {contractType === 'employment' || contractType === 'independent_contractor'
            ? 'Jordan, HR Director'
            : contractType === 'nda' || contractType === 'non_compete'
              ? 'Alex, Legal Counsel'
              : 'Sam, Account Manager'}
        </h2>
        <p className="text-sm text-muted mt-1">
          Practicing: <span className="font-medium text-foreground">{clause.title}</span>
        </p>
      </motion.div>

      {/* Metallic Orb */}
      <motion.div className="cursor-pointer mb-14" onClick={handleOrbTap} whileTap={{ scale: 0.95 }}>
        <MetallicOrb state={isLoading && orbState !== 'speaking' ? 'thinking' : orbState} />
      </motion.div>

      {/* Live transcript */}
      <AnimatePresence mode="wait">
        {transcript && (
          <motion.div key="transcript" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-md rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 mb-6">
            <p className="text-sm text-blue-800 text-center italic">&ldquo;{transcript}&rdquo;</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last AI response */}
      <AnimatePresence mode="wait">
        {lastResponse && !transcript && orbState !== 'listening' && (
          <motion.div key="response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-xl bg-white/70 border border-black/[0.06] px-4 py-3 mb-4">
            <p className="text-sm text-foreground/80 leading-relaxed">
              {renderMarkdown(parseAssistantMessage(lastResponse).counterpartyText)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coaching note */}
      <AnimatePresence>
        {lastCoaching && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3 mb-6">
            <p className="text-xs font-medium text-blue-600 mb-1">🎯 Coaching Note</p>
            <p className="text-sm text-foreground/70 leading-relaxed">{renderMarkdown(lastCoaching)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips panel */}
      <motion.div className="w-full max-w-md rounded-xl border border-dashed border-neutral-300 bg-white/40 px-4 py-3 mb-6" layout>
        <div className="flex items-start gap-2">
          <tip.icon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p key={tipIndex} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="text-sm text-muted leading-relaxed">
              {tip.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Exchange count + script CTA */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-muted">
        <span>Exchange {exchangeCount} of 8</span>
        {exchangeCount >= 3 && onGetScript && (
          <button onClick={handleGetScript} disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-yellow-50 hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer">
            <Sparkles className="h-3.5 w-3.5" /> Get My Script
          </button>
        )}
      </div>

      {/* No speech support fallback */}
      {!speechSupported && (
        <div className="w-full max-w-md mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-sm text-amber-800">
            Voice input is not supported in this browser. Please use Chrome or Edge, or switch to chat mode.
          </p>
        </div>
      )}
    </motion.div>
  );
}
