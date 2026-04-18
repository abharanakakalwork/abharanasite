"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { yogaService } from "@/lib/api/client";
import { Offering } from "./flow/types";
import { Loader2, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MonthlyMembershipCardProps {
  offering: Offering;
  onBook: (offering: Offering, mode: "monthly") => void;
  index: number;
}

function MonthlyMembershipCard({ offering, onBook, index }: MonthlyMembershipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = offering.description?.length > 120;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group relative bg-[#fffdfa] rounded-[32px] overflow-hidden border border-[#e8d5c5] shadow-[0_8px_30px_rgba(74,59,50,0.04)] hover:shadow-[0_24px_60px_rgba(188,103,70,0.12)] transition-all duration-700 h-full flex flex-col"
    >
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#bc6746]/5 rounded-full blur-3xl -tranislate-y-1/2 translate-x-1/2" />
      
      {/* Badge */}
      <div className="absolute top-5 right-5 z-20">
         <div className="bg-[#bc6746] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-lg shadow-[#bc6746]/20 flex items-center gap-2">
            <Sparkles size={10} />
            Monthly Pass
         </div>
      </div>

      {/* Image / Header */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={offering.image_url || "https://abharanakakal.b-cdn.net/assets/exp-yoga.png"}
          alt={offering.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fffdfa] via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-7 pt-4 flex-1 flex flex-col">
        <div className="space-y-1.5 mb-6">
          <h3 className="text-2xl font-serif font-black text-[#2d2420] italic tracking-tight leading-none group-hover:text-[#bc6746] transition-colors duration-300">
            {offering.title}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#bc6746]/60">Unlimited Access</p>
        </div>

        <div className="relative flex-1 mb-8">
          <p className={`text-[13px] text-[#7a6a62] font-serif leading-relaxed italic transition-all duration-300 ${!isExpanded ? "line-clamp-3" : ""}`}>
            {offering.description}
          </p>
          {isLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#bc6746] text-[10px] font-bold mt-2 uppercase tracking-widest hover:underline"
            >
              {isExpanded ? "See Less" : "See More Description"}
            </button>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-10">
          {[
            "All scheduled live sessions",
            "Recording access for 30 days",
            "Priority support & community",
            "Flexible monthly renewal"
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-[#4a3b32]">
              <div className="w-5 h-5 rounded-full bg-[#f1e4da] flex items-center justify-center shrink-0">
                <Check size={12} className="text-[#bc6746]" />
              </div>
              <span className="text-[12px] font-medium tracking-tight">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#f1e4da] pt-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/40 mb-1">Total Exchange</p>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-serif font-black text-[#bc6746]">₹{offering.monthly_price}</span>
               <span className="text-[11px] text-[#a55a3d]/50 font-serif lowercase italic">/mo</span>
            </div>
          </div>

          <button
            onClick={() => onBook(offering, "monthly")}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#bc6746] hover:bg-[#2d2420] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#bc6746]/20 active:scale-95"
          >
            Join Membership
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MonthlyFetcher({ 
  onBook 
}: { 
  onBook: (offering: Offering, mode: "single" | "monthly") => void 
}) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await yogaService.offerings.list();
        // Filter for offerings that have a monthly price
        const monthlyOnes = res.data.data.filter((off: Offering) => off.monthly_price && off.monthly_price > 0);
        setOfferings(monthlyOnes);
      } catch (err) {
        console.error("Failed to fetch monthly offerings", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-24 text-[#bc6746]">
        <Loader2 className="animate-spin h-8 w-8 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Fetching Memberships...</p>
     </div>
  );

  if (offerings.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -left-20 top-40 w-[600px] h-[600px] bg-[#bc6746]/3 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-[#bc6746]"
          >
            <ShieldCheck size={14} strokeWidth={3} />
            Member Access
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-black text-[#4a3b32] italic tracking-tight"
          >
            Monthly Memberships
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-[15px] text-[#7a6a62]/80 font-serif italic"
          >
            Deepen your practice with consistent, unlimited access to our live sessions. Select a membership pass to begin your monthly sanctuary journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offerings.map((offering, idx) => (
            <MonthlyMembershipCard 
              key={offering.id} 
              offering={offering} 
              onBook={(off) => onBook(off, "monthly")}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
