"use client";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { type BlogPost } from "../data";
import BlockRenderer from "./BlockRenderer";

interface Props {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

const categoryColors: Record<string, string> = {
  Yoga: "#7a9e7e",
  "Sound Healing": "#8b7ab5",
  "Feminine Energy": "#c47a8a",
  Retreats: "#bc6746",
};

function BackArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export default function WithinDetailClient({ post, relatedPosts }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const catColor = categoryColors[post.category] ?? "#bc6746";

  return (
    <>
      {/* ── Full-Screen Cinematic Hero ──────────────── */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Parallax Background Stage */}
        <div className="absolute inset-0 z-0">
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          </motion.div>
          {/* Multi-stop dark overlay for visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />
        </div>

        {/* Floating "Back" Link (White) */}
        <div className="absolute top-10 left-10 z-20">
          <motion.div>
            <Link
              href="/within"
              id="within-detail-back"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300"
            >
              <BackArrow />
              Back to Within
            </Link>
          </motion.div>
        </div>

        {/* Centered High-Contrast Heading Section */}
        <div className="relative z-10 max-w-5xl px-6 text-center">
          <motion.div className="flex items-center justify-center gap-4 mb-10">
            <span
              className="px-5 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white shadow-xl shadow-black/20"
              style={{ backgroundColor: catColor }}
            >
              {post.category}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="flex items-center gap-3 text-white/70 text-[10px] uppercase tracking-[0.3em] font-bold">
              <span>{post.date}</span>
              <span className="w-1 text-white/20">•</span>
              <span>{post.readTime}</span>
            </div>
          </motion.div>

          <motion.h1 className="font-serif text-5xl md:text-7xl lg:text-9xl text-[#FFFDF8] leading-[1.05] tracking-tight mb-12 drop-shadow-2xl">
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.8 }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"
          />
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-bold">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent opacity-50" />
        </motion.div>
      </section>

      {/* ── Article Content (Sacred Scroll Backplate) ────── */}
      <section className="relative py-24 px-6 paper-grain">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-[#1a1008]/40 backdrop-blur-2xl p-8 md:p-20 rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden"
          >
            {/* Scroll decorative flare */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Article Content */}
            <div className="prose prose-invert max-w-none relative z-10">
              {typeof post.content === "string" ? (
                <BlockRenderer content={post.content} />
              ) : (
                <>
                  {/* Legacy Structured Content */}
                  <div className="mb-16">
                    {/* Decorative divider */}
                    <div className="flex items-center gap-4 mb-16">
                      <div className="flex-1 h-px bg-[#bc6746]/30" />
                      <div className="w-2 h-2 rounded-full bg-[#bc6746]/50" />
                      <div className="flex-1 h-px bg-[#bc6746]/30" />
                    </div>

                    <p className="text-2xl md:text-3xl text-[#FFFDF8] font-serif leading-relaxed italic mb-14 text-center">
                      {post.content.intro}
                    </p>
                  </div>

                  {/* Content sections */}
                  {post.content.sections.map((section, i) => (
                    <div key={i} className="mb-16 group">
                      <h2 className="font-serif text-3xl md:text-4xl text-[#f1e4da] mb-6 tracking-wide group-hover:text-white transition-colors duration-500">
                        {section.heading}
                      </h2>
                      <p className="text-[#f1e4da]/90 text-lg md:text-xl leading-loose font-light">
                        {section.body}
                      </p>
                    </div>
                  ))}

                  {/* Pull quote */}
                  {post.content.pullQuote && (
                    <blockquote className="relative my-24 px-12 py-16 rounded-[2rem] overflow-hidden text-center">
                      {/* Sub-glass effect for the quote */}
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10" />
                      
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{
                          background: `linear-gradient(to bottom, ${catColor}, transparent)`,
                        }}
                      />
                      
                      <span
                        className="block font-serif text-8xl leading-none opacity-20 mb-4 select-none"
                        style={{ color: catColor }}
                      >
                        &ldquo;
                      </span>
                      
                      <p className="relative z-10 font-serif text-2xl md:text-4xl text-white italic leading-[1.4] px-4">
                        {post.content.pullQuote}
                      </p>
                    </blockquote>
                  )}

                  {/* Closing paragraph */}
                  <div className="mt-16 pt-16 border-t border-white/10">
                    <p className="text-[#f1e4da]/80 text-lg md:text-xl leading-loose italic">
                      {post.content.closing}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* End divider */}
          <div className="flex flex-col items-center gap-6 mt-20 opacity-50">
            <div className="w-12 h-px bg-[#bc6746]/50" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#bc6746]">
              End of Resonance
            </p>
          </div>
        </div>
      </section>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/retreats"
              id="within-detail-cta-retreats"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#bc6746] text-[#FFFDF8] uppercase tracking-widest text-xs font-semibold hover:bg-[#a55a3d] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#bc6746]/30 text-center"
            >
              Explore Retreats
            </Link>
            <Link
              href="/contact"
              id="within-detail-cta-contact"
              className="w-full sm:w-auto px-8 py-3 rounded-full border border-[#FFFDF8]/25 text-[#f1e4da] uppercase tracking-widest text-xs font-semibold hover:bg-[#FFFDF8]/8 transition-all duration-300 hover:-translate-y-1 text-center"
            >
              Book a Session
            </Link>
          </motion.div>

      {/* ── Related Posts ─────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="relative py-20 px-6">
          {/* Subtle separator */}
          <div className="max-w-2xl mx-auto mb-14 flex items-center gap-6">
            <p className="text-center text-[10px] uppercase tracking-[0.3em] font-medium text-[#f1e4da]/40">
              Explore Sacred Spaces
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map((related, i) => {
              const rColor = categoryColors[related.category] ?? "#bc6746";
              return (
                <motion.article
                  key={related.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group"
                >
                  <Link
                    href={`/within/${related.slug}`}
                    id={`within-related-${related.slug}`}
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-5 border border-white/8">
                      <Image
                        src={related.image}
                        alt={related.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1008]/50 to-transparent" />
                      {/* Category badge */}
                      <div
                        className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest text-white/90 font-semibold"
                        style={{ backgroundColor: rColor + "cc" }}
                      >
                        {related.category}
                      </div>
                    </div>

                    <div className="px-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[11px] text-[#f1e4da]/50 uppercase tracking-widest">
                          {related.date}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#bc6746]/40" />
                        <span className="text-[11px] text-[#f1e4da]/50 uppercase tracking-widest">
                          {related.readTime}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg md:text-xl text-[#FFFDF8] group-hover:text-[#f1e4da] transition-colors duration-300 leading-snug mb-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-[#f1e4da]/60 leading-relaxed line-clamp-2">
                        {related.excerpt}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[#bc6746] text-xs uppercase tracking-widest font-medium">
                        <span>Read</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>

          {/* View all link */}
          <div className="flex justify-center mt-14">
            <Link
              href="/within"
              id="within-detail-view-all"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[#FFFDF8]/20 text-[#f1e4da]/70 hover:text-[#f1e4da] hover:border-[#FFFDF8]/40 uppercase tracking-widest text-xs font-medium transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>View All Entries Within</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* ── Bottom spacer ─────────────────────────────── */}
      <div className="h-16" />
    </>
  );
}
