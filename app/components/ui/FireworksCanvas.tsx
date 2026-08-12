"use client";

import React, { useEffect, useRef, useState } from "react";

interface FireworksCanvasProps {
  onComplete?: () => void;
  durationSeconds?: number;
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
  trail: { x: number; y: number }[];
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

export default function FireworksCanvas({ onComplete, durationSeconds = 3.5 }: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fadedOut, setFadedOut] = useState(false);

  useEffect(() => {
    // Check user preferred reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
      const timer = setTimeout(() => {
        setFadedOut(true);
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "#FFD700", // Gold
      "#FF4500", // Orange Red
      "#FF8C00", // Dark Orange
      "#FFA500", // Festive Orange
      "#FF2200", // Deep Crimson
      "#FFFFFF", // Pure White
      "#F0E68C", // Khaki Gold
    ];

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    // Spawn launch rockets
    const spawnRocket = (x?: number) => {
      const startX = x !== undefined ? x : Math.random() * (width * 0.8) + width * 0.1;
      const targetY = Math.random() * (height * 0.4) + height * 0.15;
      const color = colors[Math.floor(Math.random() * colors.length)];
      rockets.push({
        x: startX,
        y: height,
        targetY,
        vy: -(Math.random() * 4 + 8),
        color,
        exploded: false,
        trail: [],
      });
    };

    // Initial rockets launch
    spawnRocket(width * 0.25);
    spawnRocket(width * 0.5);
    spawnRocket(width * 0.75);

    let spawnTimer = 0;
    let animationFrameId: number;
    const startTime = Date.now();

    const explode = (x: number, y: number, color: string) => {
      const count = Math.min(width < 640 ? 45 : 90, 100);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 6 + 1.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.5 + 1.5,
          color: Math.random() > 0.3 ? color : colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          gravity: 0.06,
          trail: [],
        });
      }
    };

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Clear with dark sky trailing effect
      ctx.fillStyle = "rgba(5, 5, 12, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Periodically spawn new rockets during active duration
      if (elapsed < durationSeconds - 1) {
        spawnTimer++;
        if (spawnTimer % 25 === 0) {
          spawnRocket();
        }
      }

      // Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();

        r.y += r.vy;

        // Draw Rocket Trail
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
        ctx.lineWidth = 2;
        for (let t = 0; t < r.trail.length - 1; t++) {
          ctx.moveTo(r.trail[t].x, r.trail[t].y);
          ctx.lineTo(r.trail[t + 1].x, r.trail[t + 1].y);
        }
        ctx.stroke();

        // Draw Rocket Spark
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (r.y <= r.targetY && !r.exploded) {
          r.exploded = true;
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 4) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

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
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (elapsed < durationSeconds + 0.5) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setFadedOut(true);
        if (onComplete) onComplete();
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationSeconds, onComplete]);

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mb-4 animate-pulse">
          🎆
        </div>
        <h2 className="text-2xl font-black text-amber-400 uppercase tracking-widest">
          Order Confirmed!
        </h2>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ${
        fadedOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full block bg-slate-950/90" />
    </div>
  );
}
