import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

const SLEEK_WEBSITE_COLORS = [
  '#a8c7fa', // Gemini Light Blue
  '#c07efd', // Gemini Soft Purple
  '#1a73e8', // Primary Studio Blue
  '#c4eed0', // Soft Gemini Green
];

export const QuantumThreadCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastSpawnTime = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Check if point is inside an interactive UI component
    const isPointInsideUI = (x: number, y: number): boolean => {
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return true;
      const element = document.elementFromPoint(x, y);
      if (!element) return false;
      return !!element.closest('.studio-card, form, input, button, a, label, [role="button"]');
    };

    const spawnSleekNode = (x: number, y: number) => {
      if (isPointInsideUI(x, y)) return;

      const now = performance.now();
      if (now - lastSpawnTime < 35) return;
      lastSpawnTime = now;

      // Minimum distance spacing between nodes
      const isTooClose = particles.some(
        (p) => Math.hypot(p.x - x, p.y - y) < 18
      );
      if (isTooClose) return;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.7 + 0.2; // Expanded movement spread

      particles.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.12,
        size: 3.2, // Slightly increased node size (3.2px)
        alpha: 0.9,
        color: SLEEK_WEBSITE_COLORS[Math.floor(Math.random() * SLEEK_WEBSITE_COLORS.length)],
      });

      if (particles.length > 40) {
        particles.splice(0, particles.length - 40);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointInsideUI(e.clientX, e.clientY)) {
        spawnSleekNode(e.clientX, e.clientY);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Laser Thread Lines (1.2px) with Expanded Spread Range (130px)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 130) { // Expanded connection spread range
            const lineAlpha = (1 - dist / 130) * Math.min(p1.alpha, p2.alpha) * 0.38;
            ctx.save();
            ctx.globalAlpha = lineAlpha;
            ctx.strokeStyle = p1.color;
            ctx.shadowColor = p1.color;
            ctx.shadowBlur = 6;
            ctx.lineWidth = 1.2; // Slightly increased crisp line width

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Render Crisp Glowing Nodes (3.2px)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.008; // Smooth slow fade

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
