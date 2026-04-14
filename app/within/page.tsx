import Image from "next/image";
import WithinHero from "./components/WithinHero";
import BlogGrid from "./components/BlogGrid";
import WithinCTA from "./components/WithinCTA";

export const metadata = {
  title: "Within | Abharana Kakal",
  description:
    "Reflections on yoga, feminine awareness, and inner presence from Abharana Kakal. Stories, practices, and wisdom for the journey inward.",
};

export default function WithinPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden text-[#4a3b32] paper-grain">
      {/* Background Image — same as retreats */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <Image
          src="/wellness-practices-self-care-world-health-day.webp"
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
