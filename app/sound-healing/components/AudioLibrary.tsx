"use client";
import { motion, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

// Tracks are now fetched from the backend API

function FluidWaveform({
  playing,
  color,
}: {
  playing: boolean;
  color: string;
}) {
  const bars = [4, 12, 8, 18, 10, 15, 6, 11, 4];
  return (
    <div
      className="flex items-center gap-1 h-12"
      style={{ willChange: "transform" }}
    >
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          initial={{ height: 4, opacity: 0.3 }}
          animate={{
            height: playing ? [h * 0.4, h, h * 0.6, h * 1.2, h * 0.4] : 4,
            opacity: playing ? 1 : 0.3,
            backgroundColor: playing ? color : "#c8a99a",
          }}
          transition={{
            duration: playing ? 0.8 + i * 0.1 : 0.4,
            repeat: playing ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{ willChange: "height, opacity" }}
        />
      ))}
    </div>
  );
}

export default function AudioLibrary() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch("/api/sound-healing");
        const json = await res.json();
        if (json.success) setTracks(json.data);
      } catch (err) {
        console.error("Failed to fetch meditations", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  const updateProgress = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      const p = (audio.currentTime / audio.duration) * 100;
      setProgress((prev) => ({ ...prev, [id]: isNaN(p) ? 0 : p }));
    }
  };

  const { pauseBgAudio } = useAudio();

  const toggle = (id: string, src: string) => {
    if (playing === id) {
      audioRefs.current[id]?.pause();
      setPlaying(null);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else {
      // Pause background music
      pauseBgAudio();

      // Pause others
      Object.entries(audioRefs.current).forEach(([k, a]) => {
        if (k !== id) a?.pause();
      });
      if (progressInterval.current) clearInterval(progressInterval.current);

      if (!audioRefs.current[id]) {
        audioRefs.current[id] = new Audio(src);
        audioRefs.current[id]!.addEventListener("ended", () => {
          setPlaying(null);
          if (progressInterval.current) clearInterval(progressInterval.current);
        });
      }

      audioRefs.current[id]!.play();
      setPlaying(id);
      progressInterval.current = setInterval(() => updateProgress(id), 500);
    }
  };

  useEffect(() => {
    return () => {
      // We keep meditation pausing on unmount for now as requested/clarified by user focusing on Navbar
      Object.values(audioRefs.current).forEach((a) => a?.pause());
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  return (
    <section
      id="sh-audio"
      className="relative py-24 px-6 flex flex-col items-center overflow-hidden bg-[#fffdf8]"
    >
      {/* Optimized High-Performance Background Gradients */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
        style={{ willChange: "transform" }}
      >
        {/* Performance-friendly Radial Gradients instead of Blur filters */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background: `
              radial-gradient(circle at 10% 20%, #bc6746 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, #e2b9a7 0%, transparent 45%)
            `,
          }}
        />

        {/* Simplified Particle System (limited to 4 particles with simpler animations) */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 0.15, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut",
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#bc6746]"
            style={{
              left: `${20 + i * 20}%`,
              top: `${15 + (i % 2) * 40}%`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          className="text-center mb-24"
        >
          <span className="inline-block text-[#bc6746] font-mono text-xs uppercase tracking-widest mb-4">
            the resonance chamber
          </span>
          <h2 className="text-5xl md:text-6xl font-serif text-[#a55a3d] mb-6">
            Guided Meditation Sessions{" "}
          </h2>
          <p className="max-w-2xl mx-auto text-[#4a3b32]/80 text-lg leading-relaxed font-light">
            Each composition is carefully tuned to specific frequencies designed
            to shift your cellular vibration and restore inner peace.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#bc6746]/40 to-transparent" />
          </div>
        </motion.div>

        {/* Asymmetrical/Grid remains the same layout for consistency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-0">
          {loading ? (
            <div className="col-span-full text-center py-20 text-[#bc6746] font-light italic">
              Tuning frequencies into existence...
            </div>
          ) : tracks.length > 0 ? (
            tracks.map((track, idx) => {
              const isPlaying = playing === track.id;
              const currentProgress = progress[track.id] || 0;
              const radius = 28;
              const circumference = 2 * Math.PI * radius;
              const offset =
                circumference - (currentProgress / 100) * circumference;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`relative group ${idx % 2 === 1 ? "md:mt-16" : ""}`}
                >
                  {/* Breathing Aura Glow - Optimized Performance */}
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{
                          scale: [1, 1.03, 1],
                          opacity: 0.12,
                        }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-4 rounded-[60px] pointer-events-none"
                        style={{
                          backgroundColor: track.color,
                          filter: "blur(40px)", // Reduced blur for performance
                          willChange: "transform, opacity",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <div
                    onClick={() => toggle(track.id, track.audio_url)}
                    className={`relative cursor-pointer bg-[#fffdf8] border border-[#f1e4da]/60 p-8 md:p-10 rounded-[48px] transition-all duration-700 overflow-hidden hover:shadow-[0_20px_40px_-10px_rgba(188,103,70,0.1)] hover:border-[#bc6746]/20 ${isPlaying ? "shadow-[0_30px_60px_-15px_rgba(188,103,70,0.15)] border-[#bc6746]/30 -translate-y-2" : ""}`}
                    style={{ willChange: "transform, box-shadow" }}
                  >
                    {/* Subtle Texture Overlay */}
                    <div className="absolute inset-0 paper-grain pointer-events-none opacity-[0.3]" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#f1e4da]/60 text-[#bc6746] text-[10px] font-mono tracking-wider uppercase">
                            {track.intent}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#a55a3d]/10 text-[#a55a3d] text-[10px] font-mono tracking-wider uppercase">
                            {track.frequency}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#4a3b32]/40 tracking-widest">
                          {track.duration}
                        </span>
                      </div>

                      <div className="flex items-end gap-6 mb-8">
                        {/* Circular Play Button with Progress - Simplified animation */}
                        <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
                          <svg
                            className="absolute w-full h-full -rotate-90 pointer-events-none"
                            viewBox="0 0 64 64"
                          >
                            <circle
                              cx="32"
                              cy="32"
                              r={radius}
                              fill="none"
                              stroke="#f1e4da"
                              strokeWidth="1.5"
                            />
                            <motion.circle
                              cx="32"
                              cy="32"
                              r={radius}
                              fill="none"
                              stroke="#bc6746"
                              strokeWidth="1.5"
                              strokeDasharray={circumference}
                              animate={{ strokeDashoffset: offset }}
                              transition={{ duration: 0.6, ease: "linear" }}
                            />
                          </svg>
                          <button
                            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-md transform group-hover:scale-105 active:scale-95"
                            style={{
                              background: isPlaying ? "#bc6746" : "#f1e4da",
                              color: isPlaying ? "#fffdf8" : "#bc6746",
                              willChange: "transform",
                            }}
                          >
                            {isPlaying ? (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <rect
                                  x="6"
                                  y="4"
                                  width="4"
                                  height="16"
                                  rx="2"
                                />
                                <rect
                                  x="14"
                                  y="4"
                                  width="4"
                                  height="16"
                                  rx="2"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="ml-1"
                              >
                                <path d="M5 3l14 9-14 9V3z" />
                              </svg>
                            )}
                          </button>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl md:text-3xl font-serif text-[#4a3b32] mb-1 leading-tight">
                            {track.title}
                          </h3>
                          <p className="font-handwriting text-[#bc6746]/80 text-xl italic leading-none">
                            resonate with your essence
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-[#4a3b32]/60 text-sm md:text-base leading-relaxed font-light italic border-l-2 border-[#bc6746]/20 pl-5 py-1">
                          &ldquo;{track.description}&rdquo;
                        </p>
                        <FluidWaveform
                          playing={isPlaying}
                          color={track.color}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 text-[#bc6746]/50 font-light italic">
              The sanctuary is silent for a moment. Please check back gently.
            </div>
          )}
        </div>
      </div>

      {/* Global Fixed Player UI - High Performance */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-lg bg-[#4a3b32]/95 backdrop-blur-md border border-[#fffdf8]/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4"
            style={{ willChange: "transform, opacity" }}
          >
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: tracks.find((t) => t.id === playing)?.color,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-2 h-2 rounded-full bg-white/40"
                style={{ willChange: "transform" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-medium truncate">
                Now Playing: {tracks.find((t) => t.id === playing)?.title}
              </h4>
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-tighter">
                Frequence: {tracks.find((t) => t.id === playing)?.frequency} •{" "}
                {tracks.find((t) => t.id === playing)?.intent}
              </p>
            </div>
            <button
              onClick={() => toggle(playing, "")}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Pause"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
