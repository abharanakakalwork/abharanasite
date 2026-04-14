"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles, Wind, Moon, Sun, Zap, Gem, Leaf } from "lucide-react";
import { Offering } from "./types";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  "Hatha": Wind,
  "Vinyasa": Zap,
  "Yin": Moon,
  "Meditation": Sun,
  "Sound": Gem,
  "Breathwork": Leaf,
};

interface OfferingCardProps {
  offering: Offering;
  isSelected: boolean;
  onSelect: (offering: Offering) => void;
  index: number;
}

const OfferingCard = memo(function OfferingCard({ offering, isSelected, onSelect, index }: OfferingCardProps) {
  const Icon = Object.entries(iconMap).find(([key]) => offering.title.includes(key))?.[1] || Sparkles;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      onClick={() => onSelect(offering)}
      className={cn(
        "group p-8 rounded-[40px] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full min-h-[280px]",
        isSelected 
          ? "border-[#bc6746] bg-white shadow-xl shadow-[#bc6746]/10 scale-[1.01]" 
          : "border-[#f1e4da] bg-white/40 hover:bg-white/80 hover:border-[#bc6746]/30"
      )}
    >
      {/* Decorative Background Blob */}
      <div className={cn(
        "absolute -top-12 -right-12 w-32 h-32 rounded-full transition-all duration-700 blur-[80px]",
        isSelected ? "bg-[#bc6746]/10 scale-150" : "bg-[#bc6746]/5"
      )} />

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className={cn(
            "w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500",
            isSelected ? "bg-[#bc6746] text-white shadow-lg" : "bg-white border border-[#f1e4da] text-[#bc6746]"
          )}>
            <Icon className="w-8 h-8" />
          </div>
          {isSelected && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-[#bc6746]/10 text-[#bc6746] px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest"
            >
              Selected
            </motion.div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-3xl font-serif text-[#4a3b32] tracking-tight">{offering.title}</h3>
          <p className="text-sm text-[#4a3b32]/60 font-light leading-relaxed tracking-wide italic line-clamp-3">
            {offering.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 pt-8 flex items-center justify-between">
        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-[#bc6746]">
          <Clock className="w-3.5 h-3.5 mr-2" /> {offering.duration}
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-black tracking-widest opacity-30 block mb-1">Exchange</span>
          <span className="text-xl font-serif italic text-[#4a3b32]">₹{offering.single_price}</span>
        </div>
      </div>
    </motion.div>
  );
});

interface OfferingStepProps {
  offerings: Offering[];
  selectedOffering: Offering | null;
  onSelect: (offering: Offering) => void;
}

const OfferingStep = memo(function OfferingStep({ offerings, selectedOffering, onSelect }: OfferingStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 max-w-7xl mx-auto">
      {offerings.map((offering, idx) => (
        <OfferingCard 
          key={offering.id} 
          offering={offering} 
          isSelected={selectedOffering?.id === offering.id} 
          onSelect={onSelect}
          index={idx}
        />
      ))}
    </div>
  );
});

export default OfferingStep;
