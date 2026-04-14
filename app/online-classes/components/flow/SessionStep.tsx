"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { Session } from "./types";

interface SessionCardProps {
  session: Session;
  isSelected: boolean;
  onSelect: (session: Session) => void;
  index: number;
}

const SessionCard = memo(function SessionCard({ session, isSelected, onSelect, index }: SessionCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onClick={() => onSelect(session)}
      className={`p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col justify-between space-y-8 h-full
        ${isSelected ? 'border-[#bc6746] bg-white shadow-2xl shadow-[#bc6746]/10' : 'border-[#f1e4da] bg-white/40 hover:bg-white/80 hover:border-[#bc6746]/20'}`}
    >
      <div className="flex justify-between items-start">
        <div className="p-4 rounded-3xl bg-[#bc6746]/5 text-[#bc6746] shadow-sm">
          <CalendarIcon className="w-7 h-7" />
        </div>
        {isSelected && (
          <div className="bg-[#bc6746] text-white rounded-full p-2 animate-in zoom-in">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-serif text-[#4a3b32]">
          {new Date(session.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746] mt-2 italic font-mono">{session.start_time}</p>
      </div>
    </motion.div>
  );
});

interface SessionStepProps {
  sessions: Session[];
  selectedSession: Session | null;
  onSelect: (session: Session) => void;
  onSwitchToPrivate: () => void;
}

const SessionStep = memo(function SessionStep({ sessions, selectedSession, onSelect, onSwitchToPrivate }: SessionStepProps) {
  if (sessions.length === 0) {
    return (
      <div className="col-span-full text-center py-24 bg-white/10 rounded-[50px] border-2 border-dashed border-[#f1e4da] group mx-4">
        <p className="italic text-[#4a3b32]/40 font-light text-xl tracking-wide">No group sessions manifested for this practice. <br className="hidden md:block"/> Consider a private resonance for a tailored experience.</p>
        <button onClick={onSwitchToPrivate} className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746] hover:scale-105 transition-all">Switch to Private Resonance</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {sessions.map((session, idx) => (
        <SessionCard 
          key={session.id} 
          session={session} 
          isSelected={selectedSession?.id === session.id} 
          onSelect={onSelect}
          index={idx}
        />
      ))}
    </div>
  );
});

export default SessionStep;
