"use client";
import { motion, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

function WaveformVisualizer({
  playing,
  color = "#bc6746",
}: {
  playing: boolean;
  color?: string;
}) {
  const bars = [3, 8, 14, 20, 12, 18, 9, 16, 6, 22, 10, 17, 5, 13, 19];
  return (
    <div className="flex items-center gap-[3px] h-10">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full flex-shrink-0"
          initial={{ height: 3, opacity: 0.2 }}
          animate={{
            height: playing ? [h * 0.3, h, h * 0.5, h * 1.1, h * 0.3] : 3,
            opacity: playing ? [0.6, 1, 0.7, 1, 0.6] : 0.2,
          }}
          transition={{
            duration: playing ? 0.7 + i * 0.07 : 0.3,
            repeat: playing ? Infinity : 0,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
          style={{
            backgroundColor: playing ? color : "#c8a99a",
            willChange: "height, opacity",
          }}
        />
      ))}
    </div>
  );
}

function ProgressRing({
  progress,
  size = 68,
  stroke = 2,
  color,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90 absolute inset-0 pointer-events-none"
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f1e4da"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "linear" }}
      />
    </svg>
  );
}

type Track = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  intent: string;
  frequency: string;
  duration: string;
  skill_level?: string;
  color: string;
  category?: string;
};

