"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export default function JourneySection() {
  

  return (
    <section className="relative py-24 md:py-24 px-6 overflow-hidden bg-[#fffdf8] paper-grain">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-16 md:gap-32">
        {/* Left Side: Heritage Visual Anchor */}
        <div className="w-full md:w-1/2 relative group">
          <motion.div className="relative aspect-[3/4] md:aspect-[4/5] rounded-tr-[120px] md:rounded-tr-[240px] rounded-bl-[40px] md:rounded-bl-[80px] overflow-hidden shadow-[0_40px_100px_rgba(188,103,70,0.1)] z-10 border border-white/20">
            <Image
              src="/about.webp"
              alt="Sacred Wisdom"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              className="object-cover transition-transform duration-[4s] group-hover:scale-105"
            />
            {/* Inner atmospheric wash */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#bc6746]/10 to-transparent" />
          </motion.div>

          {/* Subtle watermark behind image */}
          <div className="absolute -top-10 -left-10 text-[6rem] font-serif text-[#bc6746]/5 pointer-events-none select-none z-0">
            ROOTS
          </div>
        </div>

        {/* Right Side: Floating Editorial Narrative */}
        <div className="w-full md:w-1/2 flex flex-col items-start relative z-20 md:-ml-24">
          <div className="soft-glass p-8 md:p-16 rounded-[40px] md:rounded-[60px] shadow-2xl space-y-10 border border-white/40">
            <div className="flex items-center gap-4 mb-6 opacity-60">
              <span className="font-handwriting text-2xl text-[#bc6746] tracking-wide">
                The Path Forward
              </span>
            </div>

            <p className="text-2xl md:text-3xl font-light text-[#4a3b32] leading-relaxed">
              My journey with yoga began at the age of eight during my school
              years. I went on to compete in national and international Yogasana
              championships. Since 2017, I have been sharing this lifelong
              passion by teaching yoga.
            </p>

            <p className="text-lg md:text-xl font-light text-[#4a3b32]/80 leading-relaxed">
              Over time, the practice grew beyond the physical. It became a way
              to understand the body, the breath, and the mind more deeply. This
              path gradually led me to sound healing and holding space for
              others in a more intentional way. Today, my work is about creating
              a supportive space where people can slow down, reconnect, and
              experience their own journey inward.
            </p>

            <div className="mt-12 text-[#bc6746]/40" />

            <p className="text-xl md:text-2xl font-handwriting text-[#bc6746] opacity-80 pt-4 cursor-default hover:opacity-100 transition-opacity">
              &ldquo;The practice is not something I do, but somewhere I
              go.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
