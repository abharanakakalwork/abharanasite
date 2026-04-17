"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  CheckCircle2, 
  Play, 
  Lock, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  MonitorPlay
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useRazorpay } from "@/lib/hooks/useRazorpay";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { student, requireAuth, token } = useStudentAuth();
  const { isLoaded: isRazorpayLoaded } = useRazorpay();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get(`/api/courses/${id}`);
        setCourse(res.data.data);
        
        // If logged in, check enrollment
        if (token) {
          const enrollRes = await axios.get(`/api/courses/my-enrollments?courseId=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsEnrolled(enrollRes.data.enrolled);
        }
      } catch (err) {
        console.error("Failed to fetch course data");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id, token]);

  const handleJoinJourney = () => {
    requireAuth(() => {
      startPaymentFlow();
    });
  };

  const startPaymentFlow = async () => {
    if (!isRazorpayLoaded) {
      return toast.error("Sanctuary keys are loading. Please try again.");
    }

    setIsProcessing(true);
    try {
      // 1. Create Order
      const orderRes = await axios.post("/api/razorpay/order", {
        amount: course.price,
        receipt: `course_${course.id.substring(0, 8)}_${Date.now()}`
      });

      if (!orderRes.data.success) throw new Error("Order creation failed");

      // 2. Launch Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SdHRDjRRmMGAT2",
        amount: Math.round(course.price * 100),
        currency: "INR",
        name: "Abharana Kakal",
        description: `Enrollment: ${course.title}`,
        order_id: orderRes.data.order_id,
        handler: async (response: any) => {
          try {
            await axios.post("/api/courses/enroll", {
              courseId: course.id,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: course.price
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Welcome to the Sanctuary! Course unlocked.");
            setIsEnrolled(true);
          } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.details || "Enrollment failed";
            toast.error(`Enrollment failed: ${errorMsg}`);
            console.error("Enrollment completion error:", err);
          }
        },
        prefill: {
          name: student?.name,
          email: student?.email,
        },
        theme: { color: "#bc6746" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error("Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center text-[#bc6746] bg-[#f5ece5]">
        <Loader2 className="animate-spin w-10 h-10 mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Preparing the sanctuary...</p>
    </div>
  );

  if (!course) return (
    <div className="flex h-screen flex-col items-center justify-center text-[#2d2420] bg-[#f5ece5]">
        <h2 className="text-2xl font-serif">Wisdom not found</h2>
        <Link href="/courses" className="mt-4 text-[#bc6746] underline">Back to catalog</Link>
    </div>
  );

  const totalLessons = course.course_sections?.reduce((sum: number, s: any) => sum + (s.course_lessons?.length || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-[#f5ece5] text-[#2d2420] pb-32 pt-24">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
           <Link href="/courses" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#bc6746] hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sanctuary</span>
           </Link>

           <div className="space-y-4">
              <span className="px-4 py-1.5 bg-[#bc6746]/5 border border-[#bc6746]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#bc6746]">
                 {course.category} Course
              </span>
              <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] tracking-tight">{course.title}</h1>
           </div>

           <p className="text-lg font-light text-[#7a6a62] leading-relaxed max-w-xl">
              {course.description}
           </p>

           <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <BookOpen className="w-4 h-4 text-[#bc6746]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/60">Chapters</span>
                    <span className="text-sm font-bold">{course.course_sections?.length || 0} Modules</span>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Play className="w-4 h-4 text-[#bc6746]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/60">Contents</span>
                    <span className="text-sm font-bold">{totalLessons} Video Sessions</span>
                 </div>
              </div>
           </div>

            <div className="pt-8 flex items-center gap-6">
               {isEnrolled ? (
                  <Link 
                    href={`/watch/${course.id}`}
                    className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3"
                  >
                     <Play className="w-4 h-4" />
                     <span>Continue to Sanctuary</span>
                  </Link>
               ) : (
                  <button 
                    onClick={handleJoinJourney}
                    disabled={isProcessing}
                    className="px-10 py-5 bg-[#bc6746] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#bc6746]/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                     {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                     <span>Join this Journey • ₹{course.price}</span>
                  </button>
               )}
            </div>
        </div>

        <div className="relative">
           {/* Course Poster / Video Preview */}
           <div className="aspect-[16/11] rounded-[48px] overflow-hidden shadow-2xl relative border-[12px] border-white group">
              <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                 <button className="w-20 h-20 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#bc6746] shadow-2xl transition-all hover:scale-110 active:scale-95">
                    <Play className="w-8 h-8 ml-1" />
                 </button>
              </div>
           </div>

           {/* Floating badges */}
           <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[32px] shadow-xl border border-[#f1e4da] max-w-[200px] hidden md:block">
              <ShieldCheck className="w-8 h-8 text-[#bc6746] mb-3" />
              <p className="text-[10px] font-bold text-[#4a3b32] uppercase tracking-widest leading-loose">Lifetime access to all recordings</p>
           </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="mt-32 px-6 max-w-4xl mx-auto">
         <div className="text-center mb-16 space-y-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">The Curriculum</h2>
            <h3 className="text-4xl font-serif text-[#2d2420]">Explore the Wisdom</h3>
         </div>

         <div className="space-y-6">
            {course.course_sections?.map((section: any, sIdx: number) => (
               <div key={section.id} className="bg-white/50 backdrop-blur-sm rounded-[32px] border border-white p-8">
                  <div className="flex items-center gap-4 mb-6">
                     <span className="w-8 h-8 flex items-center justify-center bg-[#bc6746] text-white rounded-full text-[10px] font-black">{sIdx + 1}</span>
                     <h4 className="text-xl font-serif text-[#2d2420]">{section.title}</h4>
                  </div>

                  <div className="space-y-1 ml-1">
                     {section.course_lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between py-4 border-b border-[#f1e4da]/50 last:border-0 group">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 flex items-center justify-center text-[#bc6746]">
                                 <MonitorPlay className="w-4 h-4" />
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-[#4a3b32]">{lesson.title}</p>
                                 <p className="text-[10px] text-[#a55a3d]/50 font-medium">Session • {lesson.duration || 'Recorded'}</p>
                              </div>
                           </div>

                           {/* Preview logic removed */}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Trust Section */}
      <section className="mt-40 px-6 max-w-5xl mx-auto rounded-[64px] bg-[#2d2420] py-24 text-center text-white relative overflow-hidden">
         {/* Subtle lights */}
         <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#bc6746]/20 blur-[120px]" />
         <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#bc6746]/10 blur-[120px]" />
         
         <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif px-4">Ready to start your feminine journey?</h2>
            <p className="text-[#a55a3d] max-w-xl mx-auto font-light italic">Secure payment processing via Razorpay. Immediate access upon registration.</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
               <button className="px-12 py-5 bg-white text-[#2d2420] rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all w-full md:w-auto shadow-2xl">
                  Enroll Today
               </button>
               <button className="px-12 py-5 border border-white/20 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all w-full md:w-auto">
                  Gift a Course
               </button>
            </div>
         </div>
      </section>
    </main>
  );
}
