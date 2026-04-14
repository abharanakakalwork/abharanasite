"use client";

const testimonials = [
  {
    id: "t-1",
    quote:
      "I came in completely depleted. I left feeling like I had slept for three days. I didn't want to speak for hours after.",
    author: "Priya R., Mysore",
    rotation: "-rotate-2",
  },
  {
    id: "t-2",
    quote:
      "The gong bath reached places inside me that words or therapy hadn't been able to touch. Deeply grateful.",
    author: "Meera T., Bangalore",
    rotation: "rotate-3 translate-y-8",
  },
  {
    id: "t-3",
    quote:
      "I was skeptical. I'm a very rational person. But lying there, I felt a quiet I haven't felt in years. It was real.",
    author: "Kiran M., Mysore",
    rotation: "-rotate-1",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 px-6 flex flex-col items-center overflow-hidden">
      <h2 className="text-4xl md:text-5xl font-serif text-[#FFFDF8] text-center mb-6 text-shadow-soft">
        Voices from the Room
      </h2>
      <p className="font-handwriting text-3xl text-[#f1e4da] text-center mb-20 opacity-80">
        what people carry home
      </p>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-6xl w-full justify-center">
        {testimonials.map((t, i) => (
          <div
            key={t.id}
            className={`relative bg-[#fffdf8] p-8 md:p-10 shadow-xl w-full max-w-sm flex flex-col justify-between ${t.rotation} paper-grain border border-black/5`}
          >
            {/* Tape detail — same as retreats */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-16 h-4 bg-white/40 backdrop-blur-md rotate-1 shadow-sm" />

            <p className="font-handwriting text-md md:text-2xl text-[#4a3b32] leading-relaxed mb-8">
              &quot;{t.quote}&quot;
            </p>
            <p className="text-sm uppercase tracking-widest text-[#bc6746] font-medium">
              — {t.author}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
