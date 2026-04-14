"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import BookingFlow from "./components/BookingFlow";
import OnlineClassCard from "./components/OnlineClassCard";
import TrustSection from "./components/TrustSection";
import { yogaService } from "@/lib/api/client";
import { Offering } from "./components/flow/types";
import { toast } from "react-toastify";

export default function OnlineClassesPage() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await yogaService.offerings.list();
        setOfferings(res.data.data);
      } catch (err) {
        toast.error("Failed to load offerings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleBook = (offering: Offering) => {
    setSelectedOffering(offering);
    setIsBookingOpen(true);
    // Remove scroll lock as we are now in the same area (stage system)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setSelectedOffering(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen text-[#4a3b32] bg-[#fffdf8] overflow-x-hidden pt-[70px]">
      {/* Premium Sanctuary Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#f1e4da]/20 mix-blend-overlay"></div>
        
        {/* Animated Sanctuary Blobs */}
        <motion.div 
          
          className="absolute -top-1/4 -right-1/4 w-full h-full bg-[#bc6746]/5 rounded-full blur-[140px]"
        />
        <motion.div 
          className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-[#a55a3d]/5 rounded-full blur-[160px]"
        />
      </div>

      <AnimatePresence mode="wait">
        {!isBookingOpen ? (
          <motion.div 
            key="grid-view"
            className="relative z-10"
          >
            {/* Hero Section */}
            <section className="pt-20 pb-16 px-6 overflow-hidden">
               <div className="max-w-4xl mx-auto text-center space-y-6">
                  <motion.span 
                    className="text-xs uppercase tracking-[0.4em] text-[#bc6746] font-bold block"
                  >
                    Digital Sanctuary
                  </motion.span>
                  <motion.h1 
                    className="text-5xl md:text-8xl font-serif leading-[0.9] text-[#4a3b32] uppercase italic tracking-tighter"
                  >
                    Sacred Online <br /> Flows
                  </motion.h1>
                  <motion.p 
                    
                    className="text-lg md:text-xl font-light text-[#a55a3d]/70 max-w-2xl mx-auto leading-relaxed"
                  >
                    Bridge the distance. Bring the sanctuary into your sacred space with guided movements, deep stillness, and intentional breath.
                  </motion.p>
                  
                  <motion.div 
                   
                    className="w-24 h-px bg-[#bc6746]/30 mx-auto mt-12 origin-center"
                  />
               </div>
            </section>

            {/* Class Grid Section */}
            <section className="px-6 pb-32">
              <div className="max-w-7xl mx-auto w-full">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 text-[#bc6746]">
                     <Loader2 className="animate-spin h-8 w-8 mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Tuning In...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                      {offerings.map((offering, idx) => (
                        <OnlineClassCard 
                          key={offering.id} 
                          offering={offering} 
                          onBook={handleBook}
                          index={idx}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-32">
                       <TrustSection />
                    </div>
                  </>
                )}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div 
            key="booking-view"
            
            className="relative z-10 py-12 px-6"
          >
            <div className="max-w-6xl mx-auto">
               <BookingFlow 
                  initialOffering={selectedOffering} 
                  onClose={closeBooking}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Branding Elements */}
      <div className="hidden md:block fixed bottom-8 left-0 w-full z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center opacity-40">
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Sanctuary Direct Verification © 2024</p>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Premium Wellness Collective</p>
          </div>
      </div>
      
      {/* Decorative Gradient */}
      <div className="fixed bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#bc6746]/5 to-transparent pointer-events-none z-0" />
    </main>
  );
}
