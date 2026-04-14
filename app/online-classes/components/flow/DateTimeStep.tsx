"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/Calendar";
import { Clock, CalendarDays } from "lucide-react";
import { Session } from "./types";
import { cn, formatDateLocal, formatTime12h } from "@/lib/utils";

interface DateTimeStepProps {
  selectedDate: Date | null;
  selectedSession: Session | null;
  onSelectDate: (date: Date) => void;
  onSelectSession: (session: Session) => void;
  availabilityData: { sessions: Session[]; exceptions: any[] };
  offeringId?: string;
}

export default function DateTimeStep({
  selectedDate,
  selectedSession,
  onSelectDate,
  onSelectSession,
  availabilityData,
  offeringId
}: DateTimeStepProps) {
  
  const availableSlots = useMemo(() => {
    if (!selectedDate || !availabilityData.sessions) return [];
    const dateStr = formatDateLocal(selectedDate);
    const now = new Date();
    
    return availabilityData.sessions.filter(s => {
        const isSelectedDate = s.session_date === dateStr;
        const isCorrectOffering = !offeringId || s.offering_id === offeringId;
        
        // Validation
        const sessionStart = new Date(`${s.session_date}T${s.start_time}`);
        const cooldownStart = new Date(sessionStart.getTime() - (s.cooldown_minutes || 60) * 60000);
        const sessionEnd = new Date(sessionStart.getTime() + (s.duration_minutes || 60) * 60000);
        
        const isPast = now > sessionEnd;
        const inCooldown = now > cooldownStart;
        const isBlocked = s.is_blocked || s.status === 'cancelled';
        
        return isSelectedDate && isCorrectOffering && !isPast && !inCooldown && !isBlocked;
    });
  }, [selectedDate, availabilityData.sessions, offeringId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
      {/* Calendar Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-[#bc6746]">
          <CalendarDays className="w-5 h-5" />
          <h3 className="text-xs font-black uppercase tracking-[0.4em]">Choose Date</h3>
        </div>
        <div className="bg-white/40 p-4 rounded-[40px] border border-[#f1e4da] shadow-sm">
          <Calendar 
            selectedDate={selectedDate}
            onDateSelect={onSelectDate}
            availabilityData={availabilityData}
          />
        </div>
      </section>

      {/* Time Slots Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-[#bc6746]">
          <Clock className="w-5 h-5" />
          <h3 className="text-xs font-black uppercase tracking-[0.4em]">Select Time Portal</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {selectedDate ? (
            availableSlots.length > 0 ? (
              availableSlots.map(slot => {
                const isFull = slot.booked_count >= slot.capacity;
                const isSelected = selectedSession?.id === slot.id;
                
                return (
                  <motion.button
                    key={slot.id}
                    whileHover={!isFull ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isFull ? { scale: 0.98 } : {}}
                    disabled={isFull}
                    onClick={() => onSelectSession(slot)}
                    className={cn(
                      "p-6 rounded-[24px] text-center transition-all border flex flex-col items-center justify-center gap-1",
                      isSelected 
                        ? "bg-[#bc6746] border-[#bc6746] text-white shadow-xl shadow-[#bc6746]/20" 
                        : "bg-white border-[#f1e4da] text-[#4a3b32] hover:border-[#bc6746]/40",
                      isFull && "opacity-30 cursor-not-allowed grayscale"
                    )}
                  >
                    <span className="font-serif italic text-xl leading-none">{formatTime12h(slot.start_time)}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                      {isFull ? "Full" : `${slot.capacity - slot.booked_count} Lft`}
                    </span>
                  </motion.button>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-[#f1e4da] rounded-[40px] opacity-40 italic text-sm">
                No sessions found for this portal
              </div>
            )
          ) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-[#f1e4da] rounded-[40px] opacity-30 italic text-sm">
              Please choose a date to see available portals
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
