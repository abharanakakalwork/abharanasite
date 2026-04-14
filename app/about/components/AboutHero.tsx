"use client";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export default function AboutHero() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.1 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      style={{ position: "relative" }}
      className="min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20"
    >
      {/* Full-Bleed Misty Sanctuary Background */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5 }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/about-hero-bg.png"
          alt="Misty Sanctuary"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Soft atmospheric overlays */}
        <div className="absolute inset-0 bg-[#fffdf8]/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f1e4da]/40 to-[#fffdf8]" />
      </motion.div>

      <div
        style={{ position: "relative" }}
        className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-32"
      >
        {/* Left Side: Floating Editorial Heading */}
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="w-full md:w-1/2 flex flex-col items-start"
        >
          <div className="flex items-center gap-4 mb-6 opacity-60">
            <span className="font-handwriting text-2xl text-[#bc6746] tracking-wide">
              A journey inward
            </span>
          </div>
          <h1 className="text-7xl md:text-[10rem] font-serif text-[#a55a3d] leading-[0.85] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-[#a55a3d] to-[#bc6746]">
            About
          </h1>
          <p className="text-xl md:text-3xl font-light text-[#4a3b32] leading-relaxed max-w-lg italic opacity-80 pl-2">
            Yogasanas, somatic healing, nervous system regulation, and a return
            to original awareness.
          </p>
        </motion.div>

        {/* Right Side: Portrait with Architectural Mask */}
        <div className="w-full md:w-1/2 relative group">
          <motion.div className="relative aspect-[3/4] md:aspect-[4/5] rounded-t-[240px] rounded-br-[80px] rounded-bl-[40px] overflow-hidden shadow-[0_50px_120px_rgba(188,103,70,0.2)] z-20 border border-white/40">
            <Image
              src="/about-portrait.webp"
              alt="Portrait of Presence"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover scale-105 transition-transform duration-[6s] group-hover:scale-100"
              priority
            />
            {/* Inner soft glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#bc6746]/10 to-transparent mix-blend-soft-light" />
          </motion.div>

          {/* Breathing aura element - Pauses when off-screen */}
          {isInView && (
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-[#bc6746]/10 rounded-full blur-[120px] z-10"
            />
          )}
        </div>
      </div>

      {/* Dynamic Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
      >
        <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#bc6746]/60">
          Scroll to Explore
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-[#bc6746]/60 to-transparent" />
      </motion.div>
    </section>
  );
}


