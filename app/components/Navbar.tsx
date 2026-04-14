"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { useAudio } from "@/context/AudioContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isBgPlaying, toggleBgAudio } = useAudio();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Sound Healing", href: "/sound-healing" },
    { name: "Retreats", href: "/retreats" },
    { name: "From Within", href: "/within" },
    { name: "Contact", href: "/contact" },
  ];

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
          {/* Logo - Left Aligned */}
          <div className="flex-1 flex justify-start">
            <Link
              href="/"
              className="flex items-center transition-transform hover:scale-105 duration-500"
            >
              <img
                src={scrolled ? "/logo-brown-01.svg" : "/logo-white-02.svg"}
                alt="Abharana Kakal Logo"
                className="h-8 sm:h-10 md:h-12 w-75 object-contain transition-all duration-700"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Absolute Centered */}
          <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 gap-10 items-center">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative text-[11px] font-bold tracking-[0.2em] uppercase py-2 transition-all duration-300 ${
                  scrolled ? "text-[#4a3b32]" : "text-white"
                }`}
              >
                {item.name}
                {/* Animated Underline */}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 origin-right transition-transform duration-500 ease-out group-hover:scale-x-100 group-hover:origin-left ${
                    scrolled ? "bg-[#4a3b32]" : "bg-white"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Action Group */}
          <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6">
            {/* 1. Audio Visual Toggle with NEW Minimalist Play/Pause Icons */}
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
                  /* Minimalist Thin Pause Lines */
                  <>
                    <line x1="10" y1="8" x2="10" y2="16" />
                    <line x1="14" y1="8" x2="14" y2="16" />
                  </>
                ) : (
                  /* Minimalist Thin Play Triangle */
                  <polygon points="9 7 17 12 9 17 9 7" />
                )}
              </svg>
            </button>

            {/* 2. Online Classes Button (Sweep Animation) */}
            <Link
              href="/online-classes"
              className={`relative overflow-hidden group hidden md:flex items-center rounded-full pl-6 pr-2 py-1.5 gap-3 transition-all duration-500 border ${
                scrolled
                  ? "border-[#bc6746]/30 text-[#bc6746]"
                  : "border-white/30 text-white"
              }`}
            >
              {/* Background Fill Animation */}
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
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </Link>

            {/* 3. Instagram Button */}
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

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`xl:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full transition-all duration-300 border ${
                scrolled
                  ? "border-[#4a3b32]/10 text-[#4a3b32]"
                  : "border-white/30 text-white"
              }`}
              aria-label="Toggle Menu"
            >
              <div
                className={`w-4 h-[1.5px] mb-1 transition-all duration-300 ${scrolled ? "bg-[#4a3b32]" : "bg-white"} ${isOpen ? "rotate-45 translate-y-[5.5px]" : ""}`}
              />
              <div
                className={`w-4 h-[1.5px] mb-1 transition-all duration-300 ${scrolled ? "bg-[#4a3b32]" : "bg-white"} ${isOpen ? "opacity-0" : ""}`}
              />
              <div
                className={`w-4 h-[1.5px] transition-all duration-300 ${scrolled ? "bg-[#4a3b32]" : "bg-white"} ${isOpen ? "-rotate-45 -translate-y-[5.5px]" : ""}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-[#bc6746] flex flex-col items-center justify-center">
          <div className="flex flex-col gap-8 items-center text-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-white text-2xl font-medium uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Actions */}
            <div className="mt-8 flex flex-col items-center gap-6">
              <Link
                href="/online-classes"
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
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