function TrackCard({
  track,
  isPlaying,
  progress,
  onToggle,
}: {
  track: Track;
  isPlaying: boolean;
  progress: number;
  onToggle: () => void;
}) {
  const accentColor = track.color || "#bc6746";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      {/* Glow aura when playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -inset-px rounded-2xl pointer-events-none"
            style={{
              boxShadow: `0 0 40px 8px ${accentColor}30`,
              border: `1px solid ${accentColor}40`,
            }}
          />
        )}
      </AnimatePresence>

      <div
        onClick={onToggle}
        className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 select-none
          ${
            isPlaying
              ? "bg-[#f1e4da]/40 border border-[#bc6746]/20"
              : "bg-[#fffdf8] border border-[#f1e4da] hover:bg-[#f9f0e8] hover:border-[#e2b9a7]"
          }`}
      >
        {/* Top colored accent stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: isPlaying
              ? `linear-gradient(90deg, transparent, ${accentColor}, transparent)`
              : "transparent",
            transition: "background 0.5s",
          }}
        />

        <div className="p-5 pb-4">
          {/* Meta tags */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-1.5">
              {track.intent && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase"
                  style={{
                    backgroundColor: `${accentColor}18`,
                    color: accentColor,
                  }}
                >
                  {track.intent}
                </span>
              )}
              {track.skill_level && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase bg-[#f1e4da] text-[#4a3b32]/50">
                  {track.skill_level}
                </span>
              )}
              {track.frequency && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase bg-[#f1e4da] text-[#4a3b32]/50">
                  {track.frequency}
                </span>
              )}
            </div>
            {track.duration && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#4a3b32]/40">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {track.duration}
              </div>
            )}
          </div>

          {/* Main content row */}
          <div className="flex items-center gap-4">
            {/* Play Button */}
            <div className="relative flex-shrink-0 w-[68px] h-[68px] flex items-center justify-center">
              <ProgressRing
                progress={progress}
                size={68}
                stroke={2}
                color={accentColor}
              />
              <motion.button
                whileTap={{ scale: 0.93 }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-400 shadow-lg z-10 relative"
                style={{
                  background: isPlaying ? accentColor : "#f1e4da",
                  color: isPlaying ? "#fff" : "#bc6746",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="2" />
                    <rect x="14" y="4" width="4" height="16" rx="2" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-0.5"
                  >
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                )}
              </motion.button>
            </div>

            {/* Title + description */}
            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-serif mb-1 leading-snug truncate transition-colors duration-300"
                style={{ color: isPlaying ? "#4a3b32" : "#4a3b32" }}
              >
                {track.title}
              </h3>
              <p className="text-sm text-black font-light leading-relaxed italic line-clamp-2">
                &ldquo;{track.description}&rdquo;
              </p>
            </div>
          </div>

          {/* Waveform + progress bar */}
          <div className="mt-4 pt-3 border-t border-[#f1e4da]">
            <div className="flex items-center justify-between">
              <WaveformVisualizer playing={isPlaying} color={accentColor} />
              {isPlaying && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] font-mono uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  Playing
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AudioLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [duration, setDuration] = useState<Record<string, number>>({});
  const [currentTime, setCurrentTime] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Skill Level");
  const [showSort, setShowSort] = useState(false);
  const [search, setSearch] = useState("");
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const { pauseBgAudio } = useAudio();

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch("/api/sound-healing");
        const json = await res.json();
        if (json.success) setTracks(json.data);
      } catch (err) {
        console.error("Failed to fetch meditations", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  const updateProgress = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      const d = audio.duration;
      const ct = audio.currentTime;
      const p = (ct / d) * 100;
      
      setDuration(prev => ({ ...prev, [id]: isNaN(d) ? 0 : d }));
      setCurrentTime(prev => ({ ...prev, [id]: ct }));
      setProgress((prev) => ({ ...prev, [id]: isNaN(p) ? 0 : p }));
    }
  };

  const handleSeek = (id: string, value: number) => {
    const audio = audioRefs.current[id];
    if (audio && audio.duration) {
      const newTime = (value / 100) * audio.duration;
      audio.currentTime = newTime;
      updateProgress(id);
    }
  };

  const toggle = (id: string, src: string) => {
    if (playing === id) {
      audioRefs.current[id]?.pause();
      setPlaying(null);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else {
      pauseBgAudio();
      Object.entries(audioRefs.current).forEach(([k, a]) => {
        if (k !== id) a?.pause();
      });
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (!audioRefs.current[id]) {
        audioRefs.current[id] = new Audio(src);
        audioRefs.current[id]!.addEventListener("ended", () => {
          setPlaying(null);
          if (progressInterval.current) clearInterval(progressInterval.current);
        });
      }
      audioRefs.current[id]!.play();
      setPlaying(id);
      progressInterval.current = setInterval(() => updateProgress(id), 500);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((a) => a?.pause());
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  // Derive categories
  const categories = [
    "All",
    ...Array.from(
      new Set(
        tracks
          .map((t) => (t.category || t.intent || "Other").toUpperCase())
          .filter(Boolean),
      ),
    ),
  ];

  // Filter + search
  const filtered = tracks.filter((t) => {
    const matchFilter =
      activeFilter === "All" || 
      (t.category || t.intent || "Other").toUpperCase() === activeFilter.toUpperCase();
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(q) ||
      (t.intent || "").toLowerCase().includes(q) ||
      (t.frequency || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Duration") {
      const parseDur = (d: string) => {
        const parts = d?.split(":").map(Number);
        return parts ? (parts[0] || 0) * 60 + (parts[1] || 0) : 0;
      };
      return parseDur(a.duration) - parseDur(b.duration);
    }
    if (sortBy === "Frequency")
      return (a.frequency || "").localeCompare(b.frequency || "");
    // Skill Level default
    const order: Record<string, number> = {
      Beginner: 0,
      "All Levels": 1,
      Advanced: 2,
    };
    return (
      (order[a.skill_level || "All Levels"] ?? 1) -
      (order[b.skill_level || "All Levels"] ?? 1)
    );
  });

  // Group by category/intent
  const groups: Record<string, Track[]> = {};
  sorted.forEach((t) => {
    const key = (t.category || t.intent || "Other").toUpperCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const groupLabels: Record<string, string> = {
    FOUNDATION: "Foundations & Beginner",
    "DEEP REST": "Deep Rest & Grounding",
    FOCUS: "Advanced Focus & Resonance",
    PRESENCE: "Presence & Awareness",
    GROUNDING: "Grounding Practices",
    SLEEP: "Sleep & Deep Restoration",
    OTHER: "Self Care & Affirmations"
  };

  const playingTrack = tracks.find((t) => t.id === playing);

  return (
    <section
      id="sh-audio"
      className="relative bg-[#fffdf8] py-24 px-4 md:px-6 overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: "#bc6746", top: "20%", left: "-10%" }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: "#e2b9a7", bottom: "10%", right: "-5%" }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-14">
          <span className="inline-block text-[#bc6746] font-mono text-[10px] uppercase tracking-[0.35em] mb-4 opacity-75">
            The Resonance Chamber
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-[#4a3b32] mb-5 leading-tight">
            Guided Meditation{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg, #bc6746 0%, #e2b9a7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Sessions
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-[#4a3b32]/60 text-sm md:text-base leading-relaxed font-light">
            Each composition is carefully tuned to specific frequencies designed
            to shift your cellular vibration and restore inner peace.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#bc6746]/50 to-transparent" />
          </div>
        </motion.div>

        {/* Search + Sort controls */}
        <motion.div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a3b32]/30"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search for a title, objective, or frequency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fffdf8] border border-[#f1e4da] text-[#4a3b32] text-sm placeholder-[#4a3b32]/30 outline-none focus:border-[#bc6746]/50 focus:bg-white transition-all shadow-sm"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            
            <AnimatePresence>
              {showSort && (
                <motion.div className="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-xl bg-[#fffdf8] border border-[#f1e4da] shadow-xl overflow-hidden">
                  {["Skill Level", "Duration", "Frequency"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setShowSort(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${sortBy === opt ? "text-[#bc6746] bg-[#f1e4da]/50" : "text-[#4a3b32]/50 hover:text-[#4a3b32] hover:bg-[#f9f0e8]"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category pills */}
        {categories.length > 2 && (
          <motion.div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-mono tracking-widest uppercase transition-all duration-300 ${
                  activeFilter === cat
                    ? "bg-[#bc6746] text-white shadow-md shadow-[#bc6746]/20"
                    : "bg-[#fffdf8] text-[#4a3b32]/50 border border-[#f1e4da] hover:bg-[#f1e4da] hover:text-[#4a3b32]/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-24 text-[#bc6746]/60 italic font-light text-sm">
            Tuning frequencies into existence...
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 text-[#4a3b32]/30 italic font-light text-sm">
            No sessions found. The sanctuary is quiet for now.
          </div>
        ) : activeFilter === "All" ? (
          // Grouped view
          <div className="space-y-12">
            {Object.entries(groups).map(([groupKey, groupTracks], gi) => (
              <motion.div key={groupKey}>
                {/* Group label */}
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#bc6746]/60">
                    ✦ {groupLabels[groupKey] || groupKey}
                  </span>
                  <div className="flex-1 h-px bg-[#f1e4da]" />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupTracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={playing === track.id}
                      progress={progress[track.id] || 0}
                      onToggle={() => toggle(track.id, track.audio_url)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Filtered flat view
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sorted.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={playing === track.id}
                progress={progress[track.id] || 0}
                onToggle={() => toggle(track.id, track.audio_url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating mini-player */}
      <AnimatePresence>
        {playing && playingTrack && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[92vw] max-w-md"
            style={{ willChange: "transform, opacity" }}
          >
            <div
              className="relative rounded-2xl overflow-hidden border shadow-2xl"
              style={{
                background: "rgba(255,253,248,0.97)",
                backdropFilter: "blur(20px)",
                borderColor: `${playingTrack.color}40`,
                boxShadow: `0 20px 60px rgba(74,59,50,0.15), 0 0 0 1px ${playingTrack.color}20`,
              }}
            >
              {/* Seekable Progress bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 bg-[#f1e4da] cursor-pointer group/mini-seeker"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const val = (x / rect.width) * 100;
                  handleSeek(playing, val);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#bc6746] to-[#e2b9a7] relative transition-all duration-300"
                  style={{ width: `${progress[playing] || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#4a3b32] shadow-md scale-0 group-hover/mini-seeker:scale-100 transition-transform" />
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 pt-4">
                {/* Color dot */}
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${playingTrack.color}25` }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: playingTrack.color }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#4a3b32] text-xs font-serif italic truncate mb-0.5">
                    {playingTrack.title}
                  </p>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <p className="text-[#4a3b32]/45 text-[9px] font-mono truncate">
                      {playingTrack.frequency}
                    </p>
                    <span className="text-[#4a3b32]/20 text-[9px]">•</span>
                    <p className="text-[#4a3b32]/60 text-[9px] font-mono whitespace-nowrap">
                      {formatTime(currentTime[playing] || 0)} / {formatTime(duration[playing] || 0)}
                    </p>
                  </div>
                </div>

                {/* Waveform */}
                <div className="hidden sm:block">
                  <WaveformVisualizer
                    playing={true}
                    color={playingTrack.color}
                  />
                </div>

                {/* Pause btn */}
                <button
                  onClick={() => toggle(playing, "")}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors ml-1"
                  style={{ backgroundColor: `${playingTrack.color}25` }}
                  aria-label="Pause"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={playingTrack.color}
                  >
                    <rect x="6" y="4" width="4" height="16" rx="2" />
                    <rect x="14" y="4" width="4" height="16" rx="2" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
