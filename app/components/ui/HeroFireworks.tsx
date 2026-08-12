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
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number }[];
}

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

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          width = canvas.width = entry.contentRect.width;
          height = canvas.height = entry.contentRect.height;
        }
      }
    });
    resizeObserver.observe(container);

    const colors = [
      "#F59E0B", // Amber Gold
      "#E11D48", // Crimson Rose
      "#EA580C", // Firework Orange
      "#FBBF24", // Vibrant Yellow Gold
      "#FFFFFF", // Pure White Sparkle
      "#38BDF8", // Cyan Flare Accent
      "#A855F7", // Sparkling Purple
    ];

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    const spawnRocket = () => {
      const startX = Math.random() * (width * 0.85) + width * 0.075;
      const targetY = Math.random() * (height * 0.45) + height * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      rockets.push({
        x: startX,
        y: height + 10,
        targetY,
        vy: -(Math.random() * 3.5 + 6.5),
        color,
        exploded: false,
        trail: [],
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = width < 640 ? 35 : 65;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 4.5 + 1.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1.2,
          color: Math.random() > 0.25 ? color : colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          gravity: 0.04,
        });
      }
    };

    let frameId: number;
    let tick = 0;

    const loop = () => {
      tick++;

      // Clear canvas with transparent clear to maintain Hero gradient visibility
      ctx.clearRect(0, 0, width, height);

      // Periodically spawn new rockets
      if (tick % 45 === 0 && rockets.length < 4) {
        spawnRocket();
      }

      // Update & render rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 6) r.trail.shift();

        r.y += r.vy;

        // Draw trail spark
        ctx.beginPath();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1.5;
        for (let t = 0; t < r.trail.length - 1; t++) {
          ctx.moveTo(r.trail[t].x, r.trail[t].y);
          ctx.lineTo(r.trail[t + 1].x, r.trail[t + 1].y);
        }
        ctx.stroke();

        // Draw rocket head
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();

        if (r.y <= r.targetY && !r.exploded) {
          r.exploded = true;
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      frameId = requestAnimationFrame(loop);
    };

    // Initial launch bursts
    spawnRocket();
    setTimeout(spawnRocket, 400);

    loop();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
    </div>
  );
}
