"use client";

import { motion } from "framer-motion";

interface DownloadItem {
  id: string;
  heading: string;
  subheading: string;
  file_url: string;
  file_size_bytes: number;
}

interface Props {
  downloads: DownloadItem[];
}

export default function DownloadsClient({ downloads }: Props) {
  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown Size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return (bytes / 1024).toFixed(1) + ' KB';
    return mb.toFixed(1) + ' MB';
  };

  return (
    <main className="min-h-screen bg-[#fffdf8] pt-32 pb-20 px-6 paper-grain">
      <div className="max-w-3xl mx-auto">
        {/* HERO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 md:mb-24"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#4a3b32] mb-6 tracking-tight">
            Downloads
          </h1>
          <p className="text-[#a55a3d] text-lg md:text-xl font-light opacity-80 max-w-xl leading-relaxed">
            Resources to support your journey towards wholeness and presence.
          </p>
        </motion.div>

        {/* LIST */}
        <div className="space-y-4">
          {downloads.length === 0 ? (
            <div className="text-center py-12 text-[#a55a3d]/50 italic">
              New resources are gestating. Please check back soon.
            </div>
          ) : (
            downloads.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={item.id}
                className="group p-6 md:p-8 rounded-3xl bg-white/50 border border-[#bc6746]/10 hover:bg-white hover:border-[#bc6746]/30 transition-all duration-500 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-[#4a3b32]">
                      {item.heading}
                    </h3>
                    <p className="text-[#a55a3d]/70 text-md md:text-lg leading-relaxed max-w-md italic">
                      {item.subheading}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t border-[#f1e4da] pt-4 md:border-0 md:pt-0 shrink-0">
                    <span className="text-[10px] tracking-widest uppercase text-[#a55a3d]/40 font-bold">
                      {formatSize(item.file_size_bytes)}
                    </span>
                    <a 
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2 rounded-full border border-[#bc6746]/30 text-[#bc6746] text-xs font-bold tracking-widest uppercase hover:bg-[#bc6746] hover:text-white transition-all duration-300 active:scale-95 shadow-sm inline-block"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* FOOTER NOTE */}
        <p className="mt-20 text-center text-[11px] tracking-[0.2em] uppercase text-[#a55a3d]/40">
          New resources added monthly
        </p>
      </div>
    </main>
  );
}
