"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      <div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <h1 className="text-5xl md:text-7xl font-serif text-[#FFFDF8] uppercase tracking-widest text-shadow-soft mb-6">
          Yoga & Feminine <br className="hidden md:block" /> Awakening: From Within
        </h1>
        <p className="text-lg md:text-2xl text-[#f1e4da] font-light max-w-2xl mx-auto mb-10 drop-shadow-md">
          Immersive experiences across India, Sri Lanka & Nepal
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="#explore-retreats"
            onClick={() =>
              document
                .getElementById("explore-retreats")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3 rounded-full bg-[#bc6746] text-[#FFFDF8] uppercase tracking-widest text-sm font-medium hover:-translate-y-1 transition-transform shadow-[0_4px_15px_rgba(188,103,70,0.4)]"
          >
            Explore Immersions
          </Link>
        </div>
      </div>

      {/* Floating Particles Simulation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted &&
          [...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#fffdf8]/30 blur-sm"
              style={{
                width: Math.random() * 30 + 10 + "px",
                height: Math.random() * 30 + 10 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
             
            />
          ))}
      </div>
    </section>
  );
}
