"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlotSelector } from "@/components/booking/SlotSelector";
import { Session } from "./types";
import { AlertCircle, ArrowRight } from "lucide-react";

interface SlotStepProps {
  slots: Session[];
  selectedSlotId: string | null;
  onSelect: (slot: Session) => void;
  onSwitchToPrivate: () => void;
}

const SlotStep: React.FC<SlotStepProps> = ({ slots, selectedSlotId, onSelect, onSwitchToPrivate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto px-4"
    >
      <div className="text-center mb-10">
        <h3 className="text-3xl font-serif text-[#4a3b32] mb-3">Choose Your Time</h3>
        <p className="text-[#a55a3d]/60 text-sm">Select an available session that fits your day.</p>
      </div>

      <SlotSelector 
        slots={slots.map(s => ({
            id: s.id,
            start_time: s.start_time,
            capacity: s.capacity,
            booked_count: s.booked_count,
            meeting_link: s.meeting_link
        }))}
        selectedSlotId={selectedSlotId}
        onSelect={(slot) => onSelect(slots.find(s => s.id === slot.id)!)}
      />

      {slots.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[#f1e4da] rounded-[40px] bg-white/10 mt-4 h-64">
           <AlertCircle className="w-8 h-8 text-[#a55a3d]/20 mb-4" />
           <p className="text-[#4a3b32]/60 italic font-mono text-sm max-w-xs leading-relaxed">
             No group sessions available for this date. 
             Consider a private resonance for a tailored experience.
           </p>
           <button 
             onClick={onSwitchToPrivate}
             className="mt-6 flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#bc6746] hover:tracking-[0.4em] transition-all"
           >
             <span>Switch to Private</span>
             <ArrowRight className="w-3 h-3" />
           </button>
        </div>
      )}
    </motion.div>
  );
};

export default SlotStep;
