"use client";

import { useEffect, useRef } from "react";
import type { SeasonType } from "shared";
import { PARTICLE_DENSITIES } from "./constants";

export interface SeasonalParticlesProps {
  season: SeasonType;
  density?: "light" | "normal" | "dense";
  fixed?: boolean;
  className?: string;
}

export function SeasonalParticles({
  season,
  density = "normal",
  fixed = true,
  className = "",
}: SeasonalParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;

    // Resize canvas based on whether it is fixed fullscreen or bounded in container
    const resizeCanvas = () => {
      if (fixed) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      } else {
        const parent = canvas.parentElement;
        canvas.width = parent ? parent.clientWidth : 800;
        canvas.height = parent ? parent.clientHeight : 450;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Particle Simulation Class
    class Particle {
      x = 0;
      y = 0;
      size = 0;
      speedY = 0;
      speedX = 0;
      angle = 0;
      spin = 0;
      opacity = 0;
      color = "";
      swayFrequency = 0;

      constructor() {
        this.reset(true);
      }

      reset(randomizeY = false) {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;

        if (season === "spring") {
          // Sakura Petals
          this.y = randomizeY ? Math.random() * canvas.height : -20;
          this.size = Math.random() * 6 + 4;
          this.speedY = Math.random() * 1.4 + 0.6;
          this.speedX = Math.random() * 1.8 - 0.9;
          this.angle = Math.random() * Math.PI * 2;
          this.spin = (Math.random() - 0.5) * 0.08;
          this.opacity = Math.random() * 0.3 + 0.6;
          const shades = [
            `rgba(255, 183, 197, ${this.opacity})`,
            `rgba(255, 198, 209, ${this.opacity})`,
            `rgba(254, 215, 226, ${this.opacity})`,
          ];
          this.color = shades[Math.floor(Math.random() * shades.length)];
        } else if (season === "summer") {
          // Fireflies / Summer Sun Bubbles rising
          this.y = randomizeY ? Math.random() * canvas.height : canvas.height + 20;
          this.size = Math.random() * 4 + 1.5;
          this.speedY = -(Math.random() * 1.2 + 0.4);
          this.speedX = (Math.random() - 0.5) * 0.8;
          this.angle = 0;
          this.spin = 0;
          this.swayFrequency = Math.random() * 0.05 + 0.02;
          this.opacity = Math.random() * 0.4 + 0.55;
          const summerShades = [
            `rgba(255, 235, 130, ${this.opacity})`,
            `rgba(180, 245, 255, ${this.opacity * 0.85})`,
            `rgba(254, 240, 138, ${this.opacity})`,
          ];
          this.color = summerShades[Math.floor(Math.random() * summerShades.length)];
        } else if (season === "autumn") {
          // Autumn Maple Leaves tumbling
          this.y = randomizeY ? Math.random() * canvas.height : -20;
          this.size = Math.random() * 8 + 5;
          this.speedY = Math.random() * 1.8 + 0.8;
          this.speedX = (Math.random() - 0.5) * 1.6;
          this.angle = Math.random() * Math.PI * 2;
          this.spin = (Math.random() - 0.5) * 0.12;
          this.opacity = Math.random() * 0.35 + 0.65;
          const leafColors = [
            `rgba(235, 100, 52, ${this.opacity})`,
            `rgba(219, 157, 46, ${this.opacity})`,
            `rgba(196, 55, 27, ${this.opacity})`,
            `rgba(245, 158, 11, ${this.opacity})`,
          ];
          this.color = leafColors[Math.floor(Math.random() * leafColors.length)];
        } else {
          // Winter Snowflakes
          this.y = randomizeY ? Math.random() * canvas.height : -20;
          this.size = Math.random() * 3.5 + 1.2;
          this.speedY = Math.random() * 1.6 + 0.7;
          this.speedX = (Math.random() - 0.5) * 0.6;
          this.angle = 0;
          this.spin = 0;
          this.opacity = Math.random() * 0.4 + 0.55;
          this.color = `rgba(255, 255, 255, ${this.opacity})`;
        }
      }

      update() {
        if (!canvas) return;
        this.y += this.speedY;

        if (season === "spring") {
          this.x += this.speedX + Math.sin(this.angle) * 0.8;
          this.angle += this.spin;
        } else if (season === "summer") {
          this.x += this.speedX + Math.sin(this.y * this.swayFrequency) * 0.6;
        } else if (season === "autumn") {
          this.x += this.speedX + Math.sin(this.angle) * 1.2;
          this.angle += this.spin;
        } else {
          this.x += this.speedX + Math.sin(this.y * 0.02) * 0.3;
        }

        // Loop around edges
        if (season === "summer" && this.y < -20) {
          this.reset(false);
        } else if (season !== "summer" && this.y > canvas.height + 20) {
          this.reset(false);
        }

        if (this.x > canvas.width + 25) this.x = -20;
        if (this.x < -25) this.x = canvas.width + 20;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;

        if (season === "spring") {
          // Smooth sakura petal shape
          ctx.rotate(this.angle);
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.bezierCurveTo(
            this.size * 0.7,
            -this.size * 0.6,
            this.size * 0.7,
            this.size * 0.5,
            0,
            this.size,
          );
          ctx.bezierCurveTo(
            -this.size * 0.7,
            this.size * 0.5,
            -this.size * 0.7,
            -this.size * 0.6,
            0,
            -this.size,
          );
          ctx.fill();
        } else if (season === "autumn") {
          // Maple leaf (tilted oval with pointed tip)
          ctx.rotate(this.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size * 0.45, this.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === "summer") {
          // Soft glowing orb for firefly / sun bubble
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
          // Subtle glow ring
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = this.color.replace(/[\d\.]+\)$/, "0.15)");
          ctx.fill();
        } else {
          // Soft snowflake
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Populate particles based on density configuration
    const particleCount = PARTICLE_DENSITIES[density]?.[season] ?? 60;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Main animation loop
    const renderLoop = () => {
      if (!isPaused && canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Pause animation when page tab is hidden to save resources
    const handleVisibilityChange = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [season, density, fixed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`${
        fixed ? "fixed inset-0 z-20 pointer-events-none" : "absolute inset-0 pointer-events-none z-10"
      } ${className}`}
    />
  );
}

