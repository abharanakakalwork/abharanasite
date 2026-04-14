"use client";
import { motion } from "motion/react";

export default function WithinHero() {
  return (
    <section className="relative pt-40 pb-20 px-6 mb-10 text-center">
      {/* Very subtle tint layer */}
      <div className="absolute inset-0 bg-[#f1e4da]/30 pointer-events-none" />

      <motion.div className="relative z-10 max-w-2xl mx-auto">
        <p className="font-handwriting text-2xl text-[#bc6746] mb-3 opacity-80">
          words from within
        </p>
        <h1 className="text-5xl md:text-7xl font-serif text-[#FFFDF8] uppercase tracking-widest text-shadow-soft mb-6 leading-tight">
          Within
        </h1>
        <p className="text-base md:text-lg text-[#f1e4da]/90 font-light leading-relaxed max-w-lg mx-auto">
          Reflections on yoga, feminine awareness, and inner presence
        </p>
      </motion.div>
    </section>
  );
}
