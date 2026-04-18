"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, CalendarDays, ChevronRight, Sparkles } from "lucide-react";
import { Offering } from "./types";
import { cn } from "@/lib/utils";

interface BookingTypeStepProps {
  offering: Offering;
  onSelect: (mode: "single" | "monthly") => void;
}

export default function BookingTypeStep({ offering, onSelect }: BookingTypeStepProps) {
  const hasMonthly = offering.monthly_price && offering.monthly_price > 0;

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#bc6746] leading-tight">
          Select Your Practice Format
        </h2>
        <p className="mt-4 text-[16px] text-[#7a6a62] font-light italic">
          Choose the commitment that flows with your journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {/* Single Session Card */}
        <motion.div
           whileHover={{ y: -5 }}
           onClick={() => onSelect("single")}
           className="group relative bg-white rounded-[32px] border border-[#e8ddd5] p-8 cursor-pointer hover:border-[#bc6746] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#bc6746]/5"
        >
          <div className="mb-6 w-14 h-14 rounded-2xl bg-[#fdfcf6] border border-[#f1e4da] flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
            <Clock size={28} />
          </div>
          
          <h3 className="text-2xl font-serif font-semibold text-[#2d2420] mb-2">Single Session</h3>
          <p className="text-[14px] text-[#7a6a62] leading-relaxed mb-8 font-light italic">
            Perfect for a focused dive or testing the waters. Select a specific date and time that suits you.
          </p>
          
          <div className="flex items-end justify-between">
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-[#4a3b32]/40 mb-1">Per Session</span>
              <span className="text-3xl font-bold text-[#2d2420]">₹{offering.single_price}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#fdfcf6] border border-[#f1e4da] flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={18} />
            </div>
          </div>
        </motion.div>

        {/* Monthly Membership Card */}
        <motion.div
           whileHover={{ y: -5 }}
           onClick={() => hasMonthly && onSelect("monthly")}
           className={cn(
             "group relative bg-white rounded-[32px] border border-[#e8ddd5] p-8 transition-all duration-300 shadow-sm overflow-hidden",
             hasMonthly 
               ? "cursor-pointer hover:border-[#bc6746] hover:shadow-xl hover:shadow-[#bc6746]/5" 
               : "opacity-50 grayscale cursor-not-allowed"
           )}
        >
          {/* Badge */}
          {hasMonthly && (
            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-[#bc6746]/10 text-[#bc6746] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} />
              Best Value
            </div>
          )}

          <div className="mb-6 w-14 h-14 rounded-2xl bg-[#fdfcf6] border border-[#f1e4da] flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
            <CalendarDays size={28} />
          </div>
          
          <h3 className="text-2xl font-serif font-semibold text-[#2d2420] mb-2">Monthly Unlimited</h3>
          <p className="text-[14px] text-[#7a6a62] leading-relaxed mb-8 font-light italic">
            Flow consistently for 30 days. Full access to all scheduled group sessions for this practice.
          </p>
          
          <div className="flex items-end justify-between">
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-[#4a3b32]/40 mb-1">30 Days Pass</span>
              <span className="text-3xl font-bold text-[#2d2420]">
                {hasMonthly ? `₹${offering.monthly_price}` : "Not Available"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#fdfcf6] border border-[#f1e4da] flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={18} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
