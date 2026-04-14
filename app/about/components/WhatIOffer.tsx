"use client";
import React from "react";
import { 
  Wind, 
  Sparkles, 
  Waves, 
  Compass, 
  Flower2,
  Globe,
  MapPin
} from "lucide-react";

const onlineOfferings = [
  { 
    id: "yoga-online",
    icon: <Wind strokeWidth={1} size={32} />, 
    title: "Yogasana, Pranayama & Dhyana Classes", 
    desc: "Guided sessions designed to cultivate physical strength, breath awareness, mental clarity, and meditative presence.",
    accent: "#e2b9a7"
  },
  { 
    id: "wellbeing-guidance",
    icon: <Sparkles strokeWidth={1} size={32} />, 
    title: "Holistic Wellbeing Guidance", 
    desc: "Personalized support for mental, emotional, physical, and spiritual wellbeing, helping individuals achieve balance and inner harmony.",
    accent: "#bc6746"
  }
];

const offlineOfferings = [
  { 
    id: "sound-offline",
    icon: <Waves strokeWidth={1} size={32} />, 
    title: "Yoga Nidra & Sound Healing Sessions", 
    desc: "Deeply restorative experiences that promote profound relaxation, nervous system regulation, and energetic balance through guided meditation and therapeutic sound.",
    accent: "#a55a3d"
  },
  { 
    id: "retreats-offline",
    icon: <Compass strokeWidth={1} size={32} />, 
    title: "Prana Wellness Retreats", 
    desc: "Immersive retreats focused on nurturing physical, physiological, emotional, and spiritual wellbeing, offering a holistic space for rest, rejuvenation, and inner transformation.",
    accent: "#bc6746"
  },
  { 
    id: "feminine-offline",
    icon: <Flower2 strokeWidth={1} size={32} />, 
    title: "Somatic Mindful Movement: Feminine (Shakti) Awakening Workshops", 
    desc: "Sacred, body-based practices designed to awaken the feminine (Shakti) energy, fostering emotional release, embodied awareness, empowerment, and deeper connection to one’s inner wisdom.",
    accent: "#f1e4da"
  }
];

export default function WhatIOffer() {
  return (
    <section className="relative py-32 px-6 bg-[#fffdf8] paper-grain">
      {/* Background Watermark */}
      <div className="absolute top-20 right-0 text-[10rem] md:text-[20rem] font-serif text-[#bc6746]/5 pointer-events-none select-none z-0">
        OFFERINGS
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-32">
          <span className="text-[#bc6746] font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block">the nature of my work</span>
          <h2 className="text-5xl md:text-8xl font-serif text-[#a55a3d] leading-none tracking-tighter">
            What I <br />
            <span className="text-[#bc6746] italic font-light">Offer</span>
          </h2>
        </div>

        {/* Online Offerings Section */}
        <div className="mb-40">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-12 h-12 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
              <Globe size={20} />
            </div>
            <div className="flex-1 h-px bg-[#bc6746]/10" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#bc6746]">Online Offerings</h3>
            <div className="flex-1 h-px bg-[#bc6746]/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {onlineOfferings.map((offer) => (
              <div key={offer.id} className="group h-full">
                <div className="h-full bg-white/40 border border-[#f1e4da] p-10 md:p-14 rounded-[60px] hover:border-[#bc6746]/30 hover:shadow-2xl transition-all duration-500">
                  <div className="flex flex-col gap-10">
                    <div className="w-20 h-20 rounded-full bg-[#f1e4da]/40 flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
                      {offer.icon}
                    </div>
                    <div>
                      <h4 className="text-3xl font-serif text-[#a55a3d] mb-6 group-hover:text-[#bc6746] transition-colors">
                        {offer.title}
                      </h4>
                      <p className="text-lg font-light text-[#4a3b32]/70 leading-relaxed italic border-l-2 border-[#bc6746]/10 pl-8">
                        {offer.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Offerings Section */}
        <div>
          <div className="flex items-center gap-6 mb-16">
            <div className="w-12 h-12 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
              <MapPin size={20} />
            </div>
            <div className="flex-1 h-px bg-[#bc6746]/10" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#bc6746]">Offline Offerings</h3>
            <div className="flex-1 h-px bg-[#bc6746]/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offlineOfferings.map((offer, idx) => (
              <div 
                key={offer.id} 
                className={cn(
                  "group h-full",
                  idx === 2 ? "md:col-span-3 lg:col-span-1" : ""
                )}
              >
                <div className="h-full bg-white/40 border border-[#f1e4da] p-8 md:p-12 rounded-[50px] hover:border-[#bc6746]/30 hover:shadow-2xl transition-all duration-500">
                  <div className="flex flex-col gap-8">
                    <div className="w-16 h-16 rounded-full bg-[#f1e4da]/40 flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
                      {offer.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif text-[#a55a3d] mb-4 group-hover:text-[#bc6746] transition-colors leading-snug">
                        {offer.title}
                      </h4>
                      <p className="text-base font-light text-[#4a3b32]/70 leading-relaxed italic border-l border-[#bc6746]/20 pl-6">
                        {offer.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Utility for conditional classnames if not already available
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
