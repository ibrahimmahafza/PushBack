'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import {
  ArrowLeft,
  Mic,
  MicOff,
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
/*  Coaching delimiter                                                 */
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
/*  Tips shown during conversation                                     */
/* ------------------------------------------------------------------ */
const TIPS = [
  { icon: Lightbulb, text: 'Start by acknowledging their position before making your counter-argument.' },
  { icon: Shield, text: 'Ask "what specifically are you trying to protect?" to narrow the scope.' },
  { icon: Sparkles, text: 'Use phrases like "I understand, and..." instead of "but..."' },
  { icon: Lightbulb, text: 'Reference industry standards: "Most contracts in this field typically..."' },
  { icon: Shield, text: 'Propose alternatives: "What if we adjusted the timeframe to..."' },
  { icon: Sparkles, text: 'Stay calm and professional. Confidence comes from preparation.' },
];

/* ------------------------------------------------------------------ */
/*  Siri-style animated orb                                            */
/* ------------------------------------------------------------------ */
function VoiceOrb({
  state,
}: {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
}) {
  const colors = {
    idle: ['#d1d5db', '#9ca3af'],
    listening: ['#3b82f6', '#06b6d4', '#8b5cf6'],
    thinking: ['#f59e0b', '#f97316'],
    speaking: ['#22c55e', '#10b981', '#06b6d4'],
  };

  const currentColors = colors[state];
  const isActive = state !== 'idle';

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background: `radial-gradient(circle, ${currentColors[0]}15, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              background: `radial-gradient(circle, ${currentColors[0]}20, transparent 70%)`,
            }}
            animate={{
              scale: [1.1, 0.9, 1.1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </>
      )}

      {/* Main orb */}
      <motion.div
        className="relative w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentColors.join(', ')})`,
        }}
        animate={
          state === 'listening'
            ? { scale: [1, 1.08, 1.02, 1.06, 1], borderRadius: ['50%', '48%', '52%', '47%', '50%'] }
            : state === 'speaking'
              ? { scale: [1, 1.05, 0.98, 1.03, 1] }
              : state === 'thinking'
                ? { rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] }
                : { scale: 1 }
        }
        transition={
          isActive
            ? { duration: state === 'listening' ? 0.8 : 1.2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-white/20 rounded-full" />

        {/* Waveform bars when listening */}
        {state === 'listening' && (
          <div className="flex items-center gap-[3px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-white/80"
                animate={{ height: [8, 24 + Math.random() * 16, 8] }}
                transition={{
                  duration: 0.5 + Math.random() * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Pulse when speaking */}
        {state === 'speaking' && (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/80"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}

        {/* Thinking spinner */}
        {state === 'thinking' && (
          <motion.div
            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Idle mic icon */}
        {state === 'idle' && (
          <Mic className="w-8 h-8 text-white/60" />
        )}
      </motion.div>

      {/* State label */}
      <motion.p
        className="absolute -bottom-8 text-sm font-medium text-muted"
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
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    const hasSS = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setSpeechSupported(hasSR && hasSS);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => setTipIndex((prev) => (prev + 1) % TIPS.length), 8000);
    return () => clearInterval(interval);
  }, []);

  // Watch for new assistant messages to speak
  useEffect(() => {
    const lastMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastMsg) return;
    const text = getMessageText(lastMsg);
    if (!text || text === lastResponse) return;

    const { counterpartyText, coachingNote } = parseAssistantMessage(text);
    setLastResponse(text);
    setLastCoaching(coachingNote);
    setTipIndex((prev) => (prev + 1) % TIPS.length);

    if (!isMuted && counterpartyText) {
      speakText(counterpartyText);
    } else {
      setOrbState('idle');
    }
  }, [messages, isMuted]);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!speechSupported) return;

    // Stop any ongoing speech
    window.speechSynthesis?.cancel();

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
    };

    recognition.onend = () => {
      const finalText = transcript.trim();
      if (finalText && !isLoading) {
        setOrbState('thinking');
        sendMessage({ text: finalText });
        setTranscript('');
      } else {
        setOrbState('idle');
      }
    };

    recognition.onerror = () => {
      setOrbState('idle');
      setTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, transcript, isLoading, sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Text-to-speech
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setOrbState('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural'));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => setOrbState('idle');
    utterance.onerror = () => setOrbState('idle');

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Handle orb tap
  const handleOrbTap = useCallback(() => {
    if (orbState === 'listening') {
      stopListening();
    } else if (orbState === 'speaking') {
      window.speechSynthesis?.cancel();
      setOrbState('idle');
    } else if (orbState === 'idle') {
      startListening();
    }
  }, [orbState, startListening, stopListening]);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-muted" /> : <Volume2 className="h-4 w-4 text-muted" />}
          </button>
          <button
            onClick={onSwitchToChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 text-xs font-medium text-muted hover:text-foreground hover:bg-black/5 transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Switch to Chat
          </button>
        </div>
      </div>

      {/* AI Identity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
          Negotiation Partner
        </p>
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

      {/* Orb */}
      <motion.div
        className="cursor-pointer mb-12"
        onClick={handleOrbTap}
        whileTap={{ scale: 0.95 }}
      >
        <VoiceOrb state={isLoading ? 'thinking' : orbState} />
      </motion.div>

      {/* Live transcript */}
      <AnimatePresence mode="wait">
        {transcript && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-md rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 mb-6"
          >
            <p className="text-sm text-blue-800 text-center italic">&ldquo;{transcript}&rdquo;</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last AI response */}
      <AnimatePresence mode="wait">
        {lastResponse && !transcript && orbState !== 'listening' && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-xl bg-white/70 border border-black/[0.06] px-4 py-3 mb-4"
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              {renderMarkdown(parseAssistantMessage(lastResponse).counterpartyText)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coaching note */}
      <AnimatePresence>
        {lastCoaching && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3 mb-6"
          >
            <p className="text-xs font-medium text-blue-600 mb-1">🎯 Coaching Note</p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {renderMarkdown(lastCoaching)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips panel */}
      <motion.div
        className="w-full max-w-md rounded-xl border border-dashed border-neutral-300 bg-white/40 px-4 py-3 mb-6"
        layout
      >
        <div className="flex items-start gap-2">
          <tip.icon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="text-sm text-muted leading-relaxed"
            >
              {tip.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Exchange count + script CTA */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-muted">
        <span>Exchange {exchangeCount} of 8</span>
        {exchangeCount >= 3 && onGetScript && (
          <button
            onClick={handleGetScript}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-yellow-50 hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get My Script
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
