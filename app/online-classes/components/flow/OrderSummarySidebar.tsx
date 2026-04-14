"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  ShieldCheck, 
  ChevronRight, 
  Loader2,
  CalendarCheck,
  Clock,
  ArrowRight,
  Receipt,
  Info,
  AlertCircle
} from "lucide-react";
import { Offering, Session, UserData } from "./types";
import { cn } from "@/lib/utils";

interface OrderSummarySidebarProps {
  offering: Offering | null;
  session: Session | null;
  date: Date | null;
  gstPercent: number; // Added dynamic GST
  isSubmitting: boolean;
  onProceed: () => void;
  canProceed: boolean;
}

const GST_RATE = 0.18; // 18% GST

export default function OrderSummarySidebar({
  offering,
  session,
  date,
  gstPercent,
  isSubmitting,
  onProceed,
  canProceed
}: OrderSummarySidebarProps) {
  
  const pricing = React.useMemo(() => {
    if (!offering) return { base: 0, gst: 0, total: 0 };
    const base = offering.single_price;
    const gstRate = gstPercent / 100;
    const gst = base * gstRate;
    const total = base + gst;
    return { base, gst, total };
  }, [offering, gstPercent]);

  return (
    <div className="space-y-6">
      {/* 1. Selection Summary */}
      <div className="bg-white p-6 md:p-8 rounded-[40px] border border-[#f1e4da] shadow-2xl shadow-[#bc6746]/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#bc6746]/5 to-transparent rounded-bl-[100px]" />
        
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746] mb-6 flex items-center gap-2">
            <Receipt className="w-3 h-3" /> Booking Summary
        </h3>

        <div className="space-y-6">
            <div className="space-y-1">
                <p className="text-[9px] font-black text-[#a55a3d]/40 uppercase tracking-widest italic">Selected Practice</p>
                <p className="text-xl font-serif text-[#4a3b32]">{offering?.title || "Choose a practice..."}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#f1e4da]">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-[#a55a3d]/40 uppercase tracking-widest italic">Scheduled For</p>
                    <div className="flex items-center gap-2 text-[#4a3b32]">
                        <CalendarCheck className="w-3.5 h-3.5 text-[#bc6746]" />
                        <span className="text-sm font-bold">{date ? date.toLocaleDateString('en-GB') : "Select date"}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-[#a55a3d]/40 uppercase tracking-widest italic">Time Portal</p>
                    <div className="flex items-center gap-2 text-[#4a3b32]">
                        <Clock className="w-3.5 h-3.5 text-[#bc6746]" />
                        <span className="text-sm font-bold">{session?.start_time || "Select time"}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="mt-10 pt-10 border-t-2 border-dashed border-[#f1e4da] space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-[#4a3b32]/60 uppercase tracking-widest">
                <span>Class Fee</span>
                <span>₹{pricing.base.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-[#bc6746]/60 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <span>GST ({gstPercent}%)</span>
                    <div className="group/info relative cursor-help">
                        <Info className="w-3 h-3 text-[#a55a3d]/40" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-[#4a3b32] text-white text-[8px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity z-10 pointer-events-none">
                            Standard GST applicable on all online classes.
                        </span>
                    </div>
                </div>
                <span>₹{pricing.gst.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-4 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Total Amount</span>
                <span className="text-4xl font-serif font-black text-[#bc6746] tracking-tighter italic">₹{pricing.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
        </div>
      </div>

      {/* 2. Action Button */}
      <div className="space-y-4">
        <button 
            disabled={!canProceed || isSubmitting}
            onClick={onProceed}
            className={cn(
                "w-full py-8 rounded-[30px] bg-[#bc6746] text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 group",
                !canProceed || isSubmitting ? "opacity-30 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95 shadow-[#bc6746]/40"
            )}
        >
            {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
                <>
                   Proceed to Payment 
                   <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </>
            )}
        </button>

        <div className="flex flex-col items-center justify-center gap-3">
            {!canProceed && !isSubmitting && (
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#bc6746] opacity-60 mb-1 flex items-center gap-1 animate-pulse">
                   <AlertCircle className="w-2.5 h-2.5" /> Please complete personal details
                </p>
            )}
            <div className="flex items-center justify-center gap-3 opacity-40">
                <ShieldCheck className="w-4 h-4 text-[#bc6746]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]">Secure Booking Verified</p>
            </div>
        </div>
      </div>
    </div>
  );
}
