"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CreditCard, Sparkles, ShieldCheck } from "lucide-react";
import { Offering, Session, UserData } from "./types";
import axios from "axios";
import { toast } from "react-toastify";
import { useRazorpay } from "@/lib/hooks/useRazorpay";

interface PaymentStepProps {
  offering: Offering;
  session: Session | null;
  bookingMode: "single" | "package";
  packageSize: number;
  totalAmount: number;
  userData: UserData;
  isSubmitting: boolean;
  onFinalize: (status: 'paid' | 'pending') => void;
  onCompleteManual: (data: { reference: string, screenshotUrl?: string }) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  offering,
  session,
  bookingMode,
  packageSize,
  totalAmount,
  userData,
  isSubmitting,
  onCompleteManual
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
      const orderRes = await axios.post('/api/razorpay/order', {
        amount: totalAmount,
        receipt: `booking_${Date.now()}`,
        notes: {
            user_name: userData.name,
            user_email: userData.email,
            offering_title: offering.title
        }
      });

      if (!orderRes.data.success) throw new Error("Order creation failed");

      const { order_id } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SdHRDjRRmMGAT2',
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Abharana Kakal",
        description: `Enrollment for ${offering.title}`,
        image: "/logo.png", // Replace with your actual logo
        order_id: order_id,
        handler: async (response: any) => {
            // 3. Verify Payment
            try {
                const verifyRes = await axios.post('/api/razorpay/verify', {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    bookingData: {
                        booking_type: (offering.type as any) || 'yoga',
                        reference_id: offering.id,
                        user_name: userData.name,
                        user_email: userData.email,
                        user_phone: userData.phone,
                        amount: offering.single_price,
                        gst_amount: Number((totalAmount - offering.single_price).toFixed(2)),
                        total_amount: totalAmount,
                        metadata: {
                            item_title: offering.title,
                            payment_method: 'razorpay'
                        }
                    }
                });

                if (verifyRes.data.success) {
                    toast.success("Payment successful! Welcome to the sanctuary.");
                    onCompleteManual({ reference: response.razorpay_payment_id }); 
                }
            } catch (err) {
                toast.error("Signature verification failed. Please contact support.");
            }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,
        },
        theme: {
          color: "#bc6746",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize standard checkout");
    } finally {
      setIsProcessingRazorpay(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/60 p-8 md:p-12 rounded-[40px] border border-[#f1e4da] shadow-lg relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#bc6746]/5 to-transparent rounded-bl-[100px]" />
        
        <div className="space-y-4 mb-10 w-full relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746] opacity-60">Step 5: Settlement</span>
            <h3 className="text-3xl font-serif text-[#4a3b32] uppercase tracking-tighter leading-none italic">Secure Payment</h3>
            <p className="text-[11px] font-bold text-[#a55a3d]/60 uppercase tracking-widest mt-2">{offering.title}</p>
        </div>

        <div className="w-full max-w-sm mb-10 pb-10 border-b border-[#f1e4da]/50">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Total Amount</span>
                <span className="text-5xl font-serif font-black text-[#bc6746] tracking-tighter italic leading-none">₹{typeof totalAmount === 'number' ? totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : totalAmount}</span>
            </div>
            <p className="text-right text-[8px] font-black uppercase tracking-widest text-[#bc6746]/40 mt-2">+ 18% GST Included</p>
        </div>

        <button 
            onClick={handleRazorpayPayment}
            disabled={isProcessingRazorpay || isSubmitting}
            className="w-full max-w-sm py-6 bg-[#bc6746] text-white rounded-[30px] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-[#bc6746]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-4 disabled:opacity-30 group"
        >
            {isProcessingRazorpay ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Pay Now <Sparkles className="w-4 h-4 text-white/50" /></>}
        </button>
        
        <div className="mt-8 flex items-center gap-3 justify-center opacity-60 text-center">
            <ShieldCheck className="w-4 h-4 text-[#bc6746]" />
            <p className="text-[9px] text-[#bc6746] font-black uppercase tracking-widest italic">Secured by Razorpay. All cards & UPI supported.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
