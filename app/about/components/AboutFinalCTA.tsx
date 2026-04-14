"use client";
import { motion } from "motion/react";

export default function AboutFinalCTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden flex flex-col items-center text-center bg-[#fffdf8] paper-grain">
      {/* Subtle Background Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#bc6746]/5 to-transparent mix-blend-multiply opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-2xl"
      >
        <p className="font-handwriting text-3xl text-[#bc6746] mb-6 opacity-80 italic">
          If you feel called
        </p>
        <h2 className="text-5xl md:text-8xl font-serif text-[#a55a3d] leading-tight tracking-tight mb-12 uppercase">
          Come <br /> 
          <span className="text-[#bc6746] italic font-light lowercase">as you are.</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16">
          <a
            href="/contact"
            id="about-cta-book"
            className="w-full sm:w-auto px-12 py-5 rounded-full bg-[#bc6746] text-[#FFFDF8] uppercase tracking-[0.2em] text-xs font-semibold hover:bg-[#a55a3d] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(188,103,70,0.25)] flex items-center justify-center"
          >
            Book a Session
          </a>
          <a
            href="/retreats"
            id="about-cta-retreats"
            className="w-full sm:w-auto px-12 py-5 rounded-full bg-transparent border border-[#bc6746]/30 text-[#bc6746] uppercase tracking-[0.2em] text-xs font-semibold hover:bg-[#bc6746]/5 transition-all hover:-translate-y-1 flex items-center justify-center"
          >
            Explore Retreats
          </a>
        </div>
      </motion.div>

      {/* Decorative pulse element */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-[#bc6746]/5 rounded-full blur-[120px] pointer-events-none z-0" 
      />
    </section>
  );
}
