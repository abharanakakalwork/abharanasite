"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { Offering, Session, UserData } from "./types";
import axios from "axios";
import { toast } from "react-toastify";
import { useRazorpay } from "@/lib/hooks/useRazorpay";

interface PaymentStepProps {
  offering: Offering;
  session: Session | null;
  bookingMode: "single" | "package" | "monthly" | null;
  packageSize: number;
  totalAmount: number;
  userData: UserData;
  isSubmitting: boolean;
  onFinalize: (status: "paid" | "pending") => void;
  onCompleteManual: (data: { reference: string; screenshotUrl?: string }) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  offering,
  session,
  bookingMode,
  packageSize,
  totalAmount,
  userData,
  isSubmitting,
  onCompleteManual,
}) => {
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const { isLoaded: isRazorpayLoaded } = useRazorpay();

  const handleRazorpayPayment = async () => {
    if (!isRazorpayLoaded) {
      return toast.error("Payment system is still loading. Please try again in a moment.");
    }

    setIsProcessingRazorpay(true);
    try {
      // 1. Create Order on Backend
      const orderRes = await axios.post("/api/razorpay/order", {
        amount: totalAmount,
        receipt: `booking_${Date.now()}`,
        notes: {
          user_name: userData.name,
          user_email: userData.email,
          offering_title: offering.title,
        },
      });

      if (!orderRes.data.success) throw new Error("Order creation failed");

      const { order_id } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SdHRDjRRmMGAT2",
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Abharana Kakal",
        description: `Enrollment for ${offering.title}`,
        image: "/logo.png",
        order_id: order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await axios.post("/api/razorpay/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: {
                booking_type: (offering.type as any) || "yoga",
                reference_id: offering.id,
                user_name: userData.name,
                user_email: userData.email,
                user_phone: userData.phone,
                amount: offering.single_price,
                gst_amount: Number((totalAmount - offering.single_price).toFixed(2)),
                total_amount: totalAmount,
                metadata: {
                  item_title: offering.title,
                  payment_method: "razorpay",
                },
              },
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful! Welcome to the sanctuary.");
              onCompleteManual({ reference: response.razorpay_payment_id });
            }
          } catch {
            toast.error("Signature verification failed. Please contact support.");
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,
        },
        theme: { color: "#bc6746" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize checkout");
    } finally {
      setIsProcessingRazorpay(false);
    }
  };

  const displayAmount =
    typeof totalAmount === "number"
      ? totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })
      : totalAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      {/* Decorative lotus watermarks */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.07] hidden lg:block">
        <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 C30 30 10 40 10 60 C10 80 30 90 50 90 C70 90 90 80 90 60 C90 40 70 30 50 10Z" stroke="#bc6746" strokeWidth="3" fill="none"/>
          <path d="M50 25 C35 40 20 50 20 65 C20 77 35 87 50 87 C65 87 80 77 80 65 C80 50 65 40 50 25Z" stroke="#bc6746" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="fixed right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.07] hidden lg:block">
        <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 C30 30 10 40 10 60 C10 80 30 90 50 90 C70 90 90 80 90 60 C90 40 70 30 50 10Z" stroke="#bc6746" strokeWidth="3" fill="none"/>
          <path d="M50 25 C35 40 20 50 20 65 C20 77 35 87 50 87 C65 87 80 77 80 65 C80 50 65 40 50 25Z" stroke="#bc6746" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      {/* Main card */}
      <div className="w-full max-w-lg bg-white rounded-[28px] border border-[#e8ddd5] shadow-md overflow-hidden">
        <div className="px-12 pt-12 pb-10 flex flex-col items-center text-center">

          {/* Step label */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#7a6a62] mb-3">
            Step 5: Settlement
          </p>

          {/* Heading */}
          <h2 className="text-[32px] md:text-[38px] font-serif font-semibold uppercase tracking-[0.05em] text-[#2d2420] leading-none mb-2">
            Secure Payment
          </h2>

          {/* Offering name */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7a6a62]">
            {offering.title}
          </p>

          {/* Divider */}
          <div className="w-full border-t border-[#e8ddd5] my-8" />

          {/* Amount row */}
          <div className="w-full flex items-end justify-between px-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#2d2420]">
              Total Amount
            </span>
            <span className="text-[46px] font-bold text-[#bc6746] leading-none">
              ₹{displayAmount}
            </span>
          </div>
          <div className="w-full text-right px-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#bc6746]/60">
              + 18% GST Included
            </span>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-[#e8ddd5] my-8" />

          {/* Pay Now button */}
          <button
            onClick={handleRazorpayPayment}
            disabled={isProcessingRazorpay || isSubmitting}
            className="w-full py-5 bg-[#bc6746] hover:bg-[#a55a3d] active:scale-[0.98] text-white rounded-full text-[15px] font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-[#bc6746]/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessingRazorpay ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard size={18} />
                PAY NOW
              </>
            )}
          </button>

          {/* Security badge */}
          <div className="mt-6 flex items-center gap-2 text-[#7a6a62]/70">
            <ShieldCheck size={14} className="shrink-0" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
              Secured by Razorpay. All Cards &amp; UPI Supported.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom lotus watermark */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.06]">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 C30 30 10 40 10 60 C10 80 30 90 50 90 C70 90 90 80 90 60 C90 40 70 30 50 10Z" stroke="#bc6746" strokeWidth="3" fill="none"/>
          <path d="M50 25 C35 40 20 50 20 65 C20 77 35 87 50 87 C65 87 80 77 80 65 C80 50 65 40 50 25Z" stroke="#bc6746" strokeWidth="2" fill="none"/>
        </svg>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
