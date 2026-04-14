"use client";

export default function FinalCTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden flex flex-col items-center text-center">
      {/* Deep Terracotta Wrap */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#a55a3d] via-[#bc6746] to-transparent mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Glowing Moon Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-[#fffdf8]/10 rounded-full blur-3xl z-0 pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <h2 className="text-5xl md:text-7xl font-serif text-[#FFFDF8] uppercase tracking-widest text-shadow-soft mb-8">
          Begin Your <br /> Journey Inward
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <button
            onClick={() =>
              document
                .getElementById("explore-retreats")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#f1e4da] text-[#a55a3d] uppercase tracking-widest text-sm font-semibold hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f1e4da]/20"
          >
            Book Your Immersion
          </button>
        </div>
      </div>
    </section>
  );
}
