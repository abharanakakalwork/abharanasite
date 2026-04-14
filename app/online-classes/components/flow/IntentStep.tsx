"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Users, Heart } from "lucide-react";

interface IntentStepProps {
  onSelect: (intent: "group" | "private") => void;
}

const IntentStep = memo(function IntentStep({ onSelect }: IntentStepProps) {
  return (
    <motion.div 
     
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-16 text-[#4a3b32]">
         <h2 className="text-4xl md:text-5xl font-serif mb-4 tracking-tighter uppercase font-medium">Select Your Format</h2>
         <p className="text-[#a55a3d]/70 italic font-light tracking-wide">Choose the practice session that suits your schedule</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => onSelect("group")}
          className="group p-12 rounded-[40px] border border-[#f1e4da] bg-white hover:border-[#bc6746]/50 transition-all cursor-pointer text-center space-y-6 shadow-sm hover:shadow-2xl hover:shadow-[#bc6746]/10"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#bc6746]/5 text-[#bc6746] flex items-center justify-center mx-auto group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500 shadow-inner">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-serif text-[#4a3b32] uppercase tracking-wide">Group Sessions</h3>
          <p className="text-md text-[#a55a3d]/60 font-light px-4 leading-relaxed italic">Join our scheduled group classes and practice with a community of practitioners.</p>
          <div className="pt-4 text-[10px] font-black uppercase tracking-[0.34em] text-[#bc6746]">View Schedule</div>
        </div>

        <div 
          onClick={() => onSelect("private")}
          className="group p-12 rounded-[40px] border border-[#f1e4da] bg-white hover:border-[#bc6746]/50 transition-all cursor-pointer text-center space-y-6 shadow-sm hover:shadow-2xl hover:shadow-[#bc6746]/10"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#bc6746]/5 text-[#bc6746] flex items-center justify-center mx-auto group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500 shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-serif text-[#4a3b32] uppercase tracking-wide">Private Session</h3>
          <p className="text-md text-[#a55a3d]/60 font-light px-4 leading-relaxed italic">A tailored one-on-one session designed specifically for your personal goals and needs.</p>
          <div className="pt-4 text-[10px] font-black uppercase tracking-[0.34em] text-[#bc6746]">Request Consultation</div>
        </div>
      </div>
    </motion.div>
  );
});

export default IntentStep;
