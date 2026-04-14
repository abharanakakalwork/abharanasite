"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Loader2, ChevronRight, Clock, CalendarIcon } from "lucide-react";
import { Offering, Session, UserData } from "./types";

interface BookingSummaryProps {
  intent: "group" | "private";
  selectedOffering: Offering | null;
  selectedSession: Session | null;
  bookingMode: "single" | "package";
  packageSize: number;
  calculateTotal: () => number;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  isSubmitting: boolean;
  onFinalize: () => void;
}

const BookingSummary = memo(function BookingSummary({
  intent,
  selectedOffering,
  selectedSession,
  bookingMode,
  packageSize,
  calculateTotal,
  userData,
  setUserData,
  isSubmitting,
  onFinalize,
}: BookingSummaryProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto px-4 translate-y-4">
      {/* Review Column */}
      <div className="space-y-10 sticky top-32 lg:pr-10 border-r border-[#f1e4da]/50">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#a55a3d]/40">Step 4: Your Details</span>
          <h3 className="text-4xl font-serif text-[#4a3b32] tracking-tighter uppercase italic">Confirm <br/> Details</h3>
        </div>
        
        <div className="space-y-8 pl-4">
           <div className="space-y-2 group cursor-default">
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#bc6746]/60 transition-all group-hover:tracking-[0.4em]">Selected Practice</span>
              <p className="text-3xl font-serif text-[#4a3b32] leading-[1.1]">{selectedOffering?.title}</p>
           </div>
           
           {selectedSession && (
             <div className="space-y-2 group cursor-default">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#bc6746]/60 transition-all group-hover:tracking-[0.4em]">Scheduled Time</span>
                <p className="text-xl text-[#4a3b32]/80 font-serif italic flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-[#bc6746]/40" />
                  <span>{new Date(selectedSession.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
                  <span className="text-[#bc6746]/40 mx-2">@</span>
                  <Clock className="w-4 h-4 text-[#bc6746]/40" />
                  <span>{selectedSession.start_time}</span>
                </p>
             </div>
           )}
           
           <div className="pt-10">
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#bc6746]/60 mb-2 block">Total Amount</span>
            <div className="text-6xl font-serif text-[#bc6746] tracking-tighter italic">₹{calculateTotal()}</div>
           </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="space-y-10 bg-white p-12 md:p-16 rounded-[40px] md:rounded-[60px] shadow-2xl shadow-[#bc6746]/5 border border-[#f1e4da] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#f1e4da] via-[#bc6746]/20 to-[#f1e4da]" />
        <h3 className="text-3xl font-serif text-[#4a3b32] uppercase tracking-tighter">Your Information</h3>
        
        <div className="space-y-8">
          <div className="relative group">
            <input 
               type="text" 
               placeholder="Full Name"
               value={userData.name}
               onChange={(e) => setUserData({ ...userData, name: e.target.value })}
               className="w-full bg-transparent border-b border-[#f1e4da] py-4 outline-none focus:border-[#bc6746] transition-all text-xl font-serif text-[#4a3b32] placeholder-[#a55a3d]/20"
            />
            <User className="absolute right-0 bottom-4 w-5 h-5 text-[#a55a3d]/20 group-focus-within:text-[#bc6746] transition-colors" />
          </div>
          <div className="relative group">
            <input 
               type="email" 
               placeholder="Email Address"
               value={userData.email}
               onChange={(e) => setUserData({ ...userData, email: e.target.value })}
               className="w-full bg-transparent border-b border-[#f1e4da] py-4 outline-none focus:border-[#bc6746] transition-all text-xl font-serif text-[#4a3b32] placeholder-[#a55a3d]/20"
            />
            <Mail className="absolute right-0 bottom-4 w-5 h-5 text-[#a55a3d]/20 group-focus-within:text-[#bc6746] transition-colors" />
          </div>
          <div className="relative group">
            <input 
               type="tel" 
               placeholder="Phone Number"
               value={userData.phone}
               onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
               className="w-full bg-transparent border-b border-[#f1e4da] py-4 outline-none focus:border-[#bc6746] transition-all text-xl font-serif text-[#4a3b32] placeholder-[#a55a3d]/20"
            />
            <Phone className="absolute right-0 bottom-4 w-5 h-5 text-[#a55a3d]/20 group-focus-within:text-[#bc6746] transition-colors" />
          </div>
          
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a55a3d]/50">Additional Notes (Optional)</label>
            <textarea 
              rows={3}
              placeholder="Anything else we should know?"
              value={userData.message}
              onChange={(e) => setUserData({ ...userData, message: e.target.value })}
              className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-3xl p-6 outline-none focus:border-[#bc6746] transition-all text-[#4a3b32] font-serif placeholder-[#a55a3d]/30 h-32 italic leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-8">
          <button 
            onClick={onFinalize}
            disabled={isSubmitting || !userData.name || !userData.email || !userData.phone}
            className="w-full py-8 md:py-10 rounded-[30px] bg-[#bc6746] text-white font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-[#bc6746]/40 hover:bg-[#a55a3d] hover:scale-[0.99] active:scale-95 transition-all flex items-center justify-center gap-5 group disabled:opacity-30"
          >
            {isSubmitting ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>Next: QR Payment <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform"/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default BookingSummary;
