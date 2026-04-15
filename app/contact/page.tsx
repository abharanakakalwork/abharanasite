import Image from "next/image";
import ContactForm from "./components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Book Yoga Classes with Abharana Kakal",
  description:
    "Get in touch with Abharana Kakal to book online yoga classes, sound healing sessions, or retreats. Enquire now and begin your journey inward.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen text-[#4a3b32] paper-grain pt-[70px] overflow-hidden">
      {/* Global Background Image (Inherited Style) */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <Image
          src="https://abharanakakal.b-cdn.net/assets/other-page-bg.jpeg"
          alt="Contact Background"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[#f1e4da]/40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Page Sections */}
      <ContactForm />

      {/* Bottom Subtle Gradient Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-[#f1e4da]/80 to-transparent pointer-events-none z-[-1]" />
    </main>
  );
}
