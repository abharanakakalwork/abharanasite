"use client";
import Image from "next/image";
import { motion } from "framer-motion";

interface GallerySectionProps {
  images?: string[];
}

export default function GallerySection({ images = [] }: GallerySectionProps) {
  if (!images || images.length === 0) return null;

  return (
    <section className="relative py-24 px-6 bg-[#f1e4da]/30 border-t border-[#bc6746]/10">
      <div className="text-center mb-16">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="font-handwriting text-4xl text-[#bc6746] mb-2"
        >
          glimpses of
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-serif text-[#a55a3d] uppercase tracking-widest"
        >
          The Sanctuary Journey
        </motion.h2>
      </div>

      <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {images.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`relative w-full rounded-[40px] overflow-hidden shadow-2xl border border-white/40 group break-inside-avoid ${
              i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[3/4]"
            }`}
          >
            <Image 
              src={src} 
              alt={`Sanctuary glimpse ${i + 1}`} 
              fill 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-[#bc6746]/5 mix-blend-multiply transition-opacity group-hover:opacity-0"></div>
            
            {/* Subtle overlay accent */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Reflections of Essence</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

