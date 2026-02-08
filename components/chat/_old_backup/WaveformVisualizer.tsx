// components/chat/WaveformVisualizer.tsx
import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
  type: 'input' | 'output';
  color?: string;
  height?: number;
  barCount?: number;
}

export default function WaveformVisualizer({
  isActive,
  type,
  color = '#3B82F6',
  height = 60,
  barCount = 20
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(new Array(barCount).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        if (isActive) {
          // Random animation when active
          const targetHeight = Math.random() * height * 0.8 + height * 0.2;
          barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.3;
        } else {
          // Settle to minimum when inactive
          barsRef.current[i] *= 0.95;
          if (barsRef.current[i] < 2) barsRef.current[i] = 2;
        }

        const barHeight = barsRef.current[i];
        const x = i * barWidth + gap / 2;
        const y = (canvas.height - barHeight) / 2;

        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - gap, barHeight);

        // Add glow effect for active state
        if (isActive && barHeight > 10) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.fillRect(x, y, barWidth - gap, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, color, height, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      className="w-full max-w-xs mx-auto"
      style={{ height: `${height}px` }}
    />
  );
}
