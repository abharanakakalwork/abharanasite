"use client";

import { useState, useEffect, useRef } from "react";

export default function AudioButton({ scrolled }: { scrolled?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleInteraction = () => {
      // Autoplay on first user interaction in the viewport
      if (!hasInteracted && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay blocked or failed", err);
        });
        setHasInteracted(true);
      }
    };

    if (!hasInteracted) {
      window.addEventListener("click", handleInteraction, { once: true });
      window.addEventListener("keydown", handleInteraction, { once: true });
      window.addEventListener("touchstart", handleInteraction, { once: true });
    }

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [hasInteracted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent global interaction trigger if we click this button first
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
    
    // Explicit click counts as an interaction
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/bg-audio.mp3" loop preload="auto" />
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        className={`group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border transition-all duration-500 transform hover:-translate-y-1 shrink-0 ${
          scrolled 
            ? "bg-[#bc6746] text-white border-[#bc6746]/10" 
            : "bg-white/10 text-white border-white/20 backdrop-blur-md"
        }`}
      >
        <div className={`absolute inset-0 rounded-full transition-transform duration-500 ease-out origin-left -translate-x-full group-hover:translate-x-0 -z-10 ${
          scrolled ? "bg-[#a55a3d]" : "bg-white"
        }`} />
        
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] transition-colors duration-300"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] transition-colors duration-300 translate-x-[1px]"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>
    </>
  );
}
