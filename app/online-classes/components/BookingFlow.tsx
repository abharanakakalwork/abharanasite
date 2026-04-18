"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, Check, X } from "lucide-react";
import { yogaService } from "@/lib/api/client";
import { toast } from "react-toastify";

// Sub-components
import DateTimeStep from "./flow/DateTimeStep";
import UserInfoStep from "./flow/UserInfoStep";
import PaymentStep from "./flow/PaymentStep";
import { useYogaRealtime } from "@/lib/hooks/useYogaRealtime";
import { Offering, Session, UserData } from "./flow/types";
import { cn, formatDateLocal, calculateExpiryDate, calculateReminderDate } from "@/lib/utils";
import BookingTypeStep from "./flow/BookingTypeStep";

interface BookingFlowProps {
  initialOffering?: Offering | null;
  initialMode?: "single" | "monthly" | null;
  onClose?: () => void;
}

// ─── Progress stepper (matches reference design) ────────────────────────────
function Stepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: "Practice", n: 1 },
    { label: "Schedule", n: 2 },
    { label: "Details", n: 3 },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, idx) => {
        const done = currentStep > step.n;
        const active = currentStep === step.n;
        return (
          <React.Fragment key={step.n}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-300",
                  done
                    ? "bg-[#bc6746] border-[#bc6746] text-white"
                    : active
                      ? "bg-[#bc6746] border-[#bc6746] text-white"
                      : "bg-white border-[#d9cbc4] text-[#4a3b32]/40",
                )}
              >
                {done ? <Check size={14} strokeWidth={3} /> : step.n}
              </div>
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300",
                  active ? "text-[#2d2420] font-black" : "text-[#4a3b32]/40",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-16 mx-1 mb-5 rounded-full transition-colors duration-500",
                  currentStep > step.n ? "bg-[#bc6746]" : "bg-[#e8ddd5]",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BookingFlow({
  initialOffering,
  initialMode = "single",
  onClose,
}: BookingFlowProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"booking" | "payment" | "success">(
    "booking",
  );
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [initialSessions, setInitialSessions] = useState<Session[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstPercent, setGstPercent] = useState(18);
  const [bookingMode, setBookingMode] = useState<"single" | "monthly" | null>(initialOffering ? initialMode : null);

  const [currentStep, setCurrentStep] = useState(
    initialOffering ? (initialMode === null ? 1 : initialMode === "monthly" ? 2 : 2) : 1
  );
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    initialOffering || null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const { sessions, exceptions: realtimeExceptions } = useYogaRealtime(
    initialSessions,
    exceptions,
  );

  useEffect(() => {
    setMounted(true);
    async function load() {
      try {
        const [offeringRes, availabilityRes] = await Promise.all([
          yogaService.offerings.list(),
          yogaService.sessions.list(),
        ]);
        setOfferings(offeringRes.data.data);
        setInitialSessions(availabilityRes.data.data.sessions || []);
        setExceptions(availabilityRes.data.data.exceptions || []);
      } catch {
        toast.error("Failed to load sanctuary data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const canProceedToStep3 = !!selectedDate && !!selectedSession;
  const canProceedToPayment =
    !!userData.name && !!userData.email && !!userData.phone;

  const finalizeBooking = async (verifiedPaymentData: {
    reference: string;
    screenshotUrl?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const GST_RATE = 0.18;
      const base_amount = bookingMode === "monthly" 
        ? (selectedOffering?.monthly_price || 0)
        : (selectedOffering?.single_price || 0);
        
      const gst_amount = Number((base_amount * GST_RATE).toFixed(2));
      const total_amount = Number((base_amount + gst_amount).toFixed(2));

      const payload = {
        reference_id: bookingMode === "monthly" ? selectedOffering?.id : selectedSession?.id,
        user_name: userData.name,
        user_email: userData.email,
        user_phone: userData.phone,
        booking_type: bookingMode === "monthly" ? "yoga_monthly" : "yoga",
        total_amount,
        amount: base_amount,
        gst_amount,
        payment_reference: verifiedPaymentData.reference,
        payment_screenshot_url: verifiedPaymentData.screenshotUrl,
        metadata: {
          offering_title: selectedOffering?.title,
          session_date: bookingMode === "monthly" ? "Monthly Membership" : selectedSession?.session_date,
          booking_mode: bookingMode
        },
      };

      const res = await yogaService.bookings.create(payload);
      if (res.data.success) {
        toast.success("Booking request initialized!");
        const finalName = userData.name;
        setSelectedOffering(null);
        setSelectedDate(null);
        setSelectedSession(null);
        setUserData({ name: finalName, email: "", phone: "", message: "" });
        setCurrentStep(1);
        setView("success");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to process booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-[#bc6746]">
        <Loader2 className="animate-spin h-8 w-8 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
          Syncing Sanctuary…
        </p>
      </div>
    );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* ═══════════════════ VIEW 1 — Booking Wizard ═══════════════════ */}
        {view === "booking" && (
          <motion.div
            key="booking-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* White card */}
            <div className="bg-white rounded-2xl border border-[#e8ddd5] shadow-sm overflow-hidden">
              {/* Card top — stepper + content */}
              <div className="p-6 md:p-10 relative">
                {/* Close (×) */}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-[#4a3b32]/30 hover:text-[#4a3b32] transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}

                {/* ── Progress Stepper ── */}
                <Stepper currentStep={currentStep} />

                <AnimatePresence mode="wait">
                  {/* ───────── STEP 1 — Select Type ───────── */}
                  {currentStep === 1 && selectedOffering && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BookingTypeStep 
                        offering={selectedOffering} 
                        onSelect={(mode) => {
                          setBookingMode(mode);
                          if (mode === "monthly") {
                            setSelectedDate(new Date());
                            setSelectedSession(null);
                          }
                          setCurrentStep(2);
                        }} 
                      />
                    </motion.div>
                  )}

                  {/* ───────── STEP 2 — Schedule ───────── */}
                  {currentStep === 2 && bookingMode === "single" && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Heading */}
                      <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#bc6746] leading-tight">
                          Choose Your Session Time
                        </h2>
                        <p className="mt-2 text-[14px] text-[#7a6a62]">
                          Select your preferred slot for the{" "}
                          <strong className="text-[#2d2420]">
                            {selectedOffering?.title}
                          </strong>{" "}
                          practice.
                        </p>
                      </div>

                      {/* Calendar + Filters + Slots + Preview Card */}
                      <DateTimeStep
                        selectedDate={selectedDate}
                        selectedSession={selectedSession}
                        onSelectDate={setSelectedDate}
                        onSelectSession={setSelectedSession}
                        availabilityData={{
                          sessions,
                          exceptions: realtimeExceptions,
                        }}
                        offeringId={selectedOffering?.id}
                        offering={selectedOffering}
                      />
                    </motion.div>
                  )}
                  {/* ───────── STEP 2 (Monthly) — Period Confirmation ───────── */}
                  {currentStep === 2 && bookingMode === "monthly" && (
                    <motion.div
                      key="step2-monthly"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#bc6746] leading-tight mb-2">
                          Membership Period
                        </h2>
                        <p className="text-[15px] text-[#7a6a62]">Your 30-day journey starts today.</p>
                      </div>

                      <div className="max-w-2xl mx-auto p-12 bg-[#fdfcf6] rounded-[40px] border border-[#f1e4da] shadow-inner text-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                          <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase text-[#bc6746] tracking-[0.4em]">Activation</p>
                            <p className="text-3xl font-serif text-[#2d2420]">{formatDateLocal(new Date())}</p>
                          </div>
                          <div className="space-y-2 md:border-l border-[#f1e4da] md:pl-12">
                            <p className="text-[11px] font-black uppercase text-[#bc6746] tracking-[0.4em]">Validity</p>
                            <p className="text-3xl font-serif text-[#2d2420]">{formatDateLocal(calculateExpiryDate())}</p>
                          </div>
                        </div>
                        
                        <div className="pt-8 border-t border-[#f1e4da] space-y-4">
                           <div className="flex items-center justify-between text-[14px]">
                              <span className="text-[#7a6a62]">Plan Access:</span>
                              <span className="font-bold text-[#2d2420]">{selectedOffering?.title}</span>
                           </div>
                           <div className="flex items-center justify-between text-[14px]">
                              <span className="text-[#7a6a62]">Monthly Rate:</span>
                              <span className="font-bold text-[#2d2420]">₹{selectedOffering?.monthly_price}</span>
                           </div>
                        </div>

                        <p className="mt-10 text-[12px] text-[#a55a3d]/70 italic leading-relaxed">
                          By continuing, you start an uninterrupted 30-day practice period. 
                          A renewal reminder will be shared 3 days before expiry.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* ───────── STEP 3 — Personal Details ───────── */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Heading */}
                      <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#bc6746] leading-tight">
                          Personal Details
                        </h2>
                        <p className="mt-2 text-[14px] text-[#7a6a62]">
                          Complete your reservation for{" "}
                          <strong className="text-[#2d2420]">
                            {selectedOffering?.title}
                          </strong>{" "}
                          {bookingMode === "monthly" ? (
                            <strong className="text-[#2d2420]">
                              (Monthly Membership)
                            </strong>
                          ) : (
                            <>
                              on{" "}
                              <strong className="text-[#2d2420]">
                                {selectedDate ? formatDateLocal(selectedDate) : ""}
                              </strong>
                            </>
                          )}
                          .
                        </p>
                      </div>

                      <div className="px-0 md:px-4">
                        <UserInfoStep
                          userData={userData}
                          setUserData={setUserData}
                          offering={selectedOffering!}
                          session={selectedSession}
                          date={selectedDate!}
                          gstPercent={gstPercent}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Sticky Bottom Bar ── */}
              <div className="border-t border-[#e8ddd5] bg-white px-6 md:px-10 py-5 flex items-center justify-between gap-4">
                {/* Back */}
                <button
                  onClick={() => {
                    if (currentStep === 1) {
                      onClose?.();
                    } else if (currentStep === 2) {
                      bookingMode === initialMode && initialMode !== null ? onClose?.() : setCurrentStep(1);
                    } else if (currentStep === 3) {
                      setCurrentStep(2);
                    }
                  }}
                  className="flex items-center gap-2 text-[13px] font-medium text-[#7a6a62] hover:text-[#2d2420] transition-colors"
                >
                  <ChevronLeft size={16} />
                  {currentStep === 1 ? (
                    "Cancel"
                  ) : currentStep === 2 ? (
                    "Change Format"
                  ) : (
                    "Back to Schedule"
                  )}
                </button>


                {/* Price (center) — base on step 2, GST-inclusive on step 3 */}
                {selectedOffering && (
                  <p className="text-[15px] text-[#2d2420] hidden sm:block">
                    Price:{" "}
                    <span className="text-[22px] font-bold">
                      ₹
                      {currentStep === 3
                        ? Number(
                            (
                              (bookingMode === "monthly" ? selectedOffering.monthly_price! : selectedOffering.single_price) *
                              (1 + gstPercent / 100)
                            ).toFixed(0),
                          )
                        : (bookingMode === "monthly" ? selectedOffering.monthly_price : selectedOffering.single_price)}
                    </span>
                  </p>
                )}

                {/* Continue / Proceed */}
                {currentStep === 2 && (
                  <button
                    disabled={bookingMode === "single" && !canProceedToStep3}
                    onClick={() => setCurrentStep(3)}
                    className={cn(
                      "flex items-center gap-2 px-10 py-3.5 rounded-xl text-[13px] font-semibold transition-all shadow-sm",
                      (bookingMode === "monthly" || (bookingMode === "single" && canProceedToStep3))
                        ? "bg-[#bc6746] text-white hover:bg-[#a55a3d] hover:shadow-lg hover:shadow-[#bc6746]/20"
                        : "bg-[#e8ddd5] text-[#4a3b32]/40 cursor-not-allowed",
                    )}
                  >
                    Continue to Details
                    <ChevronRight size={16} />
                  </button>
                )}


                {currentStep === 3 && (
                  <button
                    disabled={!canProceedToPayment || isSubmitting}
                    onClick={() => setView("payment")}
                    className={cn(
                      "flex items-center gap-2 px-7 py-3 rounded-xl text-[13px] font-semibold transition-all",
                      canProceedToPayment && !isSubmitting
                        ? "bg-[#5c7a5f] text-white hover:bg-[#4a6250]"
                        : "bg-[#e8ddd5] text-[#4a3b32]/40 cursor-not-allowed",
                    )}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <>
                        Proceed to Payment
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ VIEW 2 — Payment ═══════════════════════════ */}
        {view === "payment" && (
          <motion.div
            key="payment-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="max-w-4xl mx-auto py-4"
          >
            <div className="mb-8">
              <button
                onClick={() => setView("booking")}
                className="flex items-center gap-2 text-[13px] font-medium text-[#7a6a62] hover:text-[#2d2420] transition-colors"
              >
                <ChevronLeft size={16} />
                Back to Selection
              </button>
            </div>

            <PaymentStep
              offering={selectedOffering!}
              session={selectedSession}
              bookingMode={bookingMode}
              packageSize={1}
              totalAmount={Number(
                (
                  (bookingMode === "monthly" ? selectedOffering!.monthly_price! : selectedOffering!.single_price) *
                  (1 + gstPercent / 100)
                ).toFixed(2),
              )}
              userData={userData}
              isSubmitting={isSubmitting}
              onFinalize={() => {}}
              onCompleteManual={finalizeBooking}
            />
          </motion.div>
        )}

        {/* ═══════════════════ VIEW 3 — Success ════════════════════════════ */}
        {view === "success" && (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-10 py-24 px-8 bg-white rounded-2xl border border-[#e8ddd5] shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-[#bc6746] text-white flex items-center justify-center mx-auto shadow-lg relative">
              <div className="absolute inset-0 bg-[#bc6746] rounded-full animate-ping opacity-20" />
              <Check className="w-10 h-10 relative z-10" />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-serif font-semibold text-[#2d2420]">
                Booking Confirmed!
              </h2>
              <p className="text-[15px] text-[#7a6a62] leading-relaxed max-w-md mx-auto">
                Thank you,{" "}
                <strong className="text-[#2d2420]">{userData.name}</strong>.
                Your payment has been submitted. We'll verify the transaction
                and confirm your slot via email shortly.
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/")}
              className="px-10 py-3.5 rounded-xl bg-[#bc6746] text-white text-[13px] font-semibold hover:bg-[#4a6250] transition-colors shadow-sm"
            >
              Return Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
