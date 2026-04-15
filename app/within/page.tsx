import Image from "next/image";
import WithinHero from "./components/WithinHero";
import BlogGrid from "./components/BlogGrid";
import WithinCTA from "./components/WithinCTA";

export const metadata = {
  title: "From Within | Yoga & Mindfulness Blog by Abharana Kakal",
  description:
    "Explore “From Within,” a yoga and mindfulness blog by Abharana Kakal. Discover insights on meditation, spiritual growth, feminine awakening, and holistic wellness.",
};

export default function WithinPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden text-[#4a3b32] paper-grain">
      {/* Background Image — same as retreats */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <Image
          src="https://abharanakakal.b-cdn.net/assets/wellness-practices-self-care-world-health-day.webp"
          alt="Soft nature background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#f1e4da]/20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <WithinHero />
      <BlogGrid />
      <WithinCTA />
    </main>
  );
}
