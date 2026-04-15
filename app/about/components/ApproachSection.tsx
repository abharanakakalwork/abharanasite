"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export default function ApproachSection() {
  const containerRef = useRef(null);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-32 md:py-0 flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Full-Bleed Macro Background */}
      <motion.div  className="absolute inset-0 z-0">
        <Image
          src="https://abharanakakal.b-cdn.net/assets/about-approach-macro.png"
          alt="Macro Stillness"
          fill
          className="object-cover opacity-60 md:opacity-80"
          priority
        />
        {/* Deep atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a3b32]/40 via-transparent to-[#4a3b32]/60" />
      </motion.div>

      <div className="max-w-7xl mx-auto w-full relative z-10 px-6 flex justify-center">
        <div className="soft-glass p-10 md:p-24 rounded-[60px] md:rounded-[100px] border border-white/20 shadow-2xl max-w-4xl text-center backdrop-blur-xl">
          <span className="text-[#FFFDF8] font-mono text-md uppercase tracking-[0.5em] mb-8 block">
            the philosophy of listening
          </span>

          <h2 className="text-5xl md:text-8xl font-serif text-[#FFFDF8] leading-none tracking-tighter mb-12">
            My <br />
            <span className="text-[#FFFDF8] italic font-light">Approach</span>
          </h2>

          <p className="text-2xl md:text-4xl font-light text-[#FFFDF8]/90 leading-relaxed italic mb-12">
            &ldquo;We don’t create stillness; we simply remove the obstacles
            that keep it from being here.&rdquo;
          </p>

          <p className="text-lg md:text-2xl font-light text-[#FFFDF8]/70 leading-relaxed max-w-2xl mx-auto">
            My practice is rooted in the belief that everything we need is
            already here. Through yoga and sound, we learn to slow down, listen
            inward, and re-establish a connection with the deep, quiet awareness
            that exists beneath our daily rhythms.
          </p>
        </div>
      </div>

      {/* Side Watermark */}
      <div
        style={{ opacity: 0.05 }}
        className="absolute top-1/2 right-0 -translate-y-1/2 text-[15rem] md:text-[30rem] font-serif text-white leading-none pointer-events-none select-none z-0 rotate-90 translate-x-[25%]"
      >
        STILLNESS
      </div>
    </section>
  );
}

