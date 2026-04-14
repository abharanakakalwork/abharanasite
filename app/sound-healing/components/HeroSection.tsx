"use client";
import { useEffect, useState, useRef } from "react";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let ripples: { x: number; y: number; r: number; alpha: number }[] = [];

    const addRipple = () => {
      ripples.push({ x: Math.random() * width, y: Math.random() * height, r: 0, alpha: 0.18 });
    };

    const interval = setInterval(addRipple, 2000);
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 1.4;
        rp.alpha -= 0.0007;
        if (rp.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,253,248,${rp.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);
    
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Canvas ripple layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />

      <div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <p className="font-handwriting text-2xl text-[#f1e4da] mb-4 opacity-80">
          a space to return inward
        </p>
        <h1 className="text-5xl md:text-7xl font-serif text-[#FFFDF8] uppercase tracking-widest text-shadow-soft mb-6 leading-tight">
          Sound Healing &amp; <br className="hidden md:block" />
          Guided Meditation
        </h1>
        <p className="text-lg md:text-2xl text-[#f1e4da] font-light max-w-2xl mx-auto mb-10 drop-shadow-md">
          Slow down. Listen. Return to yourself.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="#sh-audio"
            id="sh-cta-listen"
            className="px-8 py-3 rounded-full bg-[#bc6746] text-[#FFFDF8] uppercase tracking-widest text-sm font-medium hover:-translate-y-1 transition-transform shadow-[0_4px_15px_rgba(188,103,70,0.4)]"
          >
            Listen
          </a>
          <a
            href="#sh-sessions"
            id="sh-cta-book"
            className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-[#FFFDF8] uppercase tracking-widest text-sm font-medium hover:-translate-y-1 transition-transform shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
          >
            Book Session
          </a>
        </div>
      </div>

      {/* Floating particles — same as retreats hero */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && [...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#fffdf8]/20"
            style={{
              width: Math.random() * 30 + 10 + "px",
              height: Math.random() * 30 + 10 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </section>
  );
}

