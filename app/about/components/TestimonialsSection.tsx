'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sarah J.",
    role: "Sound Healing Seeker",
    content: "The sound healing session with Abharana was a profound journey. I felt a deep sense of release and clarity that stayed with me for weeks. It felt like every cell in my body was being recalibrated.",
    accent: "#bc6746"
  },
  {
    id: 2,
    name: "Michael R.",
    role: "Regular Practitioner",
    content: "Yoga here isn't just movement; it's a conversation with the self. The pace and attention to breath transformed my practice from a workout to a true ritual of awareness.",
    accent: "#a55a3d"
  },
  {
    id: 3,
    name: "Elena G.",
    role: "Retreat Participant",
    content: "The Prana Retreat offered a sacred space I didn't know I needed. Truly restorative for both the body and soul. I left feeling lighter and more connected to my essence than ever before.",
    accent: "#bc6746"
  },
  {
    id: 4,
    name: "David K.",
    role: "Workshops",
    content: "I've attended many workshops, but the depth of energy here is unique. There's a stillness that Abharana facilitates which allows for genuine inner exploration.",
    accent: "#e2b9a7"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-40 left-0 text-[10rem] md:text-[20rem] font-serif text-[#bc6746]/5 pointer-events-none select-none z-0">
        VOICES
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#bc6746] font-mono text-[10px] uppercase tracking-[0.5em] mb-4 block"
          >
            whispers of the sanctuary
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-serif text-[#a55a3d] leading-none tracking-tighter"
          >
            Hearts <br />
            <span className="text-[#bc6746] italic font-light">Resonating</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`soft-glass p-8 md:p-12 rounded-[50px] relative group ${
                i === 1 ? 'lg:mt-16' : i === 2 ? 'lg:mt-32' : ''
              }`}
            >
              {/* Subtle Quote Icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white border border-[#f1e4da] flex items-center justify-center text-[#bc6746] shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Quote size={20} fill="currentColor" className="opacity-20" />
              </div>

              <div className="space-y-8">
                <p className="text-lg md:text-xl font-light text-[#4a3b32] leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="pt-8 border-t border-[#bc6746]/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-serif text-[#a55a3d] uppercase tracking-tight font-bold">
                      {t.name}
                    </h4>
                    <p className="text-[10px] font-mono text-[#bc6746] uppercase tracking-[0.2em]">
                      {t.role}
                    </p>
                  </div>
                  <div 
                    className="w-10 h-1 rounded-full opacity-30" 
                    style={{ backgroundColor: t.accent }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
