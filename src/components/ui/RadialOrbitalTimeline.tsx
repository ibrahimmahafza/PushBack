'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert, ShieldCheck, X } from 'lucide-react';

interface OrbitalItem {
  id: number;
  title: string;
  severity: 'red' | 'amber' | 'green';
  content: string;
}

interface RadialOrbitalTimelineProps {
  items: OrbitalItem[];
  onItemClick?: (item: OrbitalItem) => void;
}

const SEVERITY_CONFIG = {
  red: {
    color: '#ef4444',
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    text: 'text-red-600',
    label: 'Dangerous',
    icon: ShieldAlert,
  },
  amber: {
    color: '#f59e0b',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    text: 'text-amber-600',
    label: 'Concerning',
    icon: AlertTriangle,
  },
  green: {
    color: '#22c55e',
    bg: 'bg-green-500/15',
    border: 'border-green-500/40',
    text: 'text-green-600',
    label: 'Fair',
    icon: ShieldCheck,
  },
};

export default function RadialOrbitalTimeline({ items, onItemClick }: RadialOrbitalTimelineProps) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.25) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const handleItemClick = useCallback((item: OrbitalItem) => {
    if (activeId === item.id) {
      setActiveId(null);
      setAutoRotate(true);
    } else {
      setActiveId(item.id);
      setAutoRotate(false);
      // Rotate so clicked item is at top
      const idx = items.findIndex((i) => i.id === item.id);
      const targetAngle = (idx / items.length) * 360;
      setRotationAngle(270 - targetAngle);
    }
  }, [activeId, items]);

  const handleBgClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).dataset.orbit) {
      setActiveId(null);
      setAutoRotate(true);
    }
  }, []);

  const radius = 160;
  const counts = { red: 0, amber: 0, green: 0 };
  items.forEach((i) => counts[i.severity]++);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] sm:h-[520px] rounded-2xl bg-white/60 backdrop-blur-sm border border-black/[0.06] overflow-hidden cursor-pointer"
      onClick={handleBgClick}
    >
      {/* Radial gradient bg */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(194,65,12,0.04)_0%,_transparent_70%)]" />

      {/* Orbit rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" data-orbit>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-full border border-black/[0.06]" data-orbit />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] rounded-full border border-black/[0.06]" data-orbit />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full border border-black/[0.08]" data-orbit />

        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
          <motion.div
            className="w-3 h-3 rounded-full bg-accent"
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="mt-2 text-[10px] text-muted font-mono">{items.length} clauses</span>
        </div>

        {/* Orbital items */}
        {items.map((item, index) => {
          const angle = ((index / items.length) * 360 + rotationAngle) % 360;
          const radian = (angle * Math.PI) / 180;
          const x = radius * Math.cos(radian);
          const y = radius * Math.sin(radian);
          const opacity = 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2);
          const zIndex = Math.round(100 + 50 * Math.cos(radian));
          const isActive = activeId === item.id;
          const config = SEVERITY_CONFIG[item.severity];
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className="absolute transition-all duration-700 cursor-pointer"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                zIndex: isActive ? 200 : zIndex,
                opacity: isActive ? 1 : opacity,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item);
              }}
            >
              {/* Node */}
              <motion.div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${config.bg} ${config.border} ${isActive ? 'scale-125 ring-4 ring-black/10' : 'hover:scale-110'}`}
                whileHover={{ scale: 1.15 }}
              >
                <Icon className={`w-4 h-4 ${config.text}`} />
                {/* Status dot */}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black"
                  style={{ backgroundColor: config.color }}
                />
              </motion.div>

              {/* Label */}
              <div className={`absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono transition-all duration-300 max-w-[100px] truncate text-center ${isActive ? 'text-foreground font-semibold' : 'text-muted'}`}>
                {item.title}
              </div>

              {/* Expanded card */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-16 left-1/2 -translate-x-1/2 w-64 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-black/10 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.text} ${config.border} border`}>
                          {config.label}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveId(null); setAutoRotate(true); }}
                          className="text-muted hover:text-foreground/60 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-xs text-muted leading-relaxed mb-3">{item.content}</p>
                      {onItemClick && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                          className="w-full text-xs font-medium py-1.5 rounded-lg bg-black/5 border border-black/10 text-foreground/70 hover:bg-black/[0.08] hover:text-foreground transition-colors cursor-pointer"
                        >
                          Practice This Clause
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{counts.red} Dangerous</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{counts.amber} Concerning</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{counts.green} Fair</span>
      </div>
    </div>
  );
}
