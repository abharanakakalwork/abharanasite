"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Music,
  Star,
  Wind,
  Check,
} from "lucide-react";
import { publicService } from "@/lib/api/public";
import SessionBookingFlow from "../../components/SessionBookingFlow";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { motion } from "framer-motion";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await publicService.upcomingSessions.get(id);
        if (res.success) {
          setSession(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load session details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#bc6746] italic font-light animate-pulse">
          Tuning frequencies...
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-serif text-[#f1e4da] mb-6">
          Gathering Not Found
        </h1>
        <p className="text-[#bc6746]/60 mb-8 max-w-md italic">
          {error ||
            "This specific gathering might have reached capacity or moved to another dimension."}
        </p>
        <Link
          href="/sound-healing"
          className="px-8 py-3 rounded-full bg-[#bc6746] text-white uppercase tracking-widest text-xs font-bold"
        >
          Back to Sessions
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] paper-grain selection:bg-[#bc6746]/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <motion.div className="absolute inset-0 z-0">
          <Image
            src={session.image_url || "/other-page-bg.jpeg"}
            alt={session.title}
            fill
            priority
            className="object-cover"
          />
        </motion.div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#4a3b32]/90 via-[#4a3b32]/40 to-black/20 z-10" />
        <div className="absolute inset-0 bg-black/30 z-10" />

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-24">
          <motion.div className="max-w-4xl">
            <Link
              href="/sound-healing"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#f1e4da] mb-8 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
              Back to Offerings
            </Link>

            <span className="font-handwriting text-3xl md:text-5xl text-[#bc6746] mb-4 block leading-none">
              Upcoming Gathering
            </span>
            <h1 className="text-6xl md:text-8xl font-serif text-[#FFFDF8] uppercase tracking-widest leading-[0.9] text-shadow-soft mb-8">
              {session.title}
            </h1>

            <div className="flex flex-wrap items-center gap-10">
              <div className="flex items-center gap-3 text-white/80">
                <Calendar className="w-5 h-5 text-[#bc6746]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                  {session.date || "Synchronized Timing"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Clock className="w-5 h-5 text-[#bc6746]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                  {session.time} ({session.duration})
                </span>
              </div>
              {session.location && (
                <div className="flex items-center gap-3 text-white/80">
                  <MapPin className="w-5 h-5 text-[#bc6746]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                    {session.location}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-[#bc6746]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">
                  Session Narrative
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-serif text-[#4a3b32] italic leading-relaxed">
                &quot;{session.description}&quot;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                  <Music className="w-5 h-5" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">
                  Frequency
                </h4>
                <p className="text-xs text-[#a55a3d]/70 leading-relaxed font-light">
                  Layered orchestral textures designed for deep neurological
                  restoration.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                  <Wind className="w-5 h-5" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">
                  Breath
                </h4>
                <p className="text-xs text-[#a55a3d]/70 leading-relaxed font-light">
                  Guided somatic breathing to prepare the vessel for sound
                  integration.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                  <Star className="w-5 h-5" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">
                  Integration
                </h4>
                <p className="text-xs text-[#a55a3d]/70 leading-relaxed font-light">
                  Post-session stillness to ground the experience into daily
                  awareness.
                </p>
              </div>
            </div>

            <div className="p-10 md:p-14 bg-white shadow-xl rounded-[60px] border border-[#f1e4da] space-y-10">
              <h3 className="text-3xl font-serif text-[#4a3b32] uppercase italic">
                The Experience Flow
              </h3>
              <ul className="space-y-6">
                {[
                  "Arrival & Grounding into the sanctuary energy",
                  "Opening Ritual and Intention Setting Circle",
                  "90-minute Immersive Sound Journey",
                  "Silent Integration and Somatic Rest",
                  "Closing Frequency & Light Nourishment",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-6 group">
                    <div className="mt-1 w-5 h-5 rounded-full border border-[#bc6746]/20 flex items-center justify-center shrink-0 group-hover:bg-[#bc6746] group-hover:border-[#bc6746] transition-all">
                      <Check className="w-3 h-3 text-[#bc6746] group-hover:text-white" />
                    </div>
                    <span className="text-lg text-[#4a3b32]/80 font-light italic">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Side: Sticky Info Card */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className="sticky top-32 p-10 md:p-14 bg-[#4a3b32] text-white rounded-[70px] shadow-3xl space-y-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">
                  Open Enrollment
                </span>
                <h3 className="text-4xl font-serif tracking-tighter italic uppercase leading-tight">
                  Gather in Resonance
                </h3>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center py-6 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Energy Exchange
                  </span>
                  <span className="text-4xl font-serif font-black text-[#bc6746] tracking-tighter italic leading-none">
                    ₹{session.price?.toLocaleString()}
                  </span>
                </div>
                <p className="text-[#f1e4da]/70 font-light italic text-sm leading-relaxed">
                  A focused gathering designed for a maximum resonance. Spaces
                  are limited to preserve the sanctity and personalized
                  frequency of the sanctuary.
                </p>
              </div>

              <button
                onClick={() => {
                  document
                    .getElementById("booking-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-7 bg-[#bc6746] text-white rounded-full font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-[#a55a3d] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Reserve Your Seat
              </button>

              <div className="flex items-center gap-4 justify-center py-4 opacity-40">
                <Sparkles className="w-4 h-4 text-[#bc6746]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">
                  Sanctuary Direct Access
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Booking Section */}
      <section className="py-24 px-6 relative bg-[#f1e4da]/10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#bc6746]/20 to-transparent" />
        <SessionBookingFlow itemData={session} />
      </section>

      <Footer />
    </main>
  );
}
