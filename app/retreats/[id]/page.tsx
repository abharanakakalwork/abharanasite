"use client";
// Force recompile to fix routing cache

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, MapPin, Sparkles, Map, Heart, Compass, Check } from "lucide-react";
import { publicService } from "@/lib/api/public";
import ImmersionBookingFlow from "../components/ImmersionBookingFlow";
import GallerySection from "../components/GallerySection";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { motion } from "framer-motion";

export default function ImmersionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [retreat, setRetreat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await publicService.retreats.get(id);
        if (res.success) {
          setRetreat(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load immersion details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#bc6746] italic font-light animate-pulse">Tuning into rhythms...</div>
      </div>
    );
  }

  if (error || !retreat) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-serif text-[#f1e4da] mb-6">Experience Not Found</h1>
        <p className="text-[#bc6746]/60 mb-8 max-w-md italic">{error || "This specific immersion might have concluded or moved to the archives."}</p>
        <Link href="/retreats" className="px-8 py-3 rounded-full bg-[#bc6746] text-white uppercase tracking-widest text-xs font-bold">
          Back to Immersions
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] paper-grain selection:bg-[#bc6746]/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <motion.div 
            className="absolute inset-0 z-0"
        >
          <Image
            src={retreat.image_urls?.[0] || "https://abharanakakal.b-cdn.net/assets/rt-bali.png"}
            alt={retreat.title}
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#4a3b32]/90 via-[#4a3b32]/40 to-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10" />

        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-24">
          <motion.div
           
            className="max-w-4xl"
          >
            <Link 
                href="/retreats" 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#f1e4da] mb-8 hover:text-white transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Explorations
            </Link>
            
            <span className="font-handwriting text-3xl md:text-5xl text-[#bc6746] mb-4 block leading-none">
              {retreat.location || "Sanctuary Venue"}
            </span>
            <h1 className="text-6xl md:text-8xl font-serif text-[#FFFDF8] uppercase tracking-widest leading-[0.9] text-shadow-soft mb-8">
                {retreat.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-3 text-white/80">
                    <Calendar className="w-5 h-5 text-[#bc6746]" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">{new Date(retreat.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                    <MapPin className="w-5 h-5 text-[#bc6746]" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">{retreat.location || "Secret Sanctuary"}</span>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details & Description Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-16">
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-[1px] bg-[#bc6746]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Immersion Narrative</span>
                    </div>
                    <p className="text-3xl md:text-4xl font-serif text-[#4a3b32] italic leading-relaxed">
                        &quot;{retreat.description}&quot;
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                        <div className="w-10 h-10 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                            <Compass className="w-5 h-5" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">The Journey</h4>
                        <p className="text-xs text-[#a55a3d]/70 leading-relaxed font-light">Self-led discovery curated to your unique biology and essence.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-10 h-10 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                            <Heart className="w-5 h-5" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">The Vessel</h4>
                        <p className="text-xs text-[#a55a3d]/70 leading-relaxed font-light">Somatic awakening focused on restorative medicine and deep rest.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-10 h-10 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                            <Map className="w-5 h-5" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">The Mapping</h4>
                        <p className="text-xs text-[#a55a3d]/70 leading-relaxed font-light">Guided integration sessions to carry the frequency back home.</p>
                    </div>
                </div>

                <div className="p-10 md:p-14 bg-white shadow-xl rounded-[60px] border border-[#f1e4da] space-y-10">
                    <h3 className="text-3xl font-serif text-[#4a3b32] uppercase italic">Included in the Sanctuary</h3>
                    <ul className="space-y-6">
                        {[
                            "Luxe accommodation in high-vibration locales",
                            "Daily Ayurvedic-inspired rhythmic nourishment",
                            "Sound healing journeys & somatic release workshops",
                            "One-on-one personal guidance sessions",
                            "Sacred circles & ancestral feminine awakening rituals"
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-6 group">
                                <div className="mt-1 w-5 h-5 rounded-full border border-[#bc6746]/20 flex items-center justify-center shrink-0 group-hover:bg-[#bc6746] group-hover:border-[#bc6746] transition-all">
                                    <Check className="w-3 h-3 text-[#bc6746] group-hover:text-white" />
                                </div>
                                <span className="text-lg text-[#4a3b32]/80 font-light italic">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Side: Sticky Info Card */}
            <div className="lg:col-span-5">
                <div className="sticky top-32 p-10 md:p-14 bg-[#4a3b32] text-white rounded-[70px] shadow-3xl space-y-12 overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
                    
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Available Spot</span>
                        <h3 className="text-4xl font-serif tracking-tighter italic uppercase leading-tight">Secure Your Presence</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="flex justify-between items-center py-6 border-b border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Immersion Fee</span>
                            <span className="text-4xl font-serif font-black text-[#bc6746] tracking-tighter italic leading-none">₹{retreat.price.toLocaleString()}</span>
                        </div>
                        <p className="text-[#f1e4da]/70 font-light italic text-sm leading-relaxed">
                            This immersive experience is limited to only 8 participants to ensure deep personal somatic exploration and collective resonance.
                        </p>
                    </div>

                    <button 
                         onClick={() => {
                            document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                         }}
                         className="w-full py-7 bg-[#bc6746] text-white rounded-full font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-[#a55a3d] transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        Reserve Your Spot
                    </button>

                    <div className="flex items-center gap-4 justify-center py-4 opacity-40">
                         <Sparkles className="w-4 h-4 text-[#bc6746]" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">Sacred Space Commitment</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection images={retreat.gallery || []} />

      {/* Embedded Booking Section */}
      <section id="booking-section" className="py-24 px-6 relative">
          {/* Subtle background markings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-[#bc6746]/5 pointer-events-none" />
          
          <ImmersionBookingFlow itemData={retreat} />
      </section>

      <Footer />
    </main>
  );
}
