import Image from "next/image";
import HeroSection from "./components/HeroSection";
import IntroSection from "./components/IntroSection";
import RetreatCards from "./components/RetreatCards";
import ExperienceSection from "./components/ExperienceSection";
import LocationsSection from "./components/LocationsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import GallerySection from "./components/GallerySection";
import FinalCTA from "./components/FinalCTA";

export default function RetreatsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden text-[#4a3b32] paper-grain pt-[70px]">
      {/* Global Background Image */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <Image
          src="/wellness-practices-self-care-world-health-day.webp"
          alt="Organic Watercolor Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <HeroSection />
      <IntroSection />
      <RetreatCards />
      <ExperienceSection />
      <LocationsSection />
      <TestimonialsSection />
      <GallerySection />
      <FinalCTA />
    </main>
  );
}
