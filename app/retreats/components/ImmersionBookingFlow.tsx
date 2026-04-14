'use client';

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Loader2, 
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info
} from "lucide-react";
import { bookingService } from "@/lib/api/client";
import { toast } from "react-toastify";
import { validateEmail, validatePhone, cn } from "@/lib/utils";
import PaymentStep from "@/app/online-classes/components/flow/PaymentStep";

interface ImmersionBookingFlowProps {
  itemData: {
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

export default function ImmersionBookingFlow({ itemData }: ImmersionBookingFlowProps) {
  const [view, setView] = useState<'info' | 'payment' | 'success'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({ name: false, email: false, phone: false });
  const gstPercent = 18;

  const totalAmount = useMemo(() => {
    return Number((itemData.price * (1 + gstPercent / 100)).toFixed(2));
  }, [itemData.price, gstPercent]);

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

  const finalizeBooking = async (paymentData: { reference: string, screenshotUrl?: string }) => {
    setIsSubmitting(true);
    try {
      const baseAmount = itemData.price;
      const gstAmount = Number((baseAmount * (gstPercent / 100)).toFixed(2));
      
      const payload = {
        booking_type: 'retreat',
        reference_id: itemData.id,
        user_name: userData.name,
        user_email: userData.email,
        user_phone: userData.phone,
        amount: baseAmount,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        payment_reference: paymentData.reference,
        payment_screenshot_url: paymentData.screenshotUrl,
        metadata: {
          item_title: itemData.title,
          date: itemData.date,
          type_label: 'From Within Immersion'
        }
      };

      const res = await bookingService.create(payload as any);
      if (res.data.success) {
        toast.success("Sanctuary spot requested!");
        setView('success');
        // Scroll to success message
        window.scrollTo({ top: document.getElementById('booking-section')?.offsetTop ? document.getElementById('booking-section')!.offsetTop - 100 : 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to process booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="booking-section" className="relative w-full max-w-5xl mx-auto py-24 px-6 md:px-12 bg-white/40 backdrop-blur-3xl rounded-[60px] border border-[#f1e4da] shadow-2xl overflow-hidden">
      {/* Visual background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#bc6746]/5 to-transparent rounded-bl-[200px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-16 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746] opacity-60">Immersion Enrollment</span>
          <h2 className="text-4xl md:text-6xl font-serif text-[#4a3b32] uppercase tracking-tighter italic leading-none mt-2">Book Your Space</h2>
        </div>

        <AnimatePresence mode="wait">
          {view === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Summary of what is being booked */}
              <div className="p-8 rounded-[40px] bg-[#bc6746]/5 border border-[#bc6746]/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">
                    <Sparkles className="w-3 h-3" />
                    <span>Selected Experience</span>
                  </div>
                  <h3 className="text-3xl font-serif text-[#4a3b32] uppercase italic tracking-tighter leading-none">{itemData.title}</h3>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#a55a3d]/60 uppercase tracking-widest">
                      <Calendar className="w-3 h-3" /> {new Date(itemData.date).toLocaleDateString()}
                    </div>
                    {itemData.location && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#a55a3d]/60 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" /> {itemData.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bc6746]/40 block mb-1">Immersion Fee</span>
                  <span className="text-4xl font-serif font-black text-[#bc6746] tracking-tighter italic leading-none">₹{itemData.price.toLocaleString()}</span>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-2">+ 18% GST Applicable</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={cn("text-[10px] font-black uppercase tracking-widest pl-4", errors.name ? "text-red-500" : "text-[#bc6746]")}>
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
                      "w-full bg-white/50 border rounded-3xl p-5 outline-none focus:ring-2 transition-all font-light text-lg",
                      errors.name ? "border-red-500 focus:ring-red-500/10" : "border-[#f1e4da] focus:ring-[#bc6746]/20"
                    )}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-3">
                  <label className={cn("text-[10px] font-black uppercase tracking-widest pl-4", errors.email ? "text-red-500" : "text-[#bc6746]")}>
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
                    className={cn(
                      "w-full bg-white/50 border rounded-3xl p-5 outline-none focus:ring-2 transition-all font-light text-lg",
                      errors.email ? "border-red-500 focus:ring-red-500/10" : "border-[#f1e4da] focus:ring-[#bc6746]/20"
                    )}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className={cn("text-[10px] font-black uppercase tracking-widest pl-4", errors.phone ? "text-red-500" : "text-[#bc6746]")}>
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
                    className={cn(
                      "w-full bg-white/50 border rounded-3xl p-5 outline-none focus:ring-2 transition-all font-light text-lg",
                      errors.phone ? "border-red-500 focus:ring-red-500/10" : "border-[#f1e4da] focus:ring-[#bc6746]/20"
                    )}
                    placeholder="+91..."
                  />
                </div>
              </div>

              <div className="pt-8 text-center">
                <button 
                  onClick={handleProceed}
                  className="px-16 py-6 bg-[#bc6746] text-white rounded-full font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-[#a55a3d] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-4 mx-auto"
                >
                  Proceed to Payment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'payment' && (
            <motion.div 
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <button 
                onClick={() => setView('info')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#bc6746]/50 hover:text-[#bc6746] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to My Info
              </button>
              
              <div className="soft-glass p-1 rounded-[50px]">
                <PaymentStep 
                    offering={{ 
                        id: itemData.id,
                        title: itemData.title, 
                        description: '',
                        duration: '',
                        single_price: itemData.price,
                        package_5_price: 0,
                        package_10_price: 0,
                        package_15_price: 0,
                        upi_id: itemData.upi_id,
                        payee_name: itemData.payee_name,
                        qr_image_url: itemData.qr_image_url,
                        instructions: itemData.instructions,
                        type: 'retreat'
                    } as any}
                    session={null}
                    bookingMode="single"
                    packageSize={1}
                    totalAmount={totalAmount}
                    userData={userData}
                    isSubmitting={isSubmitting}
                    onFinalize={() => {}} 
                    onCompleteManual={finalizeBooking}
                />
              </div>
            </motion.div>
          )}

          {view === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-10 py-12"
            >
              <div className="w-24 h-24 rounded-full bg-[#bc6746] text-white flex items-center justify-center mx-auto shadow-2xl relative">
                <div className="absolute inset-0 bg-[#bc6746] rounded-full animate-ping opacity-20" />
                <Check className="w-12 h-12 relative z-10" />
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-serif text-[#4a3b32] tracking-tighter italic uppercase leading-none">Request Received</h2>
                <p className="text-[#a55a3d] font-light text-2xl max-w-xl mx-auto leading-relaxed italic">
                  Thank you, <strong>{userData.name}</strong>. Your space in the sanctuary has been requested. We will verify your settlement and confirm via email within 24 hours.
                </p>
              </div>
              <div className="pt-10 flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#bc6746] opacity-40">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Attendance Verification Active</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informational Footer for the section */}
        <div className="mt-16 pt-8 border-t border-[#f1e4da]/60 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <Info className="w-3 h-3 text-[#bc6746]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">18% GST Applied globally</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-3 h-3 text-[#bc6746]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">Verified Attendance Only</span>
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#bc6746]">© 2026 Abharana Kakal Sanctuary</p>
        </div>
      </div>
    </div>
  );
}
