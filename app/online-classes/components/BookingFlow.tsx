"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  Loader2,
  Check,
  CalendarCheck,
  Zap,
  X
} from "lucide-react"; 
import { yogaService } from "@/lib/api/client";
import { toast } from "react-toastify";

// Sub-components
import OfferingStep from "./flow/OfferingStep";
import DateTimeStep from "./flow/DateTimeStep";
import UserInfoStep from "./flow/UserInfoStep";
import OrderSummarySidebar from "./flow/OrderSummarySidebar";
import PaymentStep from "./flow/PaymentStep"; // For the manual screenshot upload part
import Antigravity from "@/app/components/Antaigravity";
import { useYogaRealtime } from "@/lib/hooks/useYogaRealtime";
import { Offering, Session, UserData } from "./flow/types";
import { cn, formatDateLocal } from "@/lib/utils";

interface BookingFlowProps {
  initialOffering?: Offering | null;
  onClose?: () => void;
}

export default function BookingFlow({ initialOffering, onClose }: BookingFlowProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'booking' | 'payment' | 'success'>('booking');
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [initialSessions, setInitialSessions] = useState<Session[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstPercent, setGstPercent] = useState(18);

  // Selections
  const [currentStep, setCurrentStep] = useState(initialOffering ? 2 : 1);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(initialOffering || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData>({ name: "", email: "", phone: "", message: "" });

  const { sessions, exceptions: realtimeExceptions } = useYogaRealtime(initialSessions, exceptions);

  useEffect(() => {
    setMounted(true);
    async function load() {
      try {
        const [offeringRes, availabilityRes] = await Promise.all([
          yogaService.offerings.list(),
          yogaService.sessions.list()
        ]);
        setOfferings(offeringRes.data.data);
        setInitialSessions(availabilityRes.data.data.sessions || []);
        setExceptions(availabilityRes.data.data.exceptions || []);
      } catch (err) {
        toast.error("Failed to load sanctuary data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const canProceedToStep3 = !!selectedDate && !!selectedSession;
  const canProceedToPayment = !!userData.name && !!userData.email && !!userData.phone;

  const finalizeBooking = async (verifiedPaymentData: { reference: string, screenshotUrl?: string }) => {
    setIsSubmitting(true);
    try {
      const GST_RATE = 0.18;
      const base_amount = selectedOffering?.single_price || 0;
      const gst_amount = Number((base_amount * GST_RATE).toFixed(2));
      const total_amount = Number((base_amount + gst_amount).toFixed(2));

      const payload = {
        reference_id: selectedSession?.id,
        user_name: userData.name,
        user_email: userData.email,
        user_phone: userData.phone,
        booking_type: "yoga",
        total_amount,
        amount: base_amount,
        gst_amount,
        payment_reference: verifiedPaymentData.reference,
        payment_screenshot_url: verifiedPaymentData.screenshotUrl,
        metadata: {
            offering_title: selectedOffering?.title,
            session_date: selectedSession?.session_date
        }
      };

      const res = await yogaService.bookings.create(payload);
      if (res.data.success) {
        toast.success("Booking request initialized!");
        
        // Reset states but keep name for Success UI
        const finalName = userData.name;
        setSelectedOffering(null);
        setSelectedDate(null);
        setSelectedSession(null);
        setUserData({ name: finalName, email: "", phone: "", message: "" });
        setCurrentStep(1);
        
        setView('success');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to process booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-[#bc6746]">
        <Loader2 className="animate-spin h-8 w-8 mb-4" /> 
        <p className="text-xs font-black uppercase tracking-widest opacity-40 italic">Syncing Sanctuary...</p>
    </div>
  );

  return (
    <div className="w-full relative py-4 md:py-8 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
        <Antigravity count={40} color="#bc6746" />
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: Main Selections (Wizard) */}
        {view === 'booking' && (
          <motion.div 
            key="booking-view"
           
            className="max-w-7xl mx-auto"
          >
             <div className="bg-white/60 backdrop-blur-2xl md:rounded-[60px] md:border md:border-[#f1e4da] md:shadow-2xl md:shadow-[#bc6746]/5 p-6 md:p-14 relative">
                
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 text-[#a55a3d]/40 hover:text-[#bc6746] transition-colors"
                  >
                    <X size={24} />
                  </button>
                )}

                {/* Progress Indicator - Integrated inside */}
                <div className="max-w-md mx-auto mb-12 w-full">
                    <div className="flex justify-between items-center relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-[#f1e4da] -z-10" />
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#bc6746] transition-all duration-500 -z-10`} style={{ width: `${(currentStep - 1) * 50}%` }} />
                      
                      {[1, 2, 3].map((step) => (
                          <div key={step} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 border-2",
                                currentStep === step ? "bg-[#bc6746] border-[#bc6746] text-white scale-110 shadow-lg shadow-[#bc6746]/20" : 
                                currentStep > step ? "bg-white border-[#bc6746] text-[#bc6746]" : "bg-white border-[#f1e4da] text-[#a55a3d]/40"
                            )}>
                                {currentStep > step ? <Check className="w-4 h-4" /> : step}
                            </div>
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest transition-opacity duration-300",
                                currentStep === step ? "text-[#bc6746] opacity-100" : "text-[#a55a3d]/40 opacity-60"
                            )}>
                                {step === 1 ? "Practice" : step === 2 ? "Schedule" : "Details"}
                            </span>
                          </div>
                      ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                   {/* {currentStep === 1 && (
                      <motion.div 
                        key="step1"
                        
                        className="space-y-12"
                      >
                         <div className="text-center max-w-2xl mx-auto space-y-4 mb-8">
                            <h2 className="text-4xl md:text-5xl font-serif text-[#4a3b32] italic leading-tight uppercase tracking-tight">Choose Your Practice</h2>
                            <p className="text-[#a55a3d]/60 font-light text-lg">Select the sanctuary experience that resonates with your spirit today.</p>
                         </div>
                         
                         <div className="px-2">
                            <OfferingStep 
                                offerings={offerings}
                                selectedOffering={selectedOffering}
                                onSelect={(off) => {
                                   setSelectedOffering(off);
                                }}
                             />
                         </div>

                         <div className="flex justify-center pt-8">
                            <button 
                               disabled={!canProceedToStep2}
                               onClick={() => setCurrentStep(2)}
                               className={cn(
                                  "px-12 py-5 rounded-full flex items-center gap-4 transition-all uppercase text-[10px] font-black tracking-[0.4em] shadow-xl",
                                  canProceedToStep2 
                                     ? "bg-[#4a3b32] text-white hover:bg-[#bc6746] hover:gap-6 shadow-[#bc6746]/20" 
                                     : "bg-[#f1e4da] text-[#a55a3d]/40 cursor-not-allowed"
                               )}
                            >
                               Next Step <ChevronRight className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                   )} */}

                   {currentStep === 2 && (
                      <motion.div 
                        key="step2"
                        
                        className="space-y-12"
                      >
                         <div className="text-center max-w-2xl mx-auto space-y-4 mb-8">
                            <h2 className="text-4xl md:text-5xl font-serif text-[#4a3b32] italic leading-tight">Schedule Your Visit</h2>
                            <p className="text-[#a55a3d]/60 font-light text-lg">Select a date and time portal for your <strong>{selectedOffering?.title}</strong>.</p>
                         </div>

                         <div className="px-4">
                            <DateTimeStep 
                               selectedDate={selectedDate}
                               selectedSession={selectedSession}
                               onSelectDate={setSelectedDate}
                               onSelectSession={setSelectedSession}
                               availabilityData={{ sessions, exceptions: realtimeExceptions }}
                               offeringId={selectedOffering?.id}
                            />
                         </div>

                         <div className="flex items-center justify-between pt-8 max-w-4xl mx-auto w-full">
                            <button 
                               onClick={() => initialOffering ? onClose?.() : setCurrentStep(1)}
                               className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]/60 hover:text-[#bc6746] transition-all"
                            >
                               <ChevronLeft className="w-5 h-5" /> Return to Classes
                            </button>
                            <button 
                               disabled={!canProceedToStep3}
                               onClick={() => setCurrentStep(3)}
                               className={cn(
                                  "px-12 py-5 rounded-full flex items-center gap-4 transition-all uppercase text-[10px] font-black tracking-[0.4em] shadow-xl",
                                  canProceedToStep3 
                                     ? "bg-[#4a3b32] text-white hover:bg-[#bc6746] hover:gap-6 shadow-[#bc6746]/20" 
                                     : "bg-[#f1e4da] text-[#a55a3d]/40 cursor-not-allowed"
                               )}
                            >
                               Finalize Details <ChevronRight className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                   )}

                   {currentStep === 3 && (
                      <motion.div 
                        key="step3"
                        
                        className="space-y-12"
                      >
                         <div className="text-center max-w-2xl mx-auto space-y-4 mb-8">
                            <h2 className="text-4xl md:text-5xl font-serif text-[#4a3b32] italic leading-tight">Personal Details</h2>
                            <p className="text-[#a55a3d]/60 font-light text-lg">Complete your reservation for <strong>{selectedOffering?.title}</strong> on <strong>{selectedDate ? formatDateLocal(selectedDate) : ''}</strong>.</p>
                         </div>

                         <div className="px-4">
                            <UserInfoStep 
                               userData={userData}
                               setUserData={setUserData}
                               offering={selectedOffering!}
                               session={selectedSession!}
                               date={selectedDate!}
                               gstPercent={gstPercent}
                            />
                         </div>

                         <div className="flex items-center justify-between pt-8 max-w-4xl mx-auto w-full">
                            <button 
                               onClick={() => setCurrentStep(2)}
                               className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]/60 hover:text-[#bc6746] transition-all"
                            >
                               <ChevronLeft className="w-5 h-5" /> Back to Schedule
                            </button>
                            <button 
                               disabled={!canProceedToPayment || isSubmitting}
                               onClick={() => setView('payment')}
                               className={cn(
                                  "px-12 py-5 rounded-full flex items-center gap-4 transition-all uppercase text-[10px] font-black tracking-[0.4em] shadow-xl",
                                  canProceedToPayment 
                                     ? "bg-[#bc6746] text-white hover:gap-6 shadow-[#bc6746]/40" 
                                     : "bg-[#f1e4da] text-[#a55a3d]/40 cursor-not-allowed"
                               )}
                            >
                               {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Proceed to Payment"} <ChevronRight className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </motion.div>
        )}


        {/* VIEW 2: Payment Step (Dedicated Modal/View) */}
        {view === 'payment' && (
            <motion.div 
              key="payment-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-4xl mx-auto py-4"
            >
                <div className="mb-12">
                   <button 
                      onClick={() => setView('booking')}
                      className="group flex items-center text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]/60 hover:text-[#bc6746] transition-all"
                   >
                     <ChevronLeft className="w-5 h-5 mr-3" /> Back to Selection
                   </button>
                </div>

                <PaymentStep 
                   offering={selectedOffering!}
                   session={selectedSession}
                   bookingMode="single"
                   packageSize={1}
                   totalAmount={Number((selectedOffering!.single_price * (1 + gstPercent/100)).toFixed(2))} 
                   userData={userData}
                   isSubmitting={isSubmitting}
                   onFinalize={() => {}} 
                   onCompleteManual={finalizeBooking}
                />
            </motion.div>
        )}

        {/* VIEW 3: Success State */}
        {view === 'success' && (
          <motion.div 
            key="success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto text-center space-y-12 py-24 px-8 bg-white/60 backdrop-blur-3xl rounded-[60px] border border-[#f1e4da] shadow-2xl"
          >
            <div className="w-24 h-24 rounded-full bg-[#bc6746] text-white flex items-center justify-center mx-auto shadow-xl relative group">
                <div className="absolute inset-0 bg-[#bc6746] rounded-full animate-ping opacity-20" />
                <Check className="w-12 h-12 relative z-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-serif text-[#4a3b32] tracking-tighter leading-none italic uppercase">Order Received</h2>
              <p className="text-[#a55a3d] font-light text-xl max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{userData.name}</strong>. Your payment reference and proof have been uploaded. We will verify the transaction and confirm your sanctuary slot via email shortly.
              </p>
            </div>
            <div className="pt-8">
              <button 
                onClick={() => window.location.href = "/"}
                className="px-16 py-6 rounded-full bg-[#4a3b32] text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-[#bc6746] transition-all shadow-xl shadow-[#bc6746]/20"
              >
                Return Home
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
