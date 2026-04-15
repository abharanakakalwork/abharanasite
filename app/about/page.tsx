import Image from "next/image";
import AboutHero from "./components/AboutHero";
import JourneySection from "./components/JourneySection";
import WhatIOffer from "./components/WhatIOffer";
import ApproachSection from "./components/ApproachSection";
import WhyIDoThis from "./components/WhyIDoThis";
import TestimonialsSection from "./components/TestimonialsSection";
import AboutFinalCTA from "./components/AboutFinalCTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Abharana Kakal | Online Yoga Teacher & Sound Healer",
  description:
    "Learn about Abharana Kakal, an experienced online yoga teacher and sound healer offering retreats and feminine awakening programs from Mysore and Bangalore.",
};

export default function AboutPage() {
  return (
    <main 
      style={{ position: 'relative' }}
      className="min-h-screen text-[#4a3b32] paper-grain overflow-x-hidden"
    >
      {/* Global Background Image */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <Image
          src="/other-page-bg.jpeg"
          alt="About Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[#f1e4da]/20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Page Sections */}
      <AboutHero />
      
      <div className="relative z-10 w-full space-y-0">
        <JourneySection />
        <WhatIOffer />
        <ApproachSection />
        <WhyIDoThis />
        <TestimonialsSection />
        <AboutFinalCTA />
      </div>

      {/* Bottom Subtle Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-[#f1e4da]/80 to-transparent pointer-events-none z-[-1]" />
    </main>
  );
}
