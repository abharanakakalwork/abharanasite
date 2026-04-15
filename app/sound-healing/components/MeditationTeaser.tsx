"use client";
import { motion } from "motion/react";
import Link from "next/link";

const PREVIEW_TRACKS = [
  {
    label: "Beginner Guide to Meditation",
    intent: "Foundation",
    freq: "432Hz",
    duration: "05:00",
  },
  {
    label: "Breath Awareness",
    intent: "Presence",
    freq: "396Hz",
    duration: "10:00",
  },
  {
    label: "Yoga Nidra",
    intent: "Deep Rest",
    freq: "528Hz",
    duration: "20:00",
  },
  {
    label: "Mudra Meditation",
    intent: "Focus",
    freq: "639Hz",
    duration: "15:00",
  },
];

function MiniWave({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex items-end gap-[2px] h-4 shrink-0">
      {[3, 8, 5, 10, 6, 8, 4].map((h, i) => (
        <motion.div key={i} className="w-[2px] rounded-full bg-[#bc6746]/40" />
      ))}
    </div>
  );
}

export default function MeditationTeaser() {
  return (
    <section
      id="meditation-teaser"
      className="relative py-24 px-6 bg-[#fffdf8] overflow-hidden"
    >
      {/* Soft background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: "#bc6746", top: "-10%", right: "-5%" }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text content */}
          <motion.div>
            <span className="inline-block text-[#bc6746] font-mono text-[10px] uppercase tracking-[0.35em] mb-5 opacity-75">
              The Resonance Chamber
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#4a3b32] mb-5 leading-tight">
              Guided Meditation{" "}
              <span className="italic text-[#bc6746]">Sessions</span>
            </h2>
            <p className="text-[#4a3b32]/60 text-base leading-relaxed font-light mb-8">
              Each composition is carefully tuned to specific frequencies
              designed to shift your cellular vibration and restore inner peace.
              From beginner foundations to advanced resonance practices.
            </p>

            {/* Stats row */}
            <div className="flex gap-8 mb-10">
              {[
                { value: "6+", label: "Sessions" },
                { value: "432–639", label: "Hz Range" },
                { value: "All", label: "Skill Levels" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-serif text-[#bc6746] mb-0.5">
                    {value}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#4a3b32]/40">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href="/sound-healing/guided-meditations"
              className="group inline-flex items-center gap-4 px-8 py-4 bg-[#bc6746] text-white rounded-full text-[11px] font-mono uppercase tracking-[0.2em] hover:bg-[#a55a3d] transition-all duration-400 shadow-lg shadow-[#bc6746]/20 hover:shadow-xl hover:shadow-[#bc6746]/25 hover:-translate-y-0.5"
            >
              Explore All Sessions
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </Link>
          </motion.div>

          {/* Right — Preview track list */}
          <motion.div className="space-y-3">
            {PREVIEW_TRACKS.map((track, i) => (
              <motion.div key={track.label}>
                <Link
                  href="/sound-healing/guided-meditations"
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-[#fffdf8] border border-[#f1e4da] hover:border-[#bc6746]/30 hover:bg-[#fdf5ef] transition-all duration-300"
                >
                  {/* Play icon */}
                  <div className="w-10 h-10 rounded-full bg-[#f1e4da] flex items-center justify-center flex-shrink-0 group-hover:bg-[#bc6746] transition-colors duration-300">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="ml-0.5 text-[#bc6746] group-hover:text-white transition-colors duration-300"
                    >
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif text-[#4a3b32] truncate group-hover:text-[#bc6746] transition-colors duration-300">
                      {track.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#bc6746]/60 bg-[#f1e4da]/60 px-1.5 py-0.5 rounded-full">
                        {track.intent}
                      </span>
                      <span className="text-[9px] font-mono text-[#4a3b32]/35">
                        {track.freq}
                      </span>
                    </div>
                  </div>

                  {/* Waveform + duration */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <MiniWave delay={i * 0.3} />
                    <span className="text-[10px] font-mono text-[#4a3b32]/35">
                      {track.duration}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* "More sessions" hint */}
            <Link
              href="/sound-healing/guided-meditations"
              className="flex items-center justify-center gap-2 py-3 text-[10px] font-mono uppercase tracking-widest text-[#bc6746]/50 hover:text-[#bc6746] transition-colors duration-300"
            >
              <span>View all sessions</span>
              <svg
                width="10"
                height="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
