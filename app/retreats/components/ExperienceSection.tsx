"use client";
import Image from "next/image";
import { useRef, memo } from "react";
import { HandHeart, Waves, Sparkles, Flower2, CloudRain } from "lucide-react";

const experiences = [
  {
    id: "yoga",
    icon: <HandHeart strokeWidth={1} size={32} />,
    title: "Yoga",
    desc: "Embodied movement to release and restore.",
    img: "/exp-yoga.png",
    size: "md:col-span-1 md:row-span-2", // Vertical Tall
  },
  {
    id: "breathwork",
    icon: <CloudRain strokeWidth={1} size={32} />,
    title: "Pranayama",
    desc: "Harnessing prana for deep inner alignment.",
    img: "/exp-breathwork.png",
    size: "md:col-span-1 md:row-span-1", // Square
  },
  {
    id: "sound",
    icon: <Sparkles strokeWidth={1} size={32} />,
    title: "Sound Healing",
    desc: "Vibrational medicine for cellular clearing.",
    img: "/exp-sound.png",
    size: "md:col-span-2 md:row-span-1", // Horizontal Wide
  },
  {
    id: "circles",
    icon: <Flower2 strokeWidth={1} size={32} />,
    title: "Feminine Circles",
    desc: "Sacred space to share, heal, and connect.",
    img: "/exp-circle.png",
    size: "md:col-span-1 md:row-span-1", // Square
  },
  {
    id: "nature",
    icon: <Waves strokeWidth={1} size={32} />,
    title: "Nature",
    desc: "Grounding roots into the wild earth.",
    img: "/exp-nature.png",
    size: "md:col-span-1 md:row-span-1", // Square
  },
];

export default function ExperienceSection() {
  const containerRef = useRef(null);

  return (
    <section ref={containerRef} className="relative py-24 md:py-24 px-6 overflow-hidden bg-[#fffdf8] paper-grain">
      {/* Background Decorative Watermark - Optimized with static position */}
      <div 
        className="absolute top-1/2 left-0 -translate-y-1/2 text-[10rem] md:text-[20rem] font-serif text-[#a55a3d] leading-none pointer-events-none select-none z-0 rotate-[-90deg] translate-x-[-30%] opacity-[0.03]"
      >
        JOURNEY
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-7xl font-serif text-[#a55a3d] tracking-tight">The Experience</h2>
          <p className="mt-4 text-[#bc6746] font-handwriting text-3xl md:text-4xl">what awaits you</p>
        </div>

        {/* The Mosaic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[350px]">
          {experiences.map((exp, idx) => (
            <ExperienceTile key={exp.id} exp={exp} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

const ExperienceTile = memo(function ExperienceTile({ exp, index }: { exp: any; index: number }) {
  
  return (
    <div
      className={`relative group overflow-hidden rounded-[40px] shadow-xl hover:shadow-[0_40px_100px_rgba(188,103,70,0.15)] transition-all duration-700 ${exp.size}`}
    >
      {/* Image Layer */}
      <div className="absolute inset-0 z-0 ">
         <Image 
          src={exp.img} 
          alt={exp.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-[#4a3b32]/10 mix-blend-multiply opacity-60 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full justify-between p-8 md:p-10 text-[#FFFDF8]">
        {/* Top Segment: Icon */}
        <div 
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md opacity-80"
        >
          {exp.icon}
        </div>

        {/* Bottom Segment: Text */}
        <div className="">
           <h3 className="text-3xl font-serif mb-2 leading-tight">
             {exp.title}
           </h3>
           <p className="text-lg font-light opacity-80 leading-relaxed max-w-[240px]">
             {exp.desc}
           </p>
        </div>
      </div>
      
      {/* Subtle border accent */}
      <div className="absolute inset-0 border border-white/10 rounded-[40px] pointer-events-none z-20" />
    </div>
  );
});


