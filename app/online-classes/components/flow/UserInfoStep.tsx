"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Gem,
  Star,
  Users,
  Send,
} from "lucide-react";
import Image from "next/image";
import { Offering, Session, UserData } from "./types";
import { formatDateLocal, formatTime12h } from "@/lib/utils";

const imageMap: Record<string, string> = {
  Hatha: "https://abharanakakal.b-cdn.net/assets/exp-yoga.png",
  Vinyasa: "https://abharanakakal.b-cdn.net/assets/exp-yoga.png",
  Breathwork: "https://abharanakakal.b-cdn.net/assets/exp-breathwork.png",
  Sound: "https://abharanakakal.b-cdn.net/assets/exp-sound.png",
  Meditation: "https://abharanakakal.b-cdn.net/assets/sh-guided.webp",
  Deep: "https://abharanakakal.b-cdn.net/assets/sh-intro-vessels.png",
  Sacred: "https://abharanakakal.b-cdn.net/assets/exp-nature.png",
  Yin: "https://abharanakakal.b-cdn.net/assets/about-journey-mood.png",
  Feminine: "https://abharanakakal.b-cdn.net/assets/exp-yoga.png",
  Mantra: "https://abharanakakal.b-cdn.net/assets/sh-guided.webp",
};

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
  gstPercent,
}: UserInfoStepProps) {
  const basePrice = offering.single_price;
  const gstAmount = Number((basePrice * (gstPercent / 100)).toFixed(2));
  const totalAmount = Number((basePrice + gstAmount).toFixed(2));

  const imageSrc =
    offering.image_url ||
    Object.entries(imageMap).find(([k]) => offering.title?.includes(k))?.[1] ||
    "https://abharanakakal.b-cdn.net/assets/exp-yoga.png";

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
      {/* ════════════════ LEFT — Booking Summary ════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-[#e8ddd5] p-7 space-y-6 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-2 text-[#2d2420]">
          <Gem size={14} className="text-[#bc6746]" />
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#7a6a62]">
            Booking Summary
          </span>
        </div>

        {/* Selected Class */}
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#7a6a62]/70">
            Selected Class
          </p>
          <h4 className="text-2xl font-serif italic text-[#2d2420] leading-tight">
            {offering.title}
          </h4>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#7a6a62]">
              <Calendar size={10} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Date
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#2d2420]">
              {formatDateLocal(date)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#7a6a62]">
              <Clock size={10} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Time
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#2d2420]">
              {formatTime12h(session.start_time)}
            </p>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="border-t border-[#e8ddd5] pt-5 space-y-3">
          <div className="flex justify-between items-center text-[13px] text-[#2d2420]">
            <span className="text-[#7a6a62]">Session Fee</span>
            <span>₹{basePrice}</span>
          </div>
          <div className="flex justify-between items-center text-[12px] text-[#7a6a62]">
            <span>GST ({gstPercent}%)</span>
            <span>₹{gstAmount}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2d2420]">
              Total Amount
            </span>
            <span className="text-3xl font-bold text-[#2d2420]">
              ₹{totalAmount}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ════════════════ RIGHT — Your Information ════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl border border-[#e8ddd5] p-7 space-y-7 shadow-sm"
      >
        {/* Header */}
        <div>
          <h3 className="text-[15px] font-black uppercase tracking-[0.2em] text-[#2d2420]">
            Your Information
          </h3>
          <p className="text-[11px] text-[#7a6a62] mt-0.5 uppercase tracking-widest">
            Confirm your details
          </p>
        </div>

        <div className="space-y-0">
          {/* Full Name */}
          <div className="relative group border-b border-[#e8ddd5] focus-within:border-[#bc6746] transition-colors pb-1">
            <label className="block text-[12px] font-medium text-[#7a6a62] mb-1">
              Full Name
            </label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Your full name"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                className="flex-1 bg-transparent py-2 outline-none text-[14px] text-[#2d2420] placeholder-[#d9cbc4]"
              />
              <User
                size={14}
                className="text-[#d9cbc4] group-focus-within:text-[#bc6746] transition-colors shrink-0"
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6 pt-5">
            <div className="relative group border-b border-[#e8ddd5] focus-within:border-[#bc6746] transition-colors pb-1">
              <label className="block text-[12px] font-medium text-[#7a6a62] mb-1">
                Email Address
              </label>
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  className="flex-1 bg-transparent py-2 outline-none text-[14px] text-[#2d2420] placeholder-[#d9cbc4]"
                />
                <Mail
                  size={14}
                  className="text-[#d9cbc4] group-focus-within:text-[#bc6746] transition-colors shrink-0"
                />
              </div>
            </div>

            <div className="relative group border-b border-[#e8ddd5] focus-within:border-[#bc6746] transition-colors pb-1 mt-5 sm:mt-0">
              <label className="block text-[12px] font-medium text-[#7a6a62] mb-1">
                Phone Number
              </label>
              <div className="flex items-center">
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData({ ...userData, phone: e.target.value })
                  }
                  className="flex-1 bg-transparent py-2 outline-none text-[14px] text-[#2d2420] placeholder-[#d9cbc4]"
                />
                <Phone
                  size={14}
                  className="text-[#d9cbc4] group-focus-within:text-[#bc6746] transition-colors shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Special Note */}
          <div className="pt-6 space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#7a6a62]">
              Special Note / Experience Level
            </label>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Injuries, experience level, or anything we should know..."
                value={userData.message}
                onChange={(e) =>
                  setUserData({ ...userData, message: e.target.value })
                }
                className="w-full bg-[#fafaf8] border border-[#e8ddd5] rounded-xl p-4 pr-10 outline-none focus:border-[#bc6746] transition-colors text-[13px] text-[#2d2420] placeholder-[#d9cbc4] leading-relaxed resize-none"
              />
              <Send
                size={14}
                className="absolute bottom-3.5 right-3.5 text-[#d9cbc4] pointer-events-none"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
