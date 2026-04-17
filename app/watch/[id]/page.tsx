"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  Play, 
  ChevronLeft, 
  CheckCircle2, 
  Menu, 
  X,
  Clock,
  BookOpen,
  MonitorPlay,
  Layers,
  ChevronRight,
  Sparkles,
  Maximize2,
  Compass,
  ArrowRight,
  Share2,
  MoreVertical,
  SkipForward
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { toast } from "react-toastify";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { student, token, loading: authLoading } = useStudentAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push(`/courses/${id}`);
      return;
    }

    async function fetchWatchData() {
      try {
        const [watchRes, progressRes] = await Promise.all([
          axios.get(`/api/courses/${id}/watch`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/courses/lessons/complete?courseId=${id}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const courseData = watchRes.data.data;
        setCourse(courseData);
        setCompletedLessonIds(progressRes.data.lessonIds || []);

        // Auto-select first lesson if none selected
        if (courseData.course_sections?.length > 0) {
          const firstSection = courseData.course_sections[0];
          if (firstSection.course_lessons?.length > 0) {
            setCurrentLesson(firstSection.course_lessons[0]);
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Unable to enter the sanctuary");
        router.push(`/courses/${id}`);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchData();
  }, [id, token, authLoading, router]);

  const handleMarkComplete = async () => {
    if (!currentLesson || !course || completing) return;
    
    setCompleting(true);
    try {
      await axios.post('/api/courses/lessons/complete', {
        courseId: id,
        lessonId: currentLesson.id
      }, { headers: { Authorization: `Bearer ${token}` } });

      setCompletedLessonIds(prev => [...prev, currentLesson.id]);
      toast.success("Progress saved in the sanctuary.");

      // Auto-play next lesson if available
      if (nextLesson) {
          setTimeout(() => setCurrentLesson(nextLesson), 1500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Unable to save progress");
    } finally {
      setCompleting(false);
    }
  };

  // Find next lesson for easy navigation
  const nextLesson = useMemo(() => {
    if (!course || !currentLesson) return null;
    
    let allLessons: any[] = [];
    course.course_sections?.forEach((s: any) => {
        allLessons = [...allLessons, ...(s.course_lessons || [])];
    });

    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return allLessons[currentIndex + 1] || null;
  }, [course, currentLesson]);

  // AUTOMATED PLAYBACK SIGNING
  useEffect(() => {
    if (!currentLesson || !token) return;
    
    // Only fetch if we don't have a valid token (or if it's expired/missing)
    if (currentLesson.playback?.token && currentLesson.playback?.expires) {
       const now = Math.floor(Date.now() / 1000);
       if (currentLesson.playback.expires > now + 60) return; // Still valid for at least a minute
    }

    async function signPlayback() {
      setIsSigning(true);
      try {
        const videoId = currentLesson.video_url;
        const libraryId = currentLesson.playback?.libraryId || '638833';
        
        const response = await axios.get(
          `/api/courses/playback?videoId=${videoId}&libraryId=${libraryId}&courseId=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCurrentLesson((prev: any) => ({
          ...prev,
          playback: {
            ...prev.playback,
            token: response.data.token,
            expires: response.data.expires,
            libraryId: response.data.libraryId
          }
        }));
      } catch (err) {
        console.error('[Playback Signing Failed]:', err);
        // We don't toast here to avoid spamming, the UI will show "Video Access Unavailable"
      } finally {
        setIsSigning(false);
      }
    }

    signPlayback();
  }, [currentLesson?.id, token, id]);

  const embedUrl =
    currentLesson?.video_url &&
    currentLesson?.playback?.libraryId &&
    currentLesson?.playback?.token &&
    currentLesson?.playback?.expires
      ? `https://iframe.mediadelivery.net/embed/${currentLesson.playback.libraryId}/${currentLesson.video_url}?token=${currentLesson.playback.token}&expires=${currentLesson.playback.expires}&autoplay=true&loop=false&muted=false&preload=true&responsive=true`
      : "";

  if (loading || authLoading) return (
    <div className="flex h-screen flex-col items-center justify-center text-[#bc6746] bg-[#120d09]">
        <Loader2 className="animate-spin w-10 h-10 mb-6 opacity-40" />
        <div className="text-center space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">Abharana Academy</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#bc6746]/60">Preparing your private sanctuary</p>
        </div>
    </div>
  );

  if (!course) return null;

  return (
    <main className="flex min-h-screen bg-[#120d09] text-[#f1e4da] selection:bg-[#bc6746]/20 font-sans">
      
      {/* Cinematic Sidebar - Explorer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[100] w-[340px] bg-[#1a1512] border-r border-white/5 transition-all duration-700 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 opacity-100 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]' : '-translate-x-full opacity-0 lg:w-0 lg:border-0'
        }`}
      >
         <div className="flex flex-col h-full">
            {/* Academy Header */}
            <div className="p-8 pb-10">
                <Link href="/courses" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746] hover:text-white transition-all mb-10">
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#bc6746] group-hover:text-white transition-all shadow-inner">
                        <ChevronLeft className="w-5 h-5 translate-x-[-1px]" />
                    </div>
                    <span>Back to Portal</span>
                </Link>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-[#bc6746]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#bc6746]">Premium Sanctuary</span>
                    </div>
                    <h2 className="text-3xl font-serif text-white leading-[1.1] tracking-tight">{course.title}</h2>
                </div>
            </div>

            {/* Curriculum Tree with Focus Design */}
            <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-4 custom-scrollbar">
               {course.course_sections?.map((section: any, sIdx: number) => (
                  <div key={section.id} className="space-y-3">
                     <div className="flex items-baseline gap-4 px-2">
                        <span className="text-[12px] font-serif italic text-[#bc6746] opacity-40">{String(sIdx + 1).padStart(2, '0')}</span>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 truncate">{section.title}</h3>
                     </div>
                     
                     <div className="space-y-1.5 px-1">
                        {section.course_lessons?.map((lesson: any) => {
                           const isActive = currentLesson?.id === lesson.id;
                           const isCompleted = completedLessonIds.includes(lesson.id);
                           return (
                              <button 
                                 key={lesson.id}
                                 onClick={() => {
                                    setCurrentLesson(lesson);
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                 }}
                                 className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                                    isActive 
                                       ? 'bg-[#bc6746] text-white shadow-2xl shadow-[#bc6746]/30 -translate-y-0.5' 
                                       : 'hover:bg-white/5 border border-transparent'
                                 }`}
                              >
                                 <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:scale-110 shadow-lg'}`}>
                                    {isActive ? <SkipForward className="w-5 h-5 fill-current" /> : (
                                        isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <MonitorPlay className="w-5 h-5 text-[#bc6746]" />
                                    )}
                                 </div>
                                 <div className="flex-1 overflow-hidden">
                                    <p className={`text-[13px] font-bold truncate leading-none mb-1.5 ${isActive ? 'text-white' : 'text-white/70'}`}>
                                        {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 opacity-30" />
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-white/30'}`}>
                                           {lesson.duration || 'Session'}
                                        </span>
                                    </div>
                                 </div>
                                 {isActive && (
                                    <div className="shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-white animate-ping opacity-40" />
                                    </div>
                                 )}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </div>

            {/* Profile Footer */}
            <Link href="/my-courses" className="p-8 bg-[#1a1512] border-t border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
               <div className="flex items-center gap-4">
                  <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-[#bc6746] text-white flex items-center justify-center font-serif text-xl border-2 border-white/10 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                         {student?.name?.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1a1512]" />
                  </div>
                  <div>
                     <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/90 group-hover:text-[#bc6746] transition-colors">{student?.name}</p>
                     <p className="text-[9px] font-bold text-[#bc6746] uppercase tracking-widest opacity-60">View All Courses</p>
                  </div>
               </div>
               <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <ChevronRight className="w-4 h-4 text-[#bc6746]" />
               </div>
            </Link>
         </div>
      </aside>

      {/* Main Experience Controller */}
      <section className="flex-1 flex flex-col min-h-screen bg-[#120d09] relative shadow-[inset_40px_0_100px_-20px_rgba(0,0,0,0.8)]">
         
         {/* Minimal Navigation Overlay */}
         <header className="absolute top-0 inset-x-0 h-24 flex items-center justify-between px-10 z-[60] bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-8 pointer-events-auto">
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-3xl flex items-center justify-center text-white hover:bg-[#bc6746] transition-all border border-white/10"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex items-center gap-6 pointer-events-auto">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Masterclass Playing</span>
                    <span className="text-[12px] font-bold text-white tracking-tight italic opacity-80">{currentLesson?.title}</span>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setIsTheaterMode(!isTheaterMode)}
                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-white/10 backdrop-blur-2xl ${isTheaterMode ? 'bg-[#bc6746] text-white shadow-[0_0_40px_-5px_#bc6746]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                   >
                      <Maximize2 className="w-5 h-5" />
                   </button>
                   <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                      <Share2 className="w-5 h-5" />
                   </button>
                </div>
            </div>
         </header>

         {/* Cinematic Stage */}
         <div className="flex flex-col pt-0">
            {/* The Cinema Container */}
            <div className={`relative transition-all duration-1000 ease-in-out ${isTheaterMode ? 'px-0 pt-0' : 'pt-28'}`}>
                <div className={`w-full transition-all duration-1000 ${isTheaterMode ? 'px-0' : 'px-6 md:px-12 lg:px-20'}`}>
                    <div className={`relative aspect-video bg-black overflow-hidden group transition-all duration-1000 select-none ${isTheaterMode ? '' : 'rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5'}`}>
                        {currentLesson && embedUrl && !isSigning ? (
                            <iframe 
                                src={embedUrl}
                                loading="lazy"
                                style={{ border: 0, position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                                allowFullScreen={true}
                                referrerPolicy="origin"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-10 h-10 text-[#bc6746] animate-spin opacity-40" />
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
                                  {isSigning ? "Authorizing Sanctuary Access..." : (currentLesson ? "Video Access Unavailable" : "Establishing Connection")}
                                </p>
                            </div>
                        )}
                        
                       
                    </div>
                </div>
            </div>

            {/* Content Depth Section */}
            <div className={`px-10 md:px-20 py-20 pb-32`}>
               <div className="max-w-5xl mx-auto space-y-16">
                  
                  {/* Lesson Meta */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-16">
                     <div className="space-y-8 flex-1">
                        <div className="flex flex-wrap gap-4">
                            <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#bc6746] shadow-xl">
                                Active Module
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-bold text-white/40">
                                <Clock className="w-4 h-4 text-[#bc6746]" />
                                <span>{currentLesson?.duration || 'Recorded Live'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-bold text-white/40">
                                <Compass className="w-4 h-4 text-[#bc6746]" />
                                <span>Guided Session</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-serif leading-[1.05] tracking-tight text-white italic">
                               {currentLesson?.title?.split(' ').map((word: string, i: number) => (
                                   <span key={i} className={i % 2 === 1 ? 'text-[#bc6746]' : ''}>{word}{' '}</span>
                               ))}
                            </h1>
                            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl text-white/50 italic font-serif">
                               {currentLesson?.description || "A deep journey into the feminine divine. This session focuses on heart-opening postures and breathwork designed to release emotional tension and anchor you in stillness."}
                            </p>
                        </div>
                     </div>

                     <div className="shrink-0 flex flex-col gap-6 w-full lg:w-72">
                        <button 
                           onClick={handleMarkComplete}
                           disabled={completing || completedLessonIds.includes(currentLesson.id)}
                           className={`flex items-center justify-center gap-4 py-8 rounded-[32px] text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_30px_60px_-10px_rgba(188,103,70,0.3)] transition-all transform active:scale-95 group ${
                              completedLessonIds.includes(currentLesson.id)
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-white text-black hover:bg-[#bc6746] hover:text-white'
                           }`}
                        >
                           {completing ? (
                               <Loader2 className="w-6 h-6 animate-spin" />
                           ) : (
                               <>
                                 <span>{completedLessonIds.includes(currentLesson.id) ? 'Completed' : 'Complete Session'}</span>
                                 <CheckCircle2 className={`w-6 h-6 ${completedLessonIds.includes(currentLesson.id) ? 'text-white' : 'group-hover:rotate-12 transition-transform'}`} />
                               </>
                           )}
                        </button>
                        
                        {nextLesson && (
                            <button 
                                onClick={() => setCurrentLesson(nextLesson)}
                                className="flex items-center justify-center gap-4 py-8 border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] transition-all group"
                            >
                                <span>Next: {nextLesson.title}</span>
                                <SkipForward className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                            </button>
                        )}
                     </div>
                  </div>

                  <div className="w-full h-px bg-white/5" />

                  {/* Contextual Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="p-10 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/10 to-transparent flex flex-col justify-between group hover:border-[#bc6746]/50 transition-all">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#bc6746] mb-8 group-hover:bg-[#bc6746] group-hover:text-white transition-all shadow-2xl">
                              <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                              <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 text-white">Prerequisites</h4>
                              <p className="text-sm text-white/40 leading-relaxed font-light italic">Ensure you are in a quiet space with your mat and a soft block if needed.</p>
                          </div>
                      </div>

                      <div className="md:col-span-2 p-10 rounded-[40px] border border-white/5 bg-white/5 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 text-[#bc6746]">
                               <Sparkles className="w-32 h-32" />
                           </div>
                           <div className="relative z-10 flex flex-col h-full justify-between">
                               <div>
                                   <div className="flex items-center gap-3 mb-6">
                                       <div className="w-2 h-2 rounded-full bg-[#bc6746]" />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-[#bc6746]">Instructor Tip</span>
                                   </div>
                                   <h4 className="text-2xl font-serif text-white/90 mb-4 italic italic">"Don't worry about the perfect pose; focus on the perfect breath."</h4>
                               </div>
                               <p className="text-sm font-medium text-white/40 uppercase tracking-[0.3em]">Abharana Academy Advice</p>
                           </div>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Styled Scrollbar */}
      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(188, 103, 70, 0.2);
            border-radius: 10px;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(188, 103, 70, 0.4);
         }
         
         @media (max-width: 1024px) {
            .shadow-22xl {
               box-shadow: none !important;
            }
         }
      `}</style>
    </main>
  );
}
