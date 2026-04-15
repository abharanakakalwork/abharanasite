"use client";
import Image from "next/image";

export default function IntroSection() {
  

  return (
    <section
      className="relative py-24 md:py-24 px-6 overflow-hidden bg-[#fffdf8] paper-grain"
    >
      {/* Subtle Background Watermark */}
      <div
        style={{ opacity: 0.04 }}
        className="absolute top-1/2 right-0 -translate-y-1/2 text-[12rem] md:text-[25rem] font-serif text-[#a55a3d] leading-none pointer-events-none select-none z-0 rotate-90 md:rotate-0 translate-x-1/2 md:translate-x-[15%]"
      >
        BREATHE
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-20 md:gap-32">
        {/* Left Side: Architectural Image */}
        <div className="relative w-full md:w-1/2 group">
          <div
            
            className="relative aspect-[3/4] md:aspect-[4/5] rounded-tr-[120px] md:rounded-tr-[240px] rounded-bl-[40px] md:rounded-bl-[80px] overflow-hidden shadow-[0_30px_90px_rgba(188,103,70,0.15)] z-20 border border-white/20"
          >
            <Image
              src="https://abharanakakal.b-cdn.net/assets/retreat.webp"
              alt="Serene sacred space"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover scale-105 transition-transform duration-[4s] group-hover:scale-100"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#bc6746]/10 to-transparent mix-blend-overlay" />
          </div>

          {/* Subtle accent blob */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#bc6746]/10 rounded-full blur-[80px] z-10" />
        </div>

        {/* Right Side: Structured Editorial Content */}
        <div
          
          className="relative z-30 w-full md:w-1/2 flex flex-col items-start"
        >
          <div className="flex items-center gap-4 mb-6 opacity-60">
            <span className="font-handwriting text-2xl text-[#bc6746] tracking-wide">
              The Invitation
            </span>
          </div>

          <h2 className="text-4xl md:text-7xl font-serif text-[#a55a3d] leading-[1.05] mb-10 tracking-tight">
            A Space to Pause, <br />
            Breathe,{" "}
            <span className="text-[#bc6746] italic font-light">
              &amp; Return
            </span>
          </h2>

          <div className="relative mb-12">
            {/* Handdrawn line with animation */}
            <svg
              className="w-56 h-4 text-[#bc6746]/40"
              viewBox="0 0 200 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 10Q50 2 100 12T195 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-xl md:text-2xl font-light text-[#4a3b32] leading-relaxed max-w-lg mb-12">
            Step away from the noise and sink deeply into yourself. Our sacred
            spaces are carefully curated to hold you through profound
            transformation, deep rest, and the reawakening of your feminine
            essence.
          </p>

          <div
            className="flex items-center gap-6 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full border border-[#bc6746]/30 flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rotate-[-45deg]"
              >
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </div>
            <span className="uppercase tracking-[0.2em] text-xs font-semibold text-[#bc6746]">
              Explore the Space
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}


