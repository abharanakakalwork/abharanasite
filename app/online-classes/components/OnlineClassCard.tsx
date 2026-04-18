"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Clock, Radio, ArrowRight } from "lucide-react";
import { Offering } from "./flow/types";

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

interface OnlineClassCardProps {
  offering: Offering;
  onBook: (offering: Offering) => void;
  index: number;
  slotsLeft?: number;
  isLive?: boolean;
}

export default function OnlineClassCard({
  offering,
  onBook,
  index,
  slotsLeft,
  isLive,
}: OnlineClassCardProps) {
  const imageSrc =
    offering.image_url ||
    Object.entries(imageMap).find(([key]) =>
      offering.title.includes(key),
    )?.[1] ||
    "https://abharanakakal.b-cdn.net/assets/exp-yoga.png";

  const [isExpanded, setIsExpanded] = React.useState(false);
  const isLongDescription = offering.description?.length > 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
      className="group bg-white rounded-2xl  overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500 border border-[#e8ddd5] flex flex-col"
    >
      {/* ── Image ── */}
      <div className="relative h-[200px] overflow-hidden">
        <Image
          src={imageSrc}
          alt={offering.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top-left: slots badge */}
        {slotsLeft !== undefined && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#4a3b32] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
            {slotsLeft} slots left
          </div>
        )}

        {/* Top-left: Live Session badge (if live) */}
        {isLive && !slotsLeft && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#4a3b32] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <Radio size={10} className="text-[#bc6746]" />
            Live Session
          </div>
        )}

        {/* Bottom-left: duration badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#4a3b32] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <Clock size={10} className="text-[#6b8c6e]" />
          {offering.duration}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-5 pb-2 flex flex-col gap-3">
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[17px] font-semibold text-[#2d2420] leading-snug group-hover:text-[#bc6746] transition-colors duration-300">
            {offering.title}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-[#bc6746] font-semibold text-[15px] whitespace-nowrap">
              ₹{offering.single_price} <span className="text-[10px] opacity-70 font-normal">/ session</span>
            </span>
            {offering.monthly_price && offering.monthly_price > 0 && (
              <span className="text-[11px] text-[#7a6a62] font-medium whitespace-nowrap">
                ₹{offering.monthly_price}/mo
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="relative">
          <p className={`text-[#7a6a62] text-[13px] leading-relaxed transition-all duration-300 ${!isExpanded ? "line-clamp-2" : ""}`}>
            {offering.description}
          </p>
          {isLongDescription && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-[#bc6746] text-[11px] font-bold mt-1.5 hover:underline flex items-center gap-1"
            >
              {isExpanded ? "See Less" : "See More"}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#ede3dc]" />

        {/* Duration row */}
        <div className="flex items-center gap-1.5 text-[#7a6a62] text-[13px]">
          <Clock size={13} className="shrink-0 text-[#6b8c6e]" />
          <span>{offering.duration}</span>
        </div>

        {/* Book Now CTA */}
      </div>
      <div className="px-5 pb-5">
        <button
          onClick={() => onBook(offering)}
          className="mt-1  w-full py-3 rounded-xl bg-[#bc6746] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4a6250] active:scale-[0.98] transition-all duration-300"
        >
          Book Now
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
