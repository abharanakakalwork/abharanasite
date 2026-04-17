"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ArrowRight, Play, BookOpen } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  price: number;
  category: string;
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Yoga", "Meditation", "Philosophy"];

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get("/api/courses");
        setCourses(res.data.data);
      } catch (err) {
        console.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const filtered = courses.filter(c => activeCategory === "All" || c.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#f5ece5] pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%221%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.12%22%2F%3E%3C%2Fsvg%3E')]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 
            className="text-5xl md:text-6xl font-serif text-[#2d2420] leading-tight"
          >
            Digital Sanctuary
          </h1>
          <p 
            className="mt-4 text-[#7a6a62] font-light max-w-xl mx-auto"
          >
            Carry the wisdom of the sanctuary with you. Expertly crafted recorded sessions to deepen your practice at your own pace.
          </p>
        </section>

        {/* Categories */}
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-widest border transition-all ${
                activeCategory === cat 
                ? 'bg-[#bc6746] text-white border-[#bc6746] shadow-lg shadow-[#bc6746]/20' 
                : 'bg-white/50 text-[#4a3b32] border-[#d9cbc4] hover:border-[#bc6746] hover:text-[#bc6746]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-32 flex flex-col items-center text-[#bc6746]">
               <Loader2 className="animate-spin w-8 h-8 mb-4 border-2 border-transparent border-t-[#bc6746] rounded-full" />
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Illuminating the catalog...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((course, idx) => (
              <div
                key={course.id}
                className="group bg-white/40 backdrop-blur-md rounded-[32px] border border-white/60 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                   {course.thumbnail_url ? (
                     <img src={course.thumbnail_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                   ) : (
                     <div className="w-full h-full bg-[#fde9de] flex items-center justify-center text-[#bc6746]">
                        <BookOpen className="w-12 h-12 opacity-20" />
                     </div>
                   )}
                   <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-bold text-[#bc6746]">
                      {course.category}
                   </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                   <h3 className="text-2xl font-serif text-[#2d2420] mb-2">{course.title}</h3>
                   <p className="text-[#7a6a62] text-sm line-clamp-2 mb-6 font-light">{course.description}</p>
                   
                   <div className="mt-auto flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#bc6746]/50">Exchange</span>
                         <span className="text-xl font-bold text-[#2d2420]">₹{course.price}</span>
                      </div>
                      
                      <Link 
                        href={`/courses/${course.id}`}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#bc6746] group-hover:gap-3 transition-all"
                      >
                         <span>Details</span>
                         <ArrowRight className="w-4 h-4" />
                      </Link>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
               <h3 className="text-xl font-serif text-[#4a3b32]/40 italic">New courses are brewing in the sanctuary...</h3>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
