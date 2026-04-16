'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on admin panel
  if (pathname?.startsWith("/admin")) return null;

  const isHomePage = pathname === "/";

  return (
    <footer className={`w-full bg-[#f1e4da] relative z-3 px-6 py-16 md:py-24 border-t border-black/5 mt-auto ${isHomePage ? 'hidden md:block' : ''}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* SECTION 1 — CLOSING LINE */}
        <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
          <img 
            src="https://abharanakakal.b-cdn.net/assets/Abharana%20Kakal%20-%20brown%20-%20monogram%20only.svg" 
            alt="Abharana Kakal Monogram" 
            className="w-48 h-48 md:w-36 md:h-36 mb-8 opacity-100 object-contain"
          />
          <p className="font-handwriting text-3xl md:text-5xl text-[#bc6746] leading-relaxed opacity-90 transition-opacity hover:opacity-100">
            Move gently. Breathe deeply.
            <br />
            Return to yourself.
          </p>
        </div>

        {/* SECTION 2 — NAVIGATION LINKS */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 uppercase tracking-[0.2em] text-[11px] md:text-[13px] font-medium text-[#a55a3d]">
          {[
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
            { name: "Sound Healing", href: "/sound-healing" },
            { name: "Retreats", href: "/retreats" },
            { name: "From Within", href: "/within" },
            { name: "Contact", href: "/contact" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:text-[#bc6746] transition-colors duration-300 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#bc6746] transition-all duration-300 group-hover:w-full opacity-50" />
            </Link>
          ))}
        </div>

        {/* SECTION 3 — CONTACT (MINIMAL) & SECTION 4 — SOCIAL */}
        <div className="flex flex-col items-center gap-6 mb-16 text-center">
          <div className="space-y-2">
            <a
              href="mailto:yoga@abharanakakal.com"
              className="text-[#bc6746] text-sm md:text-base hover:opacity-75 transition-opacity"
            >
              yoga@abharanakakal.com
            </a>
            <p className="text-[#a55a3d]/70 text-[12px] md:text-sm tracking-widest uppercase">
              Bangalore / Mysore
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://www.instagram.com/abharana_kakal/"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#bc6746] hover:scale-110 transition-transform duration-300 p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 md:w-6 md:h-6"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
          </div>
        </div>

        {/* SECTION 5 — SUB-FOOTER */}
        <div className="w-full pt-8 border-t text-md border-[#bc6746]/10 flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] md:text-[11px] tracking-[0.1em] text-[#a55a3d]/50 uppercase">
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/downloads"
              className="hover:text-[#bc6746] text-black transition-colors text-md font-semibold"
            >
              Downloads
            </Link>
            <span>·</span>
            <Link
              href="/privacy-policy"
              className="hover:text-[#bc6746] text-black transition-colors text-md font-semibold"
            >
              Privacy Policy
            </Link>
            <span>·</span>
            <Link
              href="/terms-conditions"
              className="hover:text-[#bc6746] text-black transition-colors text-md font-semibold"
            >
              Terms
            </Link>
            <span>·</span>
            <Link
              href="/refund-policy"
              className="hover:text-[#bc6746] text-black transition-colors text-md font-semibold"
            >
              Refund Policy
            </Link>
          </div>
          <span className="hidden md:inline text-md font-semibold">·</span>
          <span className="text-md font-semibold text-black">© {currentYear} Abharana Kakal</span>
        </div>
      </div>
    </footer>
  );
}
