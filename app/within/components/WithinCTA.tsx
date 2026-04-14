"use client";
import { motion } from "motion/react";
import Link from "next/link";

export default function WithinCTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden flex flex-col items-center text-center">
      {/* Terracotta gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#a55a3d] via-[#bc6746] to-transparent mix-blend-multiply opacity-45 pointer-events-none" />

      {/* Glowing orb */}
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-[28rem] md:h-[28rem] bg-[#fffdf8]/8 rounded-full blur-3xl z-0" />

      <motion.div className="relative z-10 max-w-xl">
        <p className="font-handwriting text-2xl text-[#f1e4da]/80 mb-3">
          keep going
        </p>
        <h2 className="text-4xl md:text-6xl font-serif text-[#FFFDF8] uppercase tracking-widest text-shadow-soft mb-4 leading-tight">
          Continue Your Journey
        </h2>
        <p className="text-[#f1e4da]/70 text-base font-light mb-12 leading-relaxed">
          Whether you are new to the practice or deepening an existing one,
          there is a space here for you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/retreats"
            id="within-cta-retreats"
            className="w-full sm:w-auto px-9 py-3 rounded-full bg-[#f1e4da] text-[#a55a3d] uppercase tracking-widest text-xs font-semibold hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f1e4da]/20"
          >
            Explore From Within
          </Link>
          <Link
            href="/contact"
            id="within-cta-session"
            className="w-full sm:w-auto px-9 py-3 rounded-full bg-transparent border border-[#FFFDF8] text-[#FFFDF8] uppercase tracking-widest text-xs font-semibold hover:bg-[#FFFDF8]/10 transition-all hover:-translate-y-1"
          >
            Book a Session
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
