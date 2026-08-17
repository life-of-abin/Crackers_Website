"use client";

import React, { useEffect, useRef } from "react";

interface HeroFireworksProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  drag: number;
  trail: { x: number; y: number }[];
  maxTrailLength: number;
  sparkle: boolean;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number }[];
  isHero: boolean;
}

interface Flash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

// Strictly Golden & Warm Champagne Colors
const GOLD_COLORS = [
  "#FFD700", // Rich Gold
  "#FFC107", // Bright Yellow Gold
  "#F7E7CE", // Champagne Gold
  "#FFF8E7", // Warm Golden White
  "#F59E0B", // Deep Amber Gold
  "#FEF3C7", // Warm Light Sparkle Gold
  "#FBBF24", // Golden Amber
];

export default function HeroFireworks({ className = "" }: HeroFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const handleResize = () => {
      if (!canvas || !container) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    const flashes: Flash[] = [];

    const getRandomGold = () => GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];

    const spawnRocket = () => {
      // Keep launches well-distributed across horizontal width
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      // Vary explosion height (higher on desktop, safe margin from top)
      const targetY = Math.random() * (height * 0.4) + height * 0.08;
      const isHero = Math.random() < 0.28; // ~28% hero bursts
      const color = isHero ? "#FFF8E7" : getRandomGold();

      rockets.push({
        x: startX,
        y: height + 10,
        targetY,
        vy: -(Math.random() * 3.5 + 7.0),
        color,
        exploded: false,
        trail: [],
        isHero,
      });
    };

    const createExplosion = (x: number, y: number, color: string, isHero: boolean) => {
      // Flash effect at center of explosion
      flashes.push({
        x,
        y,
        radius: 10,
        maxRadius: isHero ? 60 : 40,
        alpha: 0.9,
        color: "#FFF8E7",
      });

      // Scale particle count based on screen size & hero status
      const baseCount = width < 640 ? 45 : 85;
      const count = isHero ? Math.floor(baseCount * 1.6) : baseCount;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        // Speeds for realistic radial spread
        const speedMultiplier = isHero ? 1.4 : 1.0;
        const speed = (Math.random() * 5.5 + 1.8) * speedMultiplier;
        const pColor = Math.random() > 0.3 ? color : getRandomGold();

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.5 + (isHero ? 2.0 : 1.5),
          color: pColor,
          alpha: 1.0,
          decay: Math.random() * 0.015 + 0.008, // Longer fade out
          gravity: Math.random() * 0.02 + 0.035, // Natural downward drift
          drag: 0.982,
          trail: [],
          maxTrailLength: isHero ? 6 : 4,
          sparkle: Math.random() < 0.4,
        });
      }
    };

    let frameId: number;
    let tick = 0;

    const loop = () => {
      tick++;

      // Clear frame completely
      ctx.clearRect(0, 0, width, height);

      // Periodically spawn new rockets (maintain 1-3 active bursts)
      if (tick % 55 === 0 && rockets.length < 3) {
        spawnRocket();
      }

      // 1. Draw Flashes
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.radius += (f.maxRadius - f.radius) * 0.25;
        f.alpha -= 0.12;

        if (f.alpha <= 0) {
          flashes.splice(i, 1);
          continue;
        }

        ctx.save();
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        grad.addColorStop(0, `rgba(255, 248, 231, ${f.alpha})`);
        grad.addColorStop(0.4, `rgba(255, 215, 0, ${f.alpha * 0.6})`);
        grad.addColorStop(1, "rgba(255, 215, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Update & Render Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();

        r.y += r.vy;

        // Rocket golden trail line
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
        ctx.lineWidth = r.isHero ? 2.5 : 1.8;
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 8;

        for (let t = 0; t < r.trail.length - 1; t++) {
          ctx.moveTo(r.trail[t].x, r.trail[t].y);
          ctx.lineTo(r.trail[t + 1].x, r.trail[t + 1].y);
        }
        ctx.stroke();

        // Glowing rocket head
        ctx.fillStyle = "#FFF8E7";
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.isHero ? 3 : 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Check if rocket reached zenith
        if (r.y <= r.targetY && !r.exploded) {
          r.exploded = true;
          createExplosion(r.x, r.y, r.color, r.isHero);
          rockets.splice(i, 1);
        }
      }

      // 3. Update & Render Explosion Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Store trail history
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.maxTrailLength) p.trail.shift();

        // Physics updates
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        // Particle Streak Trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.7;
          ctx.shadowColor = "#FFD700";
          ctx.shadowBlur = 6;
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.stroke();
        }

        // Particle Glow & Core
        const drawAlpha = p.sparkle && Math.random() < 0.3 ? p.alpha * 0.4 : p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sparkle && Math.random() < 0.2 ? p.size * 1.3 : p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      frameId = requestAnimationFrame(loop);
    };

    // Launch initial golden fireworks
    spawnRocket();
    setTimeout(spawnRocket, 350);

    loop();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{ pointerEvents: "none" }}
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-95 pointer-events-none" />
    </div>
  );
}
