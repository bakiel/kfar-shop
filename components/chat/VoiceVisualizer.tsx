import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
}

export default function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(new Array(20).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / 20;
      const gap = 2;

      for (let i = 0; i < 20; i++) {
        if (isActive) {
          // Random animation when active
          const targetHeight = Math.random() * 40 + 10;
          barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.3;
        } else {
          // Settle to minimum when inactive
          barsRef.current[i] *= 0.9;
          if (barsRef.current[i] < 2) barsRef.current[i] = 2;
        }

        const barHeight = barsRef.current[i];
        const x = i * barWidth + gap / 2;
        const y = (canvas.height - barHeight) / 2;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#478c0b'); // kfar-mint
        gradient.addColorStop(1, '#f6af0d'); // kfar-gold

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - gap, barHeight);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="py-4">
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="w-full h-12 mx-auto"
      />
    </div>
  );
}