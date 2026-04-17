"use client";

import React, { useEffect, useState } from "react";
import { 
  Loader2, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Play, 
  Star,
  Sparkles,
  Search,
  Layout,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { toast } from "react-toastify";

export default function MyCoursesPage() {
  const { student, token, loading: authLoading } = useStudentAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
        // Redirection handled by middleware or locally if needed
        return;
    }

    async function fetchMyCourses() {
      try {
        const res = await axios.get("/api/courses/my-enrollments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Note: I'll need to update this API to return ALL enrollments, not just one check.
        // For now, I'll fetch the list.
        const resAll = await axios.get("/api/courses/my-enrollments/all", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setEnrollments(resAll.data.data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyCourses();
  }, [token, authLoading]);

  if (loading || authLoading) return (
    <div className="flex min-h-screen flex-col items-center justify-center text-[#bc6746] bg-[#fbf8f5]">
        <Loader2 className="animate-spin w-10 h-10 mb-4 opacity-40" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Opening your private academy...</p>
    </div>
  );

  if (!token) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-[#fbf8f5]">
              <div className="w-20 h-20 rounded-full bg-[#bc6746]/5 flex items-center justify-center text-[#bc6746] mb-8">
                  <Layout className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-serif text-[#2d2420] mb-4">Welcome to the Academy</h1>
              <p className="text-[#a55a3d]/60 max-w-sm mb-8 leading-relaxed italic">Please log in to access your purchased journeys and track your progress.</p>
              <button 
                onClick={() => (window as any).toggleStudentAuthModal?.(true)}
                className="px-10 py-4 bg-[#bc6746] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
              >
                  Login to Portal
              </button>
          </div>
      );
  }

  const filtered = enrollments.filter(e => 
    e.courses?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#fbf8f5] text-[#2d2420] pb-24">
      {/* Academy Hero */}
      <section className="bg-[#1a1512] text-white pt-32 pb-24 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-10 scale-[2] text-[#bc6746] pointer-events-none">
            <Sparkles className="w-64 h-64" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-[1px] bg-[#bc6746]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Student Member</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif leading-none italic">
                        Namaste, <span className="text-[#bc6746]">{student?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-white/40 text-sm font-light uppercase tracking-[0.2em]">Total Journeys Enrolled: {enrollments.length}</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#bc6746] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search your library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#bc6746] focus:bg-white/10 transition-all font-light"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="px-8 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
            {filtered.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 border border-[#f1e4da] text-center shadow-xl">
                    <BookOpen className="w-16 h-16 text-[#bc6746]/20 mx-auto mb-8" />
                    <h3 className="text-2xl font-serif italic mb-2">No journeys found</h3>
                    <p className="text-[#a55a3d]/40 text-sm max-w-xs mx-auto mb-10 italic">Your library is currently empty. Explore our offerings to begin your journey.</p>
                    <Link href="/courses" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#bc6746] hover:gap-4 transition-all">
                        <span>Browse Courses</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((enrollment: any) => (
                        <Link 
                            key={enrollment.id}
                            href={`/watch/${enrollment.course_id}`}
                            className="bg-white rounded-[40px] p-8 border border-[#f1e4da] group hover:border-[#bc6746]/50 hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-2xl"
                        >
                            <div className="aspect-[16/10] bg-[#120d09] rounded-[32px] overflow-hidden mb-8 relative">
                                <img 
                                    src={enrollment.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80'} 
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                                    alt=""
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                    <div className="w-14 h-14 rounded-full bg-white text-[#bc6746] flex items-center justify-center shadow-2xl">
                                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                                        Enrolled
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-[#bc6746]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#bc6746]">Active Journey</span>
                                </div>
                                <h3 className="text-2xl font-serif text-[#2d2420] italic group-hover:text-[#bc6746] transition-colors line-clamp-1">{enrollment.courses?.title}</h3>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-[#f1e4da]">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#a55a3d]/40">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Lifetime Access</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#bc6746]">
                                        <span>Continue</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      </section>
    </main>
  );
}
