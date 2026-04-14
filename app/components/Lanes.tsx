"use client";

import React from "react";

export default function Lanes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Side Vertical Lanes */}
      <div className="lane-v left-[5%] opacity-30 md:opacity-50" />
      <div className="lane-v right-[5%] opacity-30 md:opacity-50" />
      
      {/* Outer framing lanes (only on wide screens) */}
      <div className="hidden 2xl:block lane-v left-[15%] opacity-10" />
      <div className="hidden 2xl:block lane-v right-[15%] opacity-10" />

      {/* Grid lanes overlay (extremely subtle) */}
      <div className="absolute inset-0 grid-lanes opacity-20" />
    </div>
  );
}
