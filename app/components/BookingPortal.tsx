"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Check, 
  Loader2, 
  ChevronLeft,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles
} from "lucide-react";
import { bookingService, yogaService } from "@/lib/api/client";
import { toast } from "react-toastify";
import { validateEmail, validatePhone, cn } from "@/lib/utils";
import Antigravity from "@/app/components/Antaigravity";
import SelectionColumn from "@/app/online-classes/components/flow/SelectionColumn";
import OrderSummarySidebar from "@/app/online-classes/components/flow/OrderSummarySidebar";
import PaymentStep from "@/app/online-classes/components/flow/PaymentStep";
import Portal from "./Portal";
import { BookingType, UserData, Offering, Session } from "@/lib/types/booking";

interface BookingPortalProps {
  isOpen: boolean;
  onClose: () => void;
  type: BookingType;
  itemData?: {
    id: string;
    title: string;
    price: number;
    date: string;
    time?: string;
    duration?: string;
    upi_id?: string;
    payee_name?: string;
    qr_image_url?: string;
    instructions?: string;
    location?: string;
  };
}

export default function BookingPortal({ isOpen, onClose, type, itemData }: BookingPortalProps) {
  const [view, setView] = useState<'selection' | 'info' | 'payment' | 'success'>('selection');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Yoga Specific State
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Common State
  const [userData, setUserData] = useState<UserData>({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({ name: false, email: false, phone: false });
  const gstPercent = 18;

  useEffect(() => {
    if (!isOpen) {
        setView('selection');
        return;
    }

    if (type === 'yoga') {
        loadYogaData();
    } else {
        // Skip selection for retreat/upcoming
        setView('info');
    }
  }, [isOpen, type]);

  const loadYogaData = async () => {
    setLoading(true);
    try {
      const [offRes, sessRes] = await Promise.all([
        yogaService.offerings.list(),
        yogaService.sessions.list()
      ]);
      setOfferings(offRes.data.data);
      setSessions(sessRes.data.data.sessions || []);
      setExceptions(sessRes.data.data.exceptions || []);
    } catch (err) {
      toast.error("Failed to load sanctuary availability");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = useMemo(() => {
    const base = type === 'yoga' ? (selectedOffering?.single_price || 0) : (itemData?.price || 0);
    return Number((base * (1 + gstPercent / 100)).toFixed(2));
  }, [type, selectedOffering, itemData, gstPercent]);

  const finalizeBooking = async (paymentData: { reference: string, screenshotUrl?: string }) => {
    setIsSubmitting(true);
    try {
      const baseAmount = type === 'yoga' ? (selectedOffering?.single_price || 0) : (itemData?.price || 0);
      const gstAmount = Number((baseAmount * (gstPercent / 100)).toFixed(2));
      
      const payload = {
        booking_type: type,
        reference_id: type === 'yoga' ? selectedSession?.id : itemData?.id,
        user_name: userData.name,
        user_email: userData.email,
        user_phone: userData.phone,
        amount: baseAmount,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        payment_reference: paymentData.reference,
        payment_screenshot_url: paymentData.screenshotUrl,
        metadata: {
            item_title: type === 'yoga' ? selectedOffering?.title : itemData?.title,
            date: type === 'yoga' ? selectedSession?.session_date : itemData?.date,
            type_label: type === 'yoga' ? 'Online Yoga' : type === 'retreat' ? 'Retreat' : 'Sound Healing Session'
        }
      };

      const res = await bookingService.create(payload);
      if (res.data.success) {
        toast.success("Sanctuary spot requested!");
        setView('success');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to process booking");
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const handleProceed = () => {
      const emailValid = validateEmail(userData.email);
      const phoneValid = validatePhone(userData.phone);
      const nameValid = !!userData.name;

      setErrors({
          name: !nameValid,
          email: !emailValid,
          phone: !phoneValid
      });

      if (emailValid && phoneValid && nameValid) {
          setView('payment');
      }
  };

  if (!isOpen) return null;
 
  return (
    <Portal>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        />
  
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white/80 backdrop-blur-2xl rounded-[40px] md:rounded-[60px] shadow-2xl border border-white/50 overflow-hidden flex flex-col"
        >
          {/* Antigravity background */}
          <div className="absolute inset-0 z-[-1] opacity-10 pointer-events-none">
              <Antigravity count={30} color="#bc6746" />
          </div>
  
          {/* Header */}
          <div className="flex items-center justify-between p-6 md:p-10 pb-0 shrink-0">
              <div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746] opacity-60">
                   {type === 'yoga' ? 'Online Sanctuary' : type === 'retreat' ? 'Global Immersion' : 'Synchronized Gathering'}
                 </span>
                 <h2 className="text-3xl md:text-5xl font-serif text-[#4a3b32] uppercase tracking-tighter leading-none italic">
                   Booking Portal
                 </h2>
              </div>
              <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center hover:bg-[#bc6746] hover:text-white transition-all transform hover:rotate-90"
              >
                  <X className="w-6 h-6" />
              </button>
          </div>
  
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar overscroll-contain" data-lenis-prevent>
              <AnimatePresence mode="wait">
                  
                  {/* UPCOMING SESSION SUMMARY (Sticky/Persistent for non-yoga) */}
                  {type === 'upcoming' && itemData && (view === 'info' || view === 'payment') && (
                      <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-10 p-8 rounded-[40px] bg-[#bc6746]/5 border border-[#bc6746]/10 flex flex-col md:flex-row md:items-center justify-between gap-8"
                      >
                          <div className="space-y-4">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Resonant Gathering</span>
                              </div>
                              <h3 className="text-3xl font-serif text-[#4a3b32] uppercase italic tracking-tighter leading-none">
                                  {itemData.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-6">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#a55a3d]/60 uppercase tracking-widest">
                                      <Calendar className="w-3 h-3" /> {itemData.date}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#a55a3d]/60 uppercase tracking-widest">
                                      <Clock className="w-3 h-3" /> {itemData.time} ({itemData.duration})
                                  </div>
                                  {itemData.location && (
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#a55a3d]/60 uppercase tracking-widest">
                                          <MapPin className="w-3 h-3" /> {itemData.location}
                                      </div>
                                  )}
                              </div>
                          </div>
                          <div className="text-right">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bc6746]/40 block mb-1">Energy Exchange</span>
                               <span className="text-4xl font-serif font-black text-[#bc6746] tracking-tighter italic">₹{typeof itemData.price === 'number' ? itemData.price.toFixed(2).replace(/\.00$/, '') : itemData.price}</span>
                          </div>
                      </motion.div>
                  )}
                  {/* YOGA SELECTION */}
                  {view === 'selection' && type === 'yoga' && (
                      <motion.div 
                          key="selection"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
                      >
                          <div className="lg:col-span-8">
                              {loading ? (
                                  <div className="h-64 flex flex-col items-center justify-center text-[#bc6746]">
                                      <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Syncing Availability...</p>
                                  </div>
                              ) : (
                                  <SelectionColumn 
                                      offerings={offerings}
                                      sessions={sessions}
                                      exceptions={exceptions}
                                      selectedOffering={selectedOffering}
                                      selectedDate={selectedDate}
                                      selectedSession={selectedSession}
                                      userData={userData}
                                      errors={errors}
                                      setErrors={setErrors}
                                      onSelectOffering={setSelectedOffering}
                                      onSelectDate={setSelectedDate}
                                      onSelectSession={setSelectedSession}
                                      setUserData={setUserData}
                                  />
                              )}
                          </div>
                          <div className="lg:col-span-4 lg:sticky lg:top-0">
                              <OrderSummarySidebar 
                                  offering={selectedOffering || null}
                                  session={selectedSession || null}
                                  date={selectedDate}
                                  gstPercent={gstPercent}
                                  isSubmitting={false}
                                  canProceed={!!selectedOffering && !!selectedSession}
                                  onProceed={handleProceed}
                              />
                          </div>
                      </motion.div>
                  )}
  
                  {/* USER INFO (FOR NON-YOGA) */}
                  {view === 'info' && (
                      <motion.div 
                          key="info"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="max-w-2xl mx-auto space-y-8"
                      >
                          <div className="text-center space-y-2">
                               <h3 className="text-2xl font-serif text-[#4a3b32]">Personal Information</h3>
                               <p className="text-[#a55a3d]/60 text-sm italic">Capture your presence in the sanctuary.</p>
                          </div>
  
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <label className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", errors.name ? "text-red-500" : "text-[#bc6746]")}>
                                      Full Name {errors.name && "(Required)"}
                                  </label>
                                  <input 
                                      type="text"
                                      value={userData.name}
                                      onChange={(e) => {
                                          setUserData({...userData, name: e.target.value});
                                          if (errors.name) setErrors({...errors, name: false});
                                      }}
                                      className={cn(
                                          "w-full bg-white/50 border rounded-2xl p-4 outline-none focus:ring-2 transition-all font-light",
                                          errors.name ? "border-red-500 focus:ring-red-500/20" : "border-[#f1e4da] focus:ring-[#bc6746]/30"
                                      )}
                                      placeholder="Enter your name"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className={`text-[10px] font-black uppercase tracking-widest ${errors.email ? 'text-red-500' : 'text-[#bc6746]'}`}>
                                      Email Address {errors.email && "(Invalid)"}
                                  </label>
                                  <input 
                                      type="email"
                                      value={userData.email}
                                      onChange={(e) => {
                                          setUserData({...userData, email: e.target.value});
                                          if (errors.email) setErrors({...errors, email: false});
                                      }}
                                      onBlur={() => setErrors(prev => ({ ...prev, email: !validateEmail(userData.email) }))}
                                      className={`w-full bg-white/50 border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-[#f1e4da] focus:ring-[#bc6746]/30'} rounded-2xl p-4 outline-none focus:ring-2 transition-all font-light`}
                                      placeholder="your@email.com"
                                  />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                  <label className={`text-[10px] font-black uppercase tracking-widest ${errors.phone ? 'text-red-500' : 'text-[#bc6746]'}`}>
                                      Phone Number {errors.phone && "(Invalid)"}
                                  </label>
                                  <input 
                                      type="tel"
                                      value={userData.phone}
                                      onChange={(e) => {
                                          setUserData({...userData, phone: e.target.value});
                                          if (errors.phone) setErrors({...errors, phone: false});
                                      }}
                                      onBlur={() => {
                                          if (userData.phone) {
                                              setErrors(prev => ({ ...prev, phone: !validatePhone(userData.phone) }));
                                          }
                                      }}
                                      className={`w-full bg-white/50 border ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-[#f1e4da] focus:ring-[#bc6746]/30'} rounded-2xl p-4 outline-none focus:ring-2 transition-all font-light`}
                                      placeholder="+91..."
                                  />
                              </div>
                          </div>
  
                          <div className="pt-6 text-center">
                              <button 
                                  onClick={handleProceed}
                                  className="w-full py-6 bg-[#bc6746] text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] shadow-xl hover:bg-[#a55a3d] transition-all"
                              >
                                  Proceed to Payment
                              </button>
                              {!userData.name && (
                                  <p className="mt-4 text-[8px] font-black uppercase tracking-widest text-[#bc6746] opacity-40">
                                      Please enter your name to proceed
                                  </p>
                              )}
                          </div>
                      </motion.div>
                  )}
  
                  {/* PAYMENT STEP */}
                  {view === 'payment' && (
                      <motion.div 
                          key="payment"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                      >
                          <div className="mb-10 lg:pl-10">
                              <button 
                                  onClick={() => setView(type === 'yoga' ? 'selection' : 'info')}
                                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#bc6746]/50 hover:text-[#bc6746] transition-colors"
                              >
                                  <ChevronLeft className="w-4 h-4" /> Back to Selection
                              </button>
                          </div>
                          <PaymentStep 
                              offering={type === 'yoga' ? selectedOffering! : { 
                                  id: itemData?.id || '',
                                  title: itemData?.title || '', 
                                  description: '',
                                  duration: '',
                                  single_price: itemData?.price || 0,
                                  package_5_price: 0,
                                  package_10_price: 0,
                                  package_15_price: 0,
                                  // Pass through individual payment details if present
                                  upi_id: itemData?.upi_id,
                                  payee_name: itemData?.payee_name,
                                  qr_image_url: itemData?.qr_image_url,
                                  instructions: itemData?.instructions
                              }}
                              session={type === 'yoga' ? selectedSession : null}
                              bookingMode="single"
                              packageSize={1}
                              totalAmount={totalAmount}
                              userData={userData}
                              isSubmitting={isSubmitting}
                              onFinalize={() => {}} 
                              onCompleteManual={finalizeBooking}
                          />
                      </motion.div>
                  )}
  
                  {/* SUCCESS VIEW */}
                  {view === 'success' && (
                      <motion.div 
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="max-w-3xl mx-auto text-center space-y-10 py-10"
                      >
                          <div className="w-24 h-24 rounded-full bg-[#bc6746] text-white flex items-center justify-center mx-auto shadow-2xl relative">
                              <div className="absolute inset-0 bg-[#bc6746] rounded-full animate-ping opacity-20" />
                              <Check className="w-12 h-12 relative z-10" />
                          </div>
                          <div className="space-y-4">
                              <h2 className="text-5xl font-serif text-[#4a3b32] tracking-tighter italic uppercase leading-none">Order Received</h2>
                              <p className="text-[#a55a3d] font-light text-xl max-w-lg mx-auto leading-relaxed italic">
                                  Thank you, <strong>{userData.name}</strong>. Your sanctuary spot has been requested. We will verify your settlement and confirm via email shortly.
                              </p>
                          </div>
                          <div className="pt-10 flex flex-col items-center gap-6">
                              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#bc6746] opacity-40">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Sanctuary Direct Verification Active</span>
                              </div>
                              <button 
                                  onClick={onClose}
                                  className="px-16 py-6 rounded-full bg-[#4a3b32] text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-[#bc6746] transition-all shadow-xl"
                              >
                                  Close Portal
                              </button>
                          </div>
                      </motion.div>
                  )}
  
              </AnimatePresence>
          </div>
  
          {/* Footer info (Desktop only) */}
          <div className="hidden md:flex shrink-0 p-8 border-t border-[#f1e4da] bg-stone-50/50 justify-between items-center px-14 opacity-40">
               <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                      <AlertCircle className="w-3 h-3 text-[#bc6746]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">18% GST Applied globally</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <User className="w-3 h-3 text-[#bc6746]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">Verified Attendance</span>
                  </div>
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">© 2026 Abharana Kakal Sanctuary</p>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
}
