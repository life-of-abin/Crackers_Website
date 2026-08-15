"use client";

import React, { useEffect, useRef, useState } from "react";

export default function RocketAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animationEnded, setAnimationEnded] = useState(false);

  useEffect(() => {
    // Check user accessibility preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = Math.min(window.innerHeight, 500));

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = Math.min(window.innerHeight, 500);
    };

    window.addEventListener("resize", handleResize);

    // Rocket State
    let rocketY = height + 40;
    let rocketX = width / 2;
    const targetY = height * 0.25;
    let rocketSpeed = 9;
    let stage: "LAUNCH" | "EXPLODE" | "SPARKLES" | "DONE" = "LAUNCH";

    // Particles array for firework burst
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      size: number;
    }

    const particles: Particle[] = [];
    const colors = ["#F5C451", "#FFE29A", "#6D3FD6", "#A855F7", "#4ADE80", "#FF4D4D", "#FFFFFF"];

    const createExplosion = (cx: number, cy: number) => {
      const particleCount = width < 640 ? 45 : 90; // Reduced on mobile
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 3 + 2,
        });
      }
    };

    let startTime = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const elapsed = Date.now() - startTime;

      if (stage === "LAUNCH") {
        rocketY -= rocketSpeed;
        rocketSpeed += 0.15; // Acceleration

        // Draw Rocket Trails (Sparks)
        ctx.fillStyle = "#F5C451";
        ctx.beginPath();
        ctx.arc(rocketX + (Math.random() - 0.5) * 4, rocketY + 20, Math.random() * 3 + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FF6B00";
        ctx.beginPath();
        ctx.arc(rocketX + (Math.random() - 0.5) * 6, rocketY + 28, Math.random() * 4 + 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw Rocket Icon / Body
        ctx.save();
        ctx.translate(rocketX, rocketY);
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🚀", 0, 0);
        ctx.restore();

        if (rocketY <= targetY) {
          stage = "EXPLODE";
          createExplosion(rocketX, rocketY);
        }
      } else if (stage === "EXPLODE" || stage === "SPARKLES") {
        let activeParticles = 0;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.alpha <= 0) continue;
          activeParticles++;

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // Gravity
          p.vx *= 0.98; // Drag
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (activeParticles === 0 || elapsed > 6000) {
          stage = "DONE";
          setAnimationEnded(true);
        }
      }

      if (stage !== "DONE") {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (reducedMotion) {
    return (
      <div className="w-full py-4 flex justify-center items-center">
        <div className="text-5xl animate-pulse">🚀✨</div>
      </div>
    );
  }

  return (
    <div className="w-full relative h-48 sm:h-64 overflow-hidden pointer-events-none z-10 flex justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
