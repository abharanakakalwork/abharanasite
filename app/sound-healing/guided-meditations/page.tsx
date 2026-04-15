import AudioLibrary from "../components/AudioLibrary";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guided Meditation Audio | Abharana Kakal",
  description:
    "Listen to guided meditation audio by Abharana Kakal. Experience deep relaxation, sound healing, and inner balance through calming, immersive sessions.",
};

export default function GuidedMeditationsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#fffdf8] text-[#4a3b32] pt-[70px]">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 pt-8 pb-0">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#4a3b32]/40">
          <Link href="/sound-healing" className="hover:text-[#bc6746] transition-colors">
            Sound Healing
          </Link>
          <span className="text-[#bc6746]/50">›</span>
          <span className="text-[#bc6746]">Guided Meditation Sessions</span>
        </div>
      </div>

      <AudioLibrary />
    </main>
  );
}
