"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Star, Users } from "lucide-react";
import Image from "next/image";
import { Session, Offering } from "./types";
import { cn, formatDateLocal, formatTime12h } from "@/lib/utils";

// ─── Week helpers ──────────────────────────────────────────────────────────
function getWeekDays(anchor: Date): Date[] {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - ((day + 6) % 7)); // rewind to Monday
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(d);
    dt.setDate(d.getDate() + i);
    return dt;
  });
}

const DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const imageMap: Record<string, string> = {
  Hatha: "https://abharanakakal.b-cdn.net/assets/exp-yoga.png",
  Vinyasa: "https://abharanakakal.b-cdn.net/assets/exp-yoga.png",
  Breathwork: "https://abharanakakal.b-cdn.net/assets/exp-breathwork.png",
  Sound: "https://abharanakakal.b-cdn.net/assets/exp-sound.png",
  Meditation: "https://abharanakakal.b-cdn.net/assets/sh-guided.webp",
  Deep: "https://abharanakakal.b-cdn.net/assets/sh-intro-vessels.png",
  Sacred: "https://abharanakakal.b-cdn.net/assets/exp-nature.png",
  Yin: "https://abharanakakal.b-cdn.net/assets/about-journey-mood.png",
  Feminine: "https://abharanakakal.b-cdn.net/assets/exp-yoga.png",
  Mantra: "https://abharanakakal.b-cdn.net/assets/sh-guided.webp",
};

// ─── Types ─────────────────────────────────────────────────────────────────
interface DateTimeStepProps {
  selectedDate: Date | null;
  selectedSession: Session | null;
  onSelectDate: (date: Date) => void;
  onSelectSession: (session: Session) => void;
  availabilityData: { sessions: Session[]; exceptions: any[] };
  offeringId?: string;
  offering?: Offering | null;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function DateTimeStep({
  selectedDate,
  selectedSession,
  onSelectDate,
  onSelectSession,
  availabilityData,
  offeringId,
  offering,
}: DateTimeStepProps) {
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);

  // Visual filter state (UI-only)
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [activeEnergy, setActiveEnergy] = useState<string | null>(null);
  const [liveOnly, setLiveOnly] = useState(false);

