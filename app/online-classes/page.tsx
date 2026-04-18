"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import BookingFlow from "./components/BookingFlow";
import OnlineClassCard from "./components/OnlineClassCard";
import TrustSection from "./components/TrustSection";
import MonthlyFetcher from "./components/MonthlyFetcher";
import { yogaService } from "@/lib/api/client";
import { Offering } from "./components/flow/types";
import { toast } from "react-toastify";

const CATEGORIES = ["All", "Yoga", "Meditation", "Sound Healing"] as const;
type Category = (typeof CATEGORIES)[number];

const SORT_OPTIONS = [
  "Recommended",
  "Price: Low to High",
  "Price: High to Low",
  "Duration",
] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

function categorise(offering: Offering): Category {
  const t = offering.title.toLowerCase();
  if (t.includes("sound") || t.includes("singing")) return "Sound Healing";
  if (t.includes("meditat") || t.includes("mantra") || t.includes("breathwork"))
    return "Meditation";
  if (
    t.includes("yoga") ||
    t.includes("hatha") ||
    t.includes("vinyasa") ||
    t.includes("yin") ||
    t.includes("feminine") ||
    t.includes("restorat")
  )
    return "Yoga";
  return "Yoga"; // sensible default
}

export default function OnlineClassesPage() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null,
  );
  const [bookingMode, setBookingMode] = useState<"single" | "monthly" | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Outside click handler for dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    if (sortOpen) {
      window.addEventListener("mousedown", handleClick);
    }
    return () => window.removeEventListener("mousedown", handleClick);
  }, [sortOpen]);

  useEffect(() => {
    async function load() {
      try {
        const res = await yogaService.offerings.list();
        setOfferings(res.data.data);
      } catch {
        toast.error("Failed to load offerings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayed = useMemo(() => {
    let list = [...offerings];
    if (activeCategory !== "All") {
      list = list.filter((o) => categorise(o) === activeCategory);
    }

    // Helper to get numeric price safely
    const getPrice = (o: Offering) => Number(o.single_price) || 0;

    // Helper to normalize duration to minutes (e.g., "1 Hour" -> 60, "75 Mins" -> 75)
    const getMins = (s: string) => {
      if (!s) return 0;
      const lower = s.toLowerCase();
      const num = parseInt(lower) || 0;
      if (lower.includes("hr") || lower.includes("hour")) return num * 60;
      return num;
    };

    if (sortBy === "Price: Low to High") {
      list.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "Price: High to Low") {
      list.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "Duration") {
      list.sort((a, b) => getMins(a.duration) - getMins(b.duration));
    }

    return list;
  }, [offerings, activeCategory, sortBy]);

  const handleBook = (offering: Offering, mode: "single" | "monthly" | null = null) => {
    setSelectedOffering(offering);
    setBookingMode(mode);
    setIsBookingOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setSelectedOffering(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen text-[#2d2420] bg-[#f5ece5] overflow-x-hidden pt-[70px]">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%221%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.12%22%2F%3E%3C%2Fsvg%3E')]" />

      <AnimatePresence mode="wait">
        {!isBookingOpen ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {/* ── Hero ── */}
            <section className="pt-14 pb-10 px-6 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="text-4xl md:text-5xl font-serif font-semibold text-[#2d2420] leading-tight"
              >
                Book Your Wellness Session
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="mt-3 text-[15px] text-[#7a6a62] font-light"
              >
                Guided movements, deep stillness, and intentional breath.
              </motion.p>
            </section>

            {/* ── Filters & Sort ── */}
            <section className="px-6 pb-8">
              <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
                {/* Category pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 rounded-full text-[13px] font-medium border transition-all duration-200 ${
                        activeCategory === cat
                          ? "bg-[#bc6746] text-white border-[#bc6746] shadow-sm"
                          : "bg-white/70 text-[#4a3b32] border-[#d9cbc4] hover:border-[#bc6746] hover:text-[#bc6746]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortOpen((v) => !v)}
                    className="flex items-center gap-2 text-[13px] text-[#4a3b32] font-medium hover:text-[#bc6746] transition-colors"
                  >
                    <span className="text-[#7a6a62]">Sort by</span>
                    <span className="font-semibold">{sortBy}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-xl border border-[#e8ddd5] overflow-hidden w-52"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortBy(opt);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#f5ece5] transition-colors ${
                              sortBy === opt
                                ? "text-[#bc6746] font-semibold"
                                : "text-[#4a3b32]"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* ── Cards Grid ── */}
            <section className="px-6 pb-24">
              <div className="max-w-6xl mx-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 text-[#bc6746]">
                    <Loader2 className="animate-spin h-8 w-8 mb-4" />
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">
                      Loading...
                    </p>
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="text-center py-24 text-[#7a6a62]">
                    <p className="text-lg font-serif">
                      No sessions in this category yet.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {displayed.map((offering, idx) => (
                      <OnlineClassCard
                        key={offering.id}
                        offering={offering}
                        onBook={handleBook}
                        index={idx}
                        isLive={
                          offering.title.toLowerCase().includes("sound") ||
                          offering.title.toLowerCase().includes("live")
                        }
                      />
                    ))}
                  </motion.div>
                )}

                  <div className="mt-24">
                    <TrustSection />
                  </div>
              </div>
            </section>

            {/* Monthly Memberships Section */}
            {!loading && (
              <MonthlyFetcher onBook={handleBook} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="booking-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 py-12 px-6"
          >
            <div className="max-w-6xl mx-auto">
              <BookingFlow
                initialOffering={selectedOffering}
                initialMode={bookingMode}
                onClose={closeBooking}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close sort dropdown on outside click removed in favor of useRef handler */}
    </main>
  );
}
