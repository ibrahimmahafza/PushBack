'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Interactive gradient background — adapted from 21st.dev BackgroundGradientAnimation
 * Warm light-theme colors, mouse-following pointer blob, SVG goo filter.
 */
export function BackgroundGradient({
  children,
  className,
  interactive = true,
}: {
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const curXRef = useRef(0);
  const curYRef = useRef(0);
  const tgXRef = useRef(0);
  const tgYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Set CSS vars on body for the gradient
    const s = document.body.style;
    s.setProperty('--gradient-background-start', '#fefce8');
    s.setProperty('--gradient-background-end', '#fff7ed');
    s.setProperty('--first-color', '251, 146, 60');     // orange-400
    s.setProperty('--second-color', '252, 211, 77');     // amber-300
    s.setProperty('--third-color', '253, 164, 175');     // rose-300
    s.setProperty('--fourth-color', '147, 197, 253');    // blue-300
    s.setProperty('--fifth-color', '134, 239, 172');     // green-300
    s.setProperty('--pointer-color', '251, 191, 36');    // amber-400
    s.setProperty('--size', '50%');
    s.setProperty('--blending-value', 'hard-light');
  }, []);

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  // Animation loop
  useEffect(() => {
    if (!interactive) return;
    function animate() {
      if (interactiveRef.current) {
        curXRef.current += (tgXRef.current - curXRef.current) / 20;
        curYRef.current += (tgYRef.current - curYRef.current) / 20;
        interactiveRef.current.style.transform = `translate(${Math.round(curXRef.current)}px, ${Math.round(curYRef.current)}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [interactive]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveRef.current) return;
    const rect = interactiveRef.current.getBoundingClientRect();
    tgXRef.current = e.clientX - rect.left;
    tgYRef.current = e.clientY - rect.top;
  };

  return (
    <div className={cn('h-full w-full relative overflow-hidden bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]', className)}>
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Content layer */}
      <div className="relative z-10">{children}</div>

      {/* Gradient blobs */}
      <div className={cn(
        'gradients-container absolute inset-0 h-full w-full blur-lg',
        isSafari ? 'blur-2xl' : '[filter:url(#blurMe)_blur(40px)]',
      )}>
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),0.8)_0,_rgba(var(--first-color),0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:center_center] animate-first opacity-100" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),0.8)_0,_rgba(var(--second-color),0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-400px)] animate-second opacity-100" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),0.8)_0,_rgba(var(--third-color),0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%+400px)] animate-third opacity-100" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),0.8)_0,_rgba(var(--fourth-color),0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-200px)] animate-fourth opacity-70" />
        <div className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),0.8)_0,_rgba(var(--fifth-color),0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] [transform-origin:calc(50%-800px)_calc(50%+800px)] animate-fifth opacity-100" />

        {interactive && (
          <div
            ref={interactiveRef}
            onMouseMove={handleMouseMove}
            className="absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),0.8)_0,_rgba(var(--pointer-color),0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2 opacity-70"
          />
        )}
      </div>
    </div>
  );
}
