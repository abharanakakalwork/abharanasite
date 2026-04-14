"use client";
import Image from "next/image";

export default function IntroSection() {


  return (
    <section
      style={{ position: 'relative' }}
      className="py-24 md:py-24 px-6 overflow-hidden bg-[#fffdf8] paper-grain"
    >
      {/* Background Decorative Watermark */}
      <div
        style={{ opacity: 0.03 }}
        className="absolute top-1/2 left-0 -translate-y-1/2 text-[10rem] md:text-[20rem] font-serif text-[#a55a3d] leading-none pointer-events-none select-none z-0 rotate-[-90deg] translate-x-[-35%]"
      >
        RESONANCE
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-32">
        {/* Left Side: Floating Narrative Column */}
        <div
          className="w-full md:w-2/5 flex flex-col items-start"
        >
          <div className="flex items-center gap-4 mb-6 opacity-60">
            <span className="font-handwriting text-2xl text-[#bc6746] tracking-wide">The Sound Healing Invitation</span>
          </div>

          <h2
            
            className="text-5xl md:text-8xl font-serif text-[#a55a3d] leading-[1] mb-12 tracking-tight"
          >
            Ancient Medicine, <br />
            <span className="text-[#bc6746] italic font-light">
              Modern Stillness
            </span>
          </h2>

          <div
            
            className="space-y-8"
          >
            <p className="text-xl md:text-2xl font-light text-[#4a3b32] leading-relaxed">
              Sound is one of the oldest medicines. Tibetan singing bowls,
              crystal bowls, and voice carry frequencies the nervous system
              recognises — and responds to with immediate softening.
            </p>
            <p className="text-xl md:text-2xl font-light text-[#4a3b32]/80 leading-relaxed border-l-2 border-[#bc6746]/20 pl-8 italic">
              You lie down and simply receive. Layers of vibration wash through
              you, calming the mind, releasing held tension, and guiding you
              into deep rest. No experience needed. Just a willingness to be
              still.
            </p>
          </div>

          {/* Decorative index/touch */}
          <div
            
            className="mt-16 text-[#bc6746]/40"
          />
        </div>

        {/* Right Side: Architectural Imagery Column */}
        <div className="w-full md:w-3/5 relative">
          <div
            
            className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-t-[200px] rounded-b-[40px] shadow-2xl"
          >
            <Image
              src="/soundhealing.webp"
              alt="Ancient Tibetan Singing Bowls"
              fill
              className="object-cover"
              priority
            />
            {/* Soft gradient overlay for text legibility if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

         
        </div>
      </div>
    </section>
  );
}

