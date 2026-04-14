"use client";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#f1e4da]/20 rounded-[40px] md:rounded-[60px] animate-pulse" />
});

export default function LocationsSection() {
  

  return (
    <section 
      style={{ position: 'relative' }}
      className="py-24 md:py-24 px-6 overflow-hidden bg-[#fffdf8] paper-grain"
    >
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-[60%] h-full bg-[#f1e4da]/10 organic-blob blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
        {/* Left Side: Editorial Context */}
        <div 
          className="w-full md:w-2/5 flex flex-col items-start"
        >
          <div className="flex items-center gap-4 mb-6 opacity-60">
            <span className="font-handwriting text-2xl text-[#bc6746] tracking-wide">The Sanctuary Map</span>
          </div>

          <h2 className="text-4xl md:text-7xl font-serif text-[#a55a3d] leading-[1.05] mb-10 tracking-tight">
            Sacred <br />
            <span className="text-[#bc6746] italic font-light">Geographies</span>
          </h2>

          <p className="text-xl md:text-2xl font-light text-[#4a3b32] leading-relaxed max-w-md mb-12">
            Explore our curated network of spiritual nodes across Bangalore. From urban sanctuaries to quiet lakeside retreats, each location is chosen for its unique energetic resonance and ability to hold space for deep transformation.
          </p>

          <div className="flex flex-col gap-6">
             <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full border border-[#bc6746]/20 flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
                   <span className="text-xs font-serif">01</span>
                </div>
                <span className="uppercase tracking-widest text-[10px] font-semibold text-[#bc6746]/60">Studio Sessions</span>
             </div>
             <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full border border-[#bc6746]/20 flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
                   <span className="text-xs font-serif">02</span>
                </div>
                <span className="uppercase tracking-widest text-[10px] font-semibold text-[#bc6746]/60">Private Immersions</span>
             </div>
             <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full border border-[#bc6746]/20 flex items-center justify-center text-[#bc6746] group-hover:bg-[#bc6746] group-hover:text-white transition-all duration-500">
                   <span className="text-xs font-serif">03</span>
                </div>
                <span className="uppercase tracking-widest text-[10px] font-semibold text-[#bc6746]/60">Urban Retreats</span>
             </div>
          </div>
        </div>

        {/* Right Side: Interactive Cartography */}
        <div
          className="w-full md:w-3/5 aspect-square md:aspect-[4/5] relative"
        >
          {/* Decorative shadowing for depth */}
          <div className="absolute -inset-4 bg-[#bc6746]/5 blur-[60px] rounded-[80px] pointer-events-none" />
          
          {/* The Actual Map */}
          <MapComponent />

          
        </div>
      </div>
    </section>
  );
}

