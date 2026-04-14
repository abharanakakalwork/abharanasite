"use client";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { type Category as StaticCategory } from "../data";
import { blogService } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

const PER_PAGE = 6;

const categoryColors: Record<string, string> = {
  Yoga: "#7a9e7e",
  "Sound Healing": "#8b7ab5",
  "Feminine Energy": "#c47a8a",
  Retreats: "#bc6746",
  Wisdom: "#bc6746",
};

interface UnifiedPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  isDynamic?: boolean;
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function BlogGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);
  const [dynamicPosts, setDynamicPosts] = useState<UnifiedPost[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResonances = async () => {
      try {
        const [postsRes, catsRes] = await Promise.all([
          blogService.posts.list(),
          blogService.categories.list()
        ]);

        if (postsRes.data.success) {
          const transformed: UnifiedPost[] = postsRes.data.data.map((p: any) => ({
            slug: p.id,
            title: p.title,
            excerpt: p.content.length > 150 && p.content.startsWith('{') ? 'Exploring the depths of inner awareness through sacred practice...' : p.content.substring(0, 160) + '...',
            date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            category: p.journal_categories?.name || 'Wisdom',
            image: p.image_url || '/within-yoga.png',
            readTime: 'Read',
            isDynamic: true
          }));
          setDynamicPosts(transformed);
        }

        if (catsRes.data.success) {
          setCategories(catsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic resonances:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResonances();
  }, []);

  const allPosts: UnifiedPost[] = dynamicPosts;

  const filtered =
    activeCategory === "All"
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const filterList = ["All", ...categories.map(c => c.name)];

  if (loading && dynamicPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#bc6746]/50" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#a55a3d]/40">Unfolding the sacred archives...</p>
      </div>
    );
  }

  return (
    <section className="relative pb-24 px-6 ">
      <div className="max-w-5xl mx-auto">
        {/* ── Category Filters ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {filterList.map((cat) => (
            <button
              key={cat}
              id={`within-filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => {
                setActiveCategory(cat);
                setVisibleCount(PER_PAGE);
              }}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-[#bc6746] text-[#FFFDF8] border-[#bc6746] shadow-[0_4px_12px_rgba(188,103,70,0.35)]"
                  : "bg-transparent text-[#f1e4da] border-[#FFFDF8]/30 hover:border-[#bc6746]/60 hover:text-[#bc6746]"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ── Featured Card ──────────────────────── */}
            {featured && (
              <Link
                href={`/within/${featured.slug}`}
                id={`within-featured-${featured.slug}`}
                className="group block mb-24"
              >
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col md:flex-row gap-8 md:gap-16 items-center"
                >
                  <div className="w-full md:w-3/5">
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                      <Image
                        src={featured.image}
                        alt={featured.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-2/5 flex flex-col items-start px-2">
                    <div className="flex items-center gap-4 mb-6">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] text-white font-bold"
                        style={{ backgroundColor: categoryColors[featured.category] ?? "#bc6746" }}
                      >
                        {featured.category}
                      </span>
                      <span className="text-[10px] text-[#4a3b32]/50 uppercase tracking-[0.2em] font-bold">
                        {featured.date}
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl md:text-5xl text-[#ffffff] leading-tight mb-6 group-hover:text-[#bc6746] transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-base text-[#ffff]/70 leading-relaxed mb-8 italic line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-[#bc6746] text-[10px] uppercase tracking-[0.3em] font-bold">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>
                </motion.article>
              </Link>
            )}

            {/* ── Blog Grid ──────────────────────────── */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {rest.map((post, i) => {
                  const catColor = categoryColors[post.category] ?? "#bc6746";
                  return (
                    <motion.article
                      key={post.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="group flex flex-col h-full"
                    >
                      <Link href={`/within/${post.slug}`} id={`within-card-${post.slug}`} className="flex flex-col h-full">
                        {/* Image */}
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 shadow-sm ring-1 ring-[#f1e4da]/50">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 px-1">
                          <div className="flex items-center justify-between mb-4">
                            <span
                              className="text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: catColor }}
                            >
                              {post.category}
                            </span>
                            <span className="text-[10px] text-[#4a3b32]/40 uppercase tracking-[0.2em] font-bold">
                              {post.date}
                            </span>
                          </div>

                          <h2 className="text-xl md:text-2xl font-serif text-[#4a3b32] mb-4 group-hover:text-[#bc6746] transition-colors leading-tight min-h-[3rem]">
                            {post.title}
                          </h2>

                          <p className="text-sm text-[#4a3b32]/70 leading-relaxed font-light line-clamp-2 mb-6">
                            {post.excerpt}
                          </p>

                          <div className="mt-auto flex items-center gap-2 text-[#bc6746] text-[10px] uppercase tracking-[0.2em] font-bold">
                            <span>Read resonance</span>
                            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2" />
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Load More */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-20"
          >
            <button
              id="within-load-more"
              onClick={() => setVisibleCount((n) => n + PER_PAGE)}
              className="px-12 py-4 rounded-full border border-[#bc6746]/30 text-[#bc6746] uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#bc6746] hover:text-white hover:shadow-xl hover:shadow-[#bc6746]/20 transition-all duration-500"
            >
              Unfold More
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
