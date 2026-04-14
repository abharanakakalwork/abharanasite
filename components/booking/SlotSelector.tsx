"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Slot {
  id: string;
  start_time: string;
  capacity: number;
  booked_count: number;
  meeting_link?: string;
}

interface SlotSelectorProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelect: (slot: Slot) => void;
  className?: string;
  isAdmin?: boolean;
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({
  slots,
  selectedSlotId,
  onSelect,
  className,
  isAdmin = false,
}) => {
  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[#f1e4da] rounded-3xl bg-white/10">
        <AlertCircle className="w-8 h-8 text-[#a55a3d]/20 mb-4" />
        <p className="text-[#4a3b32]/60 font-medium tracking-tight italic">
          No available slots for this date.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {slots.map((slot, index) => {
        const isSelected = selectedSlotId === slot.id;
        const isFull = slot.booked_count >= slot.capacity;
        const available = Math.max(0, slot.capacity - slot.booked_count);

        return (
          <motion.button
            key={slot.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={!isFull || isAdmin ? { y: -4, scale: 1.02 } : {}}
            whileTap={!isFull || isAdmin ? { scale: 0.98 } : {}}
            onClick={() => (!isFull || isAdmin) && onSelect(slot)}
            disabled={isFull && !isAdmin}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all flex flex-col items-start text-left overflow-hidden",
              isSelected 
                ? "bg-[#bc6746] border-[#bc6746] shadow-xl shadow-[#bc6746]/20" 
                : "bg-white/60 border-[#f1e4da] hover:border-[#bc6746]/30 hover:bg-white/90",
              isFull && !isAdmin && "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
            )}
          >
            {/* Background Glow */}
            {isSelected && (
              <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                 <Check className="w-12 h-12 text-white" />
              </div>
            )}

            <div className="flex items-center space-x-2 mb-4">
              <div className={cn(
                "p-2 rounded-lg",
                isSelected ? "bg-white/20 text-white" : "bg-[#bc6746]/10 text-[#bc6746]"
              )}>
                <Clock className="w-4 h-4" />
              </div>
              <span className={cn(
                "text-lg font-bold tracking-tight",
                isSelected ? "text-white" : "text-[#4a3b32]"
              )}>
                {slot.start_time}
              </span>
            </div>

            <div className="flex items-center justify-between w-full mt-auto">
                <div className="flex items-center space-x-2">
                   <Users className={cn(
                     "w-3.5 h-3.5",
                     isSelected ? "text-white/60" : "text-[#a55a3d]/40"
                   )} />
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-[0.1em]",
                     isSelected ? "text-white/80" : "text-[#a55a3d]/60"
                   )}>
                     {isAdmin ? `${slot.booked_count} / ${slot.capacity} Booked` : `${available} Available`}
                   </span>
                </div>
                
                {isFull && !isAdmin && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-100/50 px-2 py-0.5 rounded-full">
                    Full
                  </span>
                )}

                {isSelected && (
                  <div className="bg-white text-[#bc6746] rounded-full p-1 animate-in zoom-in">
                    <Check className="w-3 h-3" />
                  </div>
                )}
            </div>

            {/* Admin specific link info */}
            {isAdmin && slot.meeting_link && (
               <div className={cn(
                 "mt-3 pt-3 border-t w-full text-[10px] truncate",
                 isSelected ? "border-white/20 text-white/50" : "border-[#f1e4da] text-[#a55a3d]/40"
               )}>
                 {slot.meeting_link}
               </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
