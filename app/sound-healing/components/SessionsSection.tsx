"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { publicService } from "@/lib/api/public";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Bell, Calendar } from "lucide-react";

function SessionCard({
  session,
  idx,
}: {
  session: any;
  idx: number;
}) {
  
  return (
    <Link 
      href={`/sound-healing/sessions/${session.id}`}
      className={`relative group ${idx === 1 ? "md:mt-12" : ""}`}
    >
      <div
        className="absolute inset-0 -m-4 bg-[#f1e4da]/40 rounded-[60px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
      />

      <div className="relative bg-[#fffdf8] border border-[#f1e4da]/50 rounded-[48px] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(188,103,70,0.12)] flex flex-col h-full">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={session.image_url || "https://abharanakakal.b-cdn.net/assets/other-page-bg.jpeg"}
            alt={session.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <div className="mb-6">
            <span className="text-[#bc6746] text-xs font-mono tracking-[.3em] uppercase opacity-40 italic">
              Synchronized Gathering
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-serif text-[#4a3b32] mb-4 leading-tight group-hover:text-[#bc6746] transition-colors duration-500">
            {session.title}
          </h3>

          <p className="text-[#4a3b32]/60 text-sm leading-relaxed mb-6 font-light line-clamp-3 italic">
            &ldquo;{session.description}&rdquo;
          </p>

          <div className="space-y-4 mb-8 text-[11px] font-bold uppercase tracking-widest text-[#bc6746]/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#f1e4da] flex items-center justify-center bg-white">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span>{session.date || "Synchronized Timing"}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#f1e4da] flex items-center justify-center bg-white">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span>
                {session.time} • {session.duration}
              </span>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="h-[1px] w-full bg-[#f1e4da] mb-4" />
            <div className="flex gap-4">
              <div
                className="flex-1 text-center py-4 rounded-2xl bg-[#bc6746] text-[#FFFDF8] text-[10px] font-mono uppercase tracking-[.2em] group-hover:bg-[#a55a3d] transition-all transform group-hover:-translate-y-1"
              >
                View Details
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SessionsSection() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const json = await publicService.upcomingSessions.list();
        if (json.success) setSessions(json.data);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return (
    <section
      id="sh-sessions"
      className="relative py-12 pb-0 px-6 z-10 w-full bg-[#fffdf8]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-[#bc6746] font-mono text-xs uppercase tracking-[.3em] mb-4 block">
            the circle of gathering
          </span>
          <h2 className="text-5xl md:text-6xl font-serif text-[#a55a3d] mb-6">
            Upcoming Sessions
          </h2>
          <p className="max-w-2xl mx-auto text-[#4a3b32]/60 text-lg font-light">
            Intentional spaces for deep restoration, held across the peaceful
            landscapes of Bangalore and Mysore.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#bc6746] italic font-light">
            Harmonizing schedules...
          </div>
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 pb-20">
            {sessions.map((session, idx) => (
              <SessionCard
                key={session.id}
                session={session}
                idx={idx}
              />
            ))}
          </div>
        ) : (
          <ComingSoonUI />
        )}

        <div className="flex justify-center mt-20">
          <div className="h-[1px] w-[200px] bg-gradient-to-r from-transparent via-[#bc6746]/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function ComingSoonUI() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative max-w-4xl mx-auto px-6 py-20"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-[#bc6746]/10 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#a55a3d]/10 rounded-full blur-[80px]"
        />
      </div>

      <div className="relative z-10 soft-glass paper-grain rounded-[60px] p-12 md:p-20 text-center border border-[#f1e4da]/50 shadow-2xl overflow-hidden">
        {/* Animated Sound Waves/Ripples */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 2],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 1.3,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#bc6746] rounded-full"
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#bc6746]/10 mb-8 border border-[#bc6746]/20">
            <Sparkles className="text-[#bc6746] w-8 h-8 animate-pulse" />
          </div>

          <span className="block text-[#bc6746] font-mono text-xs uppercase tracking-[0.4em] mb-4">
            the gathering returns soon
          </span>

          <h3 className="text-4xl md:text-5xl font-serif text-[#4a3b32] mb-6 leading-tight">
            The Sanctuary is Resting
          </h3>

          <p className="max-w-xl mx-auto text-[#4a3b32]/70 text-lg font-light italic mb-12 leading-relaxed">
            &ldquo;New transformative sound journeys are being curated with deep
            intention. We are harmonizing frequencies for our next gathering
            across Bangalore and Mysore.&rdquo;
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link
              href="/online-classes"
              className="px-10 py-4 border border-[#bc6746]/30 text-[#bc6746] rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#bc6746]/5 transition-all flex items-center gap-3"
            >
              Explore Online Classes
            </Link>
          </div>
        </motion.div>

        {/* Decorative corner icon */}
        <div className="absolute bottom-10 right-10 opacity-10">
          <Calendar size={80} className="text-[#bc6746]" />
        </div>
      </div>
    </motion.div>
  );
}
