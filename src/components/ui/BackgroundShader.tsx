'use client';

import { MeshGradient } from '@paper-design/shaders-react';

interface BackgroundShaderProps {
  className?: string;
  speed?: number;
}

export function BackgroundShader({ className = '', speed = 0.4 }: BackgroundShaderProps) {
  return (
    <MeshGradient
      className={className}
      colors={['#030712', '#0a0f2e', '#111a3a', '#060a1a']}
      speed={speed}
      distortion={0.6}
      swirl={0.15}
    />
  );
}
