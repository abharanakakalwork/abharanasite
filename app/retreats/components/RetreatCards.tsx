"use client";
import { motion } from "motion/react";
import Image from "next/image";
import {  useState, useEffect } from "react";
import Link from "next/link";

export default function RetreatCards() {
  const [retreats, setRetreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/retreats");
        const json = await res.json();
        if (json.success) setRetreats(json.data);
      } catch (err) {
        console.error("Failed to load retreats", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section id="explore-retreats" className="relative py-24 md:py-24 px-6 z-10 w-full overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-br from-[#bc6746]/10 via-transparent to-[#a55a3d]/5 blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-[#bc6746] font-bold mb-6 block">Our Sacred Journeys</span>
          <h2 className="text-5xl md:text-7xl font-serif text-[#FFFDF8] uppercase tracking-widest text-shadow-soft">
            Upcoming Immersions
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#bc6746]/50 to-transparent mx-auto mt-8" />
        </div>

        {loading ? (
            <div className="text-center py-20 text-[#bc6746] italic font-light">Tuning into rhythms...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-12 pb-32">
            {retreats.map((retreat, idx) => (
                <RetreatCard key={retreat.id} retreat={retreat} index={idx} />
            ))}
            </div>
        )}
      </div>
    </section>
  );
}

import { MapPin, Calendar, ArrowRight } from "lucide-react";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/[^\w-]+/g, "")    // Remove all non-word chars
    .replace(/--+/g, "-");      // Replace multiple - with single -
};

function RetreatCard({ retreat, index }: { retreat: any; index: number }) {  
  return (
    <Link
      href={`/retreats/${slugify(retreat.title)}`}
      className="group relative flex flex-col h-[620px] bg-[#FFFDF8] rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-[#f1e4da]/50"
    >
      {/* Image Section */}
      <div className="relative h-[55%] overflow-hidden">
        <Image 
          src={retreat.image_urls?.[0] || "/RT-bali.png"} 
          alt={retreat.title} 
          fill 
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" 
        />
        {/* Subtle overlay for better focus on content later */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700" />
        
        {/* Floating Price Tag */}
        <div className="absolute top-6 right-6 soft-glass px-4 py-2 rounded-full z-10">
          <span className="text-sm font-serif text-[#bc6746]">₹{retreat.price}</span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 p-8 flex flex-col justify-between bg-[#FFFDF8] paper-grain">
        <div>
          {/* Location & Date Metadata */}
          <div className="flex items-center gap-4 mb-4">
             <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#bc6746] font-medium">
               <MapPin size={12} strokeWidth={2.5} />
               <span>{retreat.location || "Vedic Sanctuary"}</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-[#bc6746]/30" />
             <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
               <Calendar size={12} strokeWidth={2.5} />
               <span>{new Date(retreat.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
             </div>
          </div>

          <h3 className="text-3xl md:text-3xl font-serif text-[#4a3b32] leading-tight mb-4 tracking-tight group-hover:text-[#bc6746] transition-colors duration-500">
            {retreat.title}
          </h3>
          
          <p className="text-[#4a3b32]/70 text-sm leading-relaxed line-clamp-3 font-light">
            {retreat.description}
          </p>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-6 border-t border-[#f1e4da]">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#bc6746]">Explore Journey</span>
            <div className="w-10 h-10 rounded-full border border-[#bc6746]/20 flex items-center justify-center group-hover:bg-[#bc6746] group-hover:border-[#bc6746] group-hover:text-white transition-all duration-500">
                <ArrowRight size={18} />
            </div>
        </div>
      </div>
    </Link>
  );
}


