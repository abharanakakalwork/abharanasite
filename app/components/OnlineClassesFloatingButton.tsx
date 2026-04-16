"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function OnlineClassesFloatingButton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      className="fixed bottom-8 left-6 z-[998] md:hidden"
    >
      <Link
        href="/online-classes"
        className="group relative flex items-center gap-3 bg-[#bc6746] text-white px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(188,103,70,0.4)] border border-white/10 overflow-hidden active:scale-95 transition-transform"
      >
        {/* Shine effect */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 4 }}
          className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-white"
            >
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
          </div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
            Online Classes
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
