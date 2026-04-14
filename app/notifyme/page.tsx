"use client";

import { useEffect, useState } from "react";
import Antigravity from "../components/Antaigravity";

export default function page() {
  const [scale, setScale] = useState(1);

  // breathing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.1 : 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white overflow-hidden relative">
      {/* Cosmic Gradient Background */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          zIndex: 100,
          opacity:"0.5"
        }}
      >
        <Antigravity
          count={600}
          magnetRadius={6}
          ringRadius={4}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1}
          lerpSpeed={0.05}
          color="#5227FF"
          autoAnimate
          particleVariance={0.5}
          rotationSpeed={0}
          depthFactor={0.1}
          pulseSpeed={2}
          particleShape="sphere"
          fieldStrength={10}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-orange-900 opacity-80" />

      {/* Glow Orb */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(255,100,200,0.8), rgba(100,0,255,0.2), transparent)",
          transform: `scale(${scale})`,
          transition: "transform 4s ease-in-out",
        }}
      />

      {/* Content */}
      <div className="z-10 text-center px-6 max-w-xl">
        <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-6">
          Awaken. Align. Arrive.
        </h1>

        <p className="text-gray-300 mb-8 text-lg">
          Something sacred is coming.
        </p>

        {/* Email Capture */}
        <div className="flex flex-col md:flex-row gap-3 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none w-full md:w-auto"
          />
          <button className="px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition">
            Notify Me
          </button>
        </div>

        {/* Footer vibe */}
        <p className="text-xs text-gray-500 mt-10">
          ✨ Inner journey begins soon
        </p>
      </div>
    </main>
  );
}
