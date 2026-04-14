"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Clock, IndianRupee, ArrowRight } from "lucide-react";
import { Offering } from "./flow/types";
import { cn } from "@/lib/utils";

const imageMap: Record<string, string> = {
  "Hatha": "/exp-yoga.png",
  "Vinyasa": "/exp-yoga.png",
  "Breathwork": "/exp-breathwork.png",
  "Sound": "/exp-sound.png",
  "Meditation": "/sh-guided.webp",
  "Deep": "/sh-intro-vessels.png",
  "Sacred": "/exp-nature.png",
  "Yin": "/about-journey-mood.png",
};

interface OnlineClassCardProps {
  offering: Offering;
  onBook: (offering: Offering) => void;
  index: number;
}

export default function OnlineClassCard({ offering, onBook, index }: OnlineClassCardProps) {
  // Use uploaded image, or mapping, or fallback to a general yoga image
  const imageSrc = offering.image_url || Object.entries(imageMap).find(([key]) => offering.title.includes(key))?.[1] || "/exp-yoga.png";

  return (
    <motion.div
      
      className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-[#f1e4da]/50 flex flex-col h-[520px]"
    >
      {/* Image Section */}
      <div className="relative h-[45%] overflow-hidden">
        <Image
          src={imageSrc}
          alt={offering.title}
          fill
          className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:bg-transparent transition-colors duration-700" />
        
        {/* Floating Duration Tag */}
        <div className="absolute bottom-4 left-6 soft-glass px-4 py-1.5 rounded-full flex items-center gap-2">
            <Clock size={12} className="text-[#bc6746]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]">{offering.duration}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-8 flex flex-col justify-between bg-[#FFFDF8] paper-grain">
        <div>
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-2xl md:text-3xl font-serif text-[#4a3b32] leading-tight tracking-tight group-hover:text-[#bc6746] transition-colors duration-500">
               {offering.title}
             </h3>
             <div className="flex items-center text-[#bc6746] font-serif text-xl">
                <IndianRupee size={16} strokeWidth={3} className="mr-0.5" />
                <span>{offering.single_price}</span>
             </div>
          </div>
          
          <p className="text-[#4a3b32]/70 text-sm leading-relaxed line-clamp-3 font-light">
             {offering.description}
          </p>
        </div>

        {/* CTA Area */}
        <button
          onClick={() => onBook(offering)}
          className="w-full mt-6 py-4 rounded-full bg-[#4a3b32] text-white text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-[#bc6746] transition-all duration-500 shadow-xl shadow-[#bc6746]/10 hover:shadow-[#bc6746]/30 group/btn"
        >
          Book Now
          <ArrowRight size={14} className="transition-transform duration-500 group-hover/btn:translate-x-2" />
        </button>
      </div>
    </motion.div>
  );
}