  // Which dates have sessions (with dots)?
  const datesWithSessions = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    for (const s of availabilityData.sessions) {
      if (offeringId && s.offering_id !== offeringId) continue;
      if (s.is_blocked || s.status === "cancelled") continue;
      const end = new Date(`${s.session_date}T${s.start_time}`);
      end.setMinutes(end.getMinutes() + (s.duration_minutes || 60));
      if (now < end) set.add(s.session_date);
    }
    return set;
  }, [availabilityData.sessions, offeringId]);

  // Slots for the selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = formatDateLocal(selectedDate);
    const now = new Date();
    return availabilityData.sessions.filter((s) => {
      if (s.session_date !== dateStr) return false;
      if (offeringId && s.offering_id !== offeringId) return false;
      const start = new Date(`${s.session_date}T${s.start_time}`);
      const cool = new Date(
        start.getTime() - (s.cooldown_minutes || 60) * 60000,
      );
      const end = new Date(
        start.getTime() + (s.duration_minutes || 60) * 60000,
      );
      if (now > end || now > cool) return false;
      if (s.is_blocked || s.status === "cancelled") return false;
      return true;
    });
  }, [selectedDate, availabilityData.sessions, offeringId]);

  // Month label for the week strip
  const monthLabel = useMemo(() => {
    const mid = weekDays[3];
    return `${MONTHS[mid.getMonth()]} ${mid.getFullYear()}`;
  }, [weekDays]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const imageSrc =
    offering?.image_url ||
    Object.entries(imageMap).find(([k]) => offering?.title?.includes(k))?.[1] ||
    "https://abharanakakal.b-cdn.net/assets/exp-yoga.png";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 w-full">
      {/* ═══════════════════════════ LEFT COLUMN ═══════════════════════════ */}
      <div className="space-y-8">
        {/* ── CALENDAR SECTION ── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4a3b32]/40 mb-3">
            Calendar Section
          </p>

          <div className="bg-white rounded-2xl border border-[#e8ddd5] px-4 py-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  const d = new Date(weekAnchor);
                  d.setDate(d.getDate() - 7);
                  setWeekAnchor(d);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f5ece5] text-[#4a3b32]/50 hover:text-[#4a3b32] transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[13px] font-medium text-[#2d2420]">
                {monthLabel}
              </span>
              <button
                onClick={() => {
                  const d = new Date(weekAnchor);
                  d.setDate(d.getDate() + 7);
                  setWeekAnchor(d);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f5ece5] text-[#4a3b32]/50 hover:text-[#4a3b32] transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Day strip */}
            <div className="flex gap-1.5">
              {weekDays.map((day, i) => {
                const dayStr = formatDateLocal(day);
                const isSelected = selectedDate
                  ? formatDateLocal(selectedDate) === dayStr
                  : false;
                const hasSession = datesWithSessions.has(dayStr);
                const isPast = day < today;

                return (
                  <button
                    key={dayStr}
                    disabled={isPast}
                    onClick={() => onSelectDate(day)}
                    className={cn(
                      "flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all border",
                      isSelected
                        ? "bg-[#bc6746] border-[#bc6746] text-white"
                        : isPast
                          ? "border-transparent text-[#4a3b32]/25 cursor-not-allowed"
                          : "border-[#e8ddd5] text-[#2d2420] hover:border-[#bc6746]/50 hover:bg-[#f0f5f0]",
                    )}
                  >
                    <span className="text-[10px] font-medium mb-0.5">
                      {DAY_ABBR[i]}
                    </span>
                    <span className="text-[14px] font-semibold leading-none">
                      {day.getDate()}
                    </span>
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5",
                        hasSession && !isPast
                          ? isSelected
                            ? "bg-white/70"
                            : "bg-[#bc6746]"
                          : "bg-transparent",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TIME SLOT SECTION ── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4a3b32]/40 mb-3">
            Time Slot Section
          </p>

          {!selectedDate ? (
            <div className="py-10 text-center text-[#7a6a62]/50 text-[13px] border border-dashed border-[#d9cbc4] rounded-2xl">
              Choose a date above to see available times
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="py-10 text-center text-[#7a6a62]/50 text-[13px] border border-dashed border-[#d9cbc4] rounded-2xl">
              No sessions available on this date
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSlots.map((slot) => {
                const isFull = slot.booked_count >= slot.capacity;
                const isSelected = selectedSession?.id === slot.id;
                const slotsLeft = slot.capacity - slot.booked_count;
                const isLowSlots = slotsLeft <= 3 && !isFull;
                const isPopular =
                  !isFull && slot.booked_count >= slot.capacity * 0.65;

                return (
                  <div
                    key={slot.id}
                    className="flex flex-col items-center gap-1"
                  >
                    <button
                      disabled={isFull}
                      onClick={() => onSelectSession(slot)}
                      className={cn(
                        "w-full py-3 px-4 rounded-full text-[13px] font-semibold border transition-all",
                        isSelected
                          ? "bg-[#bc6746] text-white border-[#bc6746] shadow-sm"
                          : isFull
                            ? "bg-[#f5ece5] text-[#4a3b32]/30 border-[#e8ddd5] cursor-not-allowed"
                            : "bg-white text-[#2d2420] border-[#d9cbc4] hover:border-[#bc6746] hover:bg-[#f0f5f0]",
                      )}
                    >
                      {formatTime12h(slot.start_time)}
                    </button>
                    {isLowSlots && (
                      <span className="text-[10px] text-red-400 font-medium">
                        Only {slotsLeft} slots left
                      </span>
                    )}
                    {isPopular && !isLowSlots && (
                      <span className="text-[10px] text-[#bc6746] font-semibold">
                        Popular
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════ RIGHT COLUMN — Preview Card ═════════════════ */}
      <div className="hidden lg:block">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4a3b32]/40 mb-3">
          Session Preview Card
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-[#e8ddd5] overflow-hidden shadow-sm sticky top-8"
        >
          {/* Image */}
          <div className="relative h-44 overflow-hidden">
            <Image
              src={imageSrc}
              alt={offering?.title || "Session"}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="p-5 space-y-3">
            <h3 className="text-[16px] font-semibold text-[#2d2420] leading-snug">
              {offering?.title || "Session"}
            </h3>

            {/* Instructor */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#e8ddd5] flex items-center justify-center shrink-0">
                <Users size={13} className="text-[#7a6a62]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#2d2420]">
                  Abharana Kakal
                </p>
                <p className="text-[10px] text-[#7a6a62]">Instructor</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-[#7a6a62] text-[12px]">
              <Clock size={12} className="shrink-0" />
              <span>{offering?.duration || "60 mins"}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-[#7a6a62] text-[12px]">
              <Star
                size={12}
                className="fill-amber-400 text-amber-400 shrink-0"
              />
              <span className="font-medium text-[#2d2420]">4.9</span>
              <span className="text-[#7a6a62]">(reviews)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
