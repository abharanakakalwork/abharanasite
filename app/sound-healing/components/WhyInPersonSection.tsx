"use client";
import Image from "next/image";
import { useRef, memo } from "react";

const reasons = [
  {
    id: "01",
    label: "Full Presence",
    image: "https://abharanakakal.b-cdn.net/assets/guidedsession.webp",
    body: "Speakers flatten sound. In the room, vibrations travel through the floor and walls — your whole body becomes the instrument of receiving.",
    align: "left",
  },
  {
    id: "02",
    label: "Guided Space",
    image: "https://abharanakakal.b-cdn.net/assets/sh-guided.webp",
    body: "The practitioner holds the intention of the room. Something happens in a shared field of stillness that no recording can replicate.",
    align: "right",
  },
  {
    id: "03",
    label: "Time to Integrate",
    image: "https://abharanakakal.b-cdn.net/assets/sh-integrate.png",
    body: "After every session, we sit in silence together. You leave slowly, intentionally — carrying calm into the rest of your day.",
    align: "left",
  },
];

export default function WhyInPersonSection() {
  const containerRef = useRef(null);
  
  return (
    <section ref={containerRef} className="relative py-24 px-6 flex flex-col items-center bg-[#fffdf8] paper-grain overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-[#bc6746]/5 organic-blob blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[40rem] h-[40rem] bg-[#f1e4da]/40 organic-blob-alt blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div
          
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-serif text-[#a55a3d] mb-4">
            Why Experience In Person
          </h2>
          <p className="text-[#bc6746] font-handwriting text-3xl md:text-4xl">
            something shifts when you are there
          </p>
        </div>

        <div className="flex flex-col gap-40 md:gap-64">
          {reasons.map((r, idx) => (
            <Chapter key={r.id} reason={r} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Chapter = memo(function Chapter({ reason, index }: { reason: any; index: number }) {
  


  const isEven = index % 2 === 0;

  return (
    <div 
      
      style={{ position: 'relative' }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 md:gap-12`}
    >
      {/* Decorative Index Number */}
      <span 
        style={{ opacity: 0.05 }}
        className={`absolute -top-16 ${isEven ? '-left-12' : '-right-12'} text-[12rem] md:text-[22rem] font-serif text-[#a55a3d] leading-none pointer-events-none select-none z-0`}
      >
        {reason.id}
      </span>

      {/* Image Container */}
      <div 
        style={{ willChange: "transform" }}
        className="relative w-full md:w-3/5 aspect-[4/3] md:aspect-[16/10] rounded-[50px] overflow-hidden shadow-2xl z-10"
      >
         <Image 
          src={reason.image} 
          alt={reason.label} 
          fill 
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover transition-transform duration-[3s] hover:scale-105"
          priority={index === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4a3b32]/10 to-transparent" />
      </div>

      {/* Text Content - The "Bubble" */}
      <div 
          className={`relative z-20 w-[90%] md:w-2/5 p-10 md:p-16 soft-glass rounded-[80px_30px_90px_40px] flex flex-col justify-center items-start ${isEven ? 'md:-ml-16' : 'md:-mr-16'} -mt-20 md:mt-0`}
      >
        <span className="text-[#bc6746] font-handwriting text-2xl mb-4 opacity-80">
          {index === 0 ? "Presence" : index === 1 ? "Guided" : "Integration"}
        </span>
        <h3 className="text-3xl md:text-5xl font-serif text-[#a55a3d] mb-6 leading-tight">
          {reason.label}
        </h3>
        <p className="text-lg md:text-xl text-[#4a3b32]/90 leading-relaxed font-light">
          {reason.body}
        </p>
        
        {/* Subtle detail */}
        <div className="mt-10" />
      </div>
    </div>
  );
});



