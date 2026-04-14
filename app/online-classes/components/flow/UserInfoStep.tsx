"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Clock, Gem } from "lucide-react";
import { Offering, Session, UserData } from "./types";
import { cn, formatDateLocal, formatTime12h, validateEmail, validatePhone } from "@/lib/utils";

interface UserInfoStepProps {
  userData: UserData;
  setUserData: (data: UserData) => void;
  offering: Offering;
  session: Session;
  date: Date;
  gstPercent: number;
}

export default function UserInfoStep({
  userData,
  setUserData,
  offering,
  session,
  date,
  gstPercent
}: UserInfoStepProps) {
  
  const basePrice = offering.single_price;
  const gstAmount = Number((basePrice * (gstPercent / 100)).toFixed(2));
  const totalAmount = Number((basePrice + gstAmount).toFixed(2));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
      
      {/* Left: Booking Summary Card */}
      <div className="lg:col-span-5 order-2 lg:order-1">
        <div className="bg-[#4a3b32] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#bc6746]/20 rounded-full -ml-12 -mb-12 blur-2xl" />
           
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 opacity-60">
                 <Gem className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Booking Summary</span>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest opacity-40">Selected Class</span>
                    <h4 className="text-2xl font-serif italic text-[#f1e4da]">{offering.title}</h4>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 opacity-40">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[9px] uppercase tracking-widest">Date</span>
                       </div>
                       <p className="text-sm font-medium">{formatDateLocal(date)}</p>
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 opacity-40">
                          <Clock className="w-3 h-3" />
                          <span className="text-[9px] uppercase tracking-widest">Time</span>
                       </div>
                       <p className="text-sm font-medium">{formatTime12h(session.start_time)}</p>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="opacity-60">Session Fee</span>
                    <span>₹{basePrice}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs opacity-40">
                    <span>GST ({gstPercent}%)</span>
                    <span>₹{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                 </div>
                 <div className="flex justify-between items-center pt-4">
                    <span className="text-xs font-black uppercase tracking-widest text-[#bc6746]">Total Amount</span>
                    <span className="text-3xl font-serif italic text-white">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Right: Personal Information Form */}
      <div className="lg:col-span-7 order-1 lg:order-2 space-y-8 bg-white/40 p-8 md:p-12 rounded-[40px] border border-[#f1e4da]">
         <div className="space-y-2">
            <h3 className="text-2xl font-serif text-[#4a3b32] uppercase tracking-tighter">Your Information</h3>
            <p className="text-[#a55a3d]/40 text-[10px] uppercase font-black tracking-widest">Confirm your details for the session</p>
         </div>

         <div className="space-y-6">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Full Name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full bg-transparent border-b border-[#f1e4da] py-4 outline-none focus:border-[#bc6746] transition-all text-lg font-serif text-[#4a3b32] placeholder-[#a55a3d]/20"
              />
              <User className="absolute right-0 bottom-4 w-4 h-4 text-[#a55a3d]/20 group-focus-within:text-[#bc6746] transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-[#f1e4da] py-4 outline-none focus:border-[#bc6746] transition-all text-lg font-serif text-[#4a3b32] placeholder-[#a55a3d]/20"
                />
                <Mail className="absolute right-0 bottom-4 w-4 h-4 text-[#a55a3d]/20 group-focus-within:text-[#bc6746] transition-colors" />
              </div>
              <div className="relative group">
                <input 
                  type="tel" 
                  placeholder="Phone Number"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-[#f1e4da] py-4 outline-none focus:border-[#bc6746] transition-all text-lg font-serif text-[#4a3b32] placeholder-[#a55a3d]/20"
                />
                <Phone className="absolute right-0 bottom-4 w-4 h-4 text-[#a55a3d]/20 group-focus-within:text-[#bc6746] transition-colors" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#a55a3d]/40">Special Note / Experience Level</label>
              <textarea 
                rows={2}
                placeholder="Injuries, experience level, or anything we should know..."
                value={userData.message}
                onChange={(e) => setUserData({ ...userData, message: e.target.value })}
                className="w-full bg-white/40 border border-[#f1e4da] rounded-2xl p-5 outline-none focus:border-[#bc6746] transition-all text-[#4a3b32] font-serif placeholder-[#a55a3d]/20 italic text-sm leading-relaxed"
              />
            </div>
         </div>
      </div>

    </div>
  );
}
