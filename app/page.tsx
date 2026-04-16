"use client";

import Image from "next/image";
import Antigravity from "./components/Antaigravity";
import CircularText from "./components/CircularText";
import OnlineClassesFloatingButton from "./components/OnlineClassesFloatingButton";

export default function Home() {

  return (
    <div className="relative">
      <OnlineClassesFloatingButton />
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          zIndex: 2,
          opacity: "0.5",
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
          color="#bc6746"
          autoAnimate
          particleVariance={0.5}
          rotationSpeed={0}
          depthFactor={0.1}
          pulseSpeed={2}
          particleShape="sphere"
          fieldStrength={10}
        />
      </div>
      <main className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden ">
        {/* Full Background Section Image */}

        <div className="absolute inset-0 z-0 pointer-events-none  mix-blend-screen w-full h-screen">
          <Image
            src="https://abharanakakal.b-cdn.net/assets/bg-images.webp"
            alt="Meditating figure"
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover object-center "
          />
        </div>

        <div className="relative  w-full flex flex-col items-center justify-between mt-6">
          <div className="flex flex-col items-center  justify-center">
            {/* Center Focus Area */}
            <div className="relative flex flex-col items-center justify-center h-full w-full min-h-[60vh] md:min-h-[80vh] pt-[15vh]">
              <CircularText
                text="Yoga ✦ Sound Healing ✦ From Within ✦ Feminine Circles "
                onHover="speedUp"
                spinDuration={20}
                className="custom-class"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
