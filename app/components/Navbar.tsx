"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudio } from "@/context/AudioContext";

const SOUND_HEALING_LINKS = [
  {
    name: "Sound Healing",
    href: "/sound-healing",
    desc: "Tibetan bowls, gong baths & live sessions",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Guided Meditations",
    href: "/sound-healing/guided-meditations",
    desc: "Frequency-tuned audio sessions library",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [soundDropdown, setSoundDropdown] = useState(false);
  const [mobileSoundOpen, setMobileSoundOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isBgPlaying, toggleBgAudio } = useAudio();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSoundDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setSoundDropdown(false);
    setIsOpen(false);
  }, [pathname]);

  const isSoundHealingActive = pathname?.startsWith("/sound-healing");

  const simpleLinks = [
    { name: "About", href: "/about" },
    { name: "Retreats", href: "/retreats" },
    { name: "From Within", href: "/within" },
    { name: "Contact", href: "/contact" },
  ];

  const textColor = scrolled ? "text-[#4a3b32]" : "text-white";
  const underlineBg = scrolled ? "bg-[#4a3b32]" : "bg-white";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-700 ease-in-out ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm py-3"
            : "bg-[#bc6746] py-5"
        }`}
      >
        <div className="relative max-w-[1800px] w-full mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link
              href="/"
              className="flex items-center transition-transform hover:scale-105 duration-500"
            >
              <img
                src={scrolled ? "https://abharanakakal.b-cdn.net/assets/logo-brown-01.svg" : "https://abharanakakal.b-cdn.net/assets/logo-white-02.svg"}
                alt="Abharana Kakal Logo"
                className="h-8 sm:h-10 md:h-12 w-75 object-contain transition-all duration-700"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 gap-10 items-center">
            {/* About */}
            <Link
              href="/about"
              className={`group relative text-[11px] font-bold tracking-[0.2em] uppercase py-2 transition-all duration-300 ${textColor}`}
            >
              About
              <span className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 origin-right transition-transform duration-500 ease-out group-hover:scale-x-100 group-hover:origin-left ${underlineBg}`} />
            </Link>

            {/* Sound Healing dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setSoundDropdown((v) => !v)}
                onMouseEnter={() => setSoundDropdown(true)}
                className={`group relative flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase py-2 transition-all duration-300 ${textColor} ${
                  isSoundHealingActive ? "opacity-100" : ""
                }`}
              >
                Sound Healing
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-300 ${soundDropdown ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {/* Active underline */}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[1px] transform transition-transform duration-500 ease-out ${underlineBg} ${
                    isSoundHealingActive ? "scale-x-100" : "scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left"
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              {soundDropdown && (
                <div
                  onMouseLeave={() => setSoundDropdown(false)}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[280px] rounded-2xl bg-[#fffdf8] border border-[#f1e4da] shadow-xl shadow-[#bc6746]/10 overflow-hidden z-50"
                >
                  {/* Arrow */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fffdf8] border-l border-t border-[#f1e4da] rotate-45" />

                  <div className="relative z-10 p-2">
                    {SOUND_HEALING_LINKS.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                            isActive
                              ? "bg-[#f1e4da]/60 text-[#bc6746]"
                              : "hover:bg-[#f9f0e8] text-[#4a3b32]"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex-shrink-0 transition-colors duration-200 ${
                              isActive ? "text-[#bc6746]" : "text-[#bc6746]/50 group-hover:text-[#bc6746]"
                            }`}
                          >
                            {link.icon}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-0.5">
                              {link.name}
                            </p>
                            <p className="text-[10px] text-[#4a3b32]/45 font-light leading-snug">
                              {link.desc}
                            </p>
                          </div>
                          {isActive && (
                            <div className="ml-auto mt-1 w-1.5 h-1.5 rounded-full bg-[#bc6746] flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Retreats */}
            <Link
              href="/retreats"
              className={`group relative text-[11px] font-bold tracking-[0.2em] uppercase py-2 transition-all duration-300 ${textColor}`}
            >
              Retreats
              <span className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 origin-right transition-transform duration-500 ease-out group-hover:scale-x-100 group-hover:origin-left ${underlineBg}`} />
            </Link>

            {/* From Within */}
            <Link
              href="/within"
              className={`group relative text-[11px] font-bold tracking-[0.2em] uppercase py-2 transition-all duration-300 ${textColor}`}
            >
              From Within
              <span className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 origin-right transition-transform duration-500 ease-out group-hover:scale-x-100 group-hover:origin-left ${underlineBg}`} />
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className={`group relative text-[11px] font-bold tracking-[0.2em] uppercase py-2 transition-all duration-300 ${textColor}`}
            >
              Contact
              <span className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 origin-right transition-transform duration-500 ease-out group-hover:scale-x-100 group-hover:origin-left ${underlineBg}`} />
            </Link>
          </div>

          {/* Right Action Group */}
          <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6">
            {/* Audio Toggle */}
            <button
              onClick={toggleBgAudio}
              aria-label={isBgPlaying ? "Pause Audio" : "Play Audio"}
              className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-500 hover:scale-110 ${
                scrolled
                  ? "border-[#bc6746]/30 text-[#bc6746] hover:bg-[#bc6746]/5"
                  : "border-white/30 text-white hover:bg-white/10"
              }`}
            >
              <svg
                className={`w-8 h-8 transition-transform duration-300 ${!isBgPlaying ? "ml-0.5" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                {isBgPlaying ? (
                  <>
                    <line x1="10" y1="8" x2="10" y2="16" />
                    <line x1="14" y1="8" x2="14" y2="16" />
                  </>
                ) : (
                  <polygon points="9 7 17 12 9 17 9 7" />
                )}
              </svg>
            </button>

            {/* Online Classes Button */}
            <Link
              href="/online-classes"
              className={`relative overflow-hidden group hidden md:flex items-center rounded-full pl-6 pr-2 py-1.5 gap-3 transition-all duration-500 border ${
                scrolled
                  ? "border-[#bc6746]/30 text-[#bc6746]"
                  : "border-white/30 text-white"
              }`}
            >
              <div
                className={`absolute inset-0 z-0 scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-x-100 ${
                  scrolled ? "bg-[#bc6746]/10" : "bg-white/10"
                }`}
              />
              <span className="relative z-10 text-[11px] font-bold tracking-[0.15em] uppercase">
                Online Classes
              </span>
              <div
                className={`relative z-10 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-500 group-hover:translate-x-1 ${
                  scrolled
                    ? "border-[#bc6746]/30 bg-[#bc6746]/5"
                    : "border-white/30 bg-white/5"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>

            {/* Instagram */}
            <Link
              href="https://www.instagram.com/abharana_kakal/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-500 hover:scale-110 ${
                scrolled
                  ? "border-[#bc6746]/30 text-[#bc6746] hover:bg-[#bc6746]/5"
                  : "border-white/30 text-white hover:bg-white/10"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`xl:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full transition-all duration-300 border ${
                scrolled
                  ? "border-[#4a3b32]/10 text-[#4a3b32]"
                  : "border-white/30 text-white"
              }`}
              aria-label="Toggle Menu"
            >
              <div className={`w-4 h-[1.5px] mb-1 transition-all duration-300 ${scrolled ? "bg-[#4a3b32]" : "bg-white"} ${isOpen ? "rotate-45 translate-y-[5.5px]" : ""}`} />
              <div className={`w-4 h-[1.5px] mb-1 transition-all duration-300 ${scrolled ? "bg-[#4a3b32]" : "bg-white"} ${isOpen ? "opacity-0" : ""}`} />
              <div className={`w-4 h-[1.5px] transition-all duration-300 ${scrolled ? "bg-[#4a3b32]" : "bg-white"} ${isOpen ? "-rotate-45 -translate-y-[5.5px]" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-[#bc6746] flex flex-col items-center justify-center">
          <div className="flex flex-col gap-7 items-center text-center w-full px-8">
            {/* Simple links */}
            {simpleLinks.slice(0, 1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white text-2xl font-medium uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
              >
                {link.name}
              </Link>
            ))}

            {/* Sound Healing accordion */}
            <div className="w-full flex flex-col items-center">
              <button
                onClick={() => setMobileSoundOpen((v) => !v)}
                className="text-white text-2xl font-medium uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-3"
              >
                Sound Healing
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className={`transition-transform duration-300 ${mobileSoundOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {mobileSoundOpen && (
                <div className="mt-4 flex flex-col gap-3 w-full max-w-xs">
                  {SOUND_HEALING_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
                    >
                      <div className="text-white/70">{link.icon}</div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold tracking-[0.15em] uppercase">{link.name}</p>
                        <p className="text-[10px] text-white/50 font-light">{link.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Remaining simple links */}
            {simpleLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white text-2xl font-medium uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile CTA */}
            <div className="mt-4 flex flex-col items-center gap-4">
              <Link
                href="/online-classes"
                onClick={() => setIsOpen(false)}
                className="text-white border border-white/30 rounded-full px-8 py-3 text-sm tracking-[0.15em] uppercase hover:bg-white/10 transition-colors"
              >
                Book Online Class
              </Link>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-6 w-10 h-10 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
