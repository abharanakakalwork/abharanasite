"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, HeartPulse } from "lucide-react";

export default function TrustSection() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Personalised Guidance",
      desc: "Tailored support for your unique energy level and goals."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "All Levels Welcome",
      desc: "From beginners to seasoned practitioners, we meet you where you are."
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      title: "Supportive Space",
      desc: "A calm, non-judgmental environment to nurture your well-being."
    }
  ];

  return (
    <section className="py-24 px-4 bg-white/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#bc6746]/10 to-transparent" />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              
              className="text-center space-y-6 group"
            >
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto text-[#bc6746] shadow-xl shadow-[#bc6746]/5 group-hover:scale-105 group-hover:shadow-[#bc6746]/10 transition-all duration-500">
                {f.icon}
              </div>
              <h3 className="text-md font-black uppercase tracking-[0.4em] text-[#4a3b32]">{f.title}</h3>
              <p className="text-md text-[#a55a3d]/70 font-light italic leading-relaxed px-4">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
