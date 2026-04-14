"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  CheckCircle2, 
  Loader2,
  QrCode,
  Info,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Offering, Session, UserData } from "./types";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "react-toastify";
import { useRazorpay } from "@/lib/hooks/useRazorpay";
import { Sparkles, CreditCard } from "lucide-react";

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
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { isLoaded: isRazorpayLoaded } = useRazorpay();

  React.useEffect(() => {
    // If the offering already has individual payment info, use it.
    if ((offering as any).upi_id || (offering as any).qr_image_url) {
        setSettings({
            upi_id: (offering as any).upi_id,
            payee_name: (offering as any).payee_name,
            qr_image_url: (offering as any).qr_image_url,
            instructions: (offering as any).instructions
        });
        setLoadingSettings(false);
        return;
    }

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/yoga/payment-settings');
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch payment settings');
        } finally {
            setLoadingSettings(false);
        }
    };
    fetchSettings();
  }, [offering]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return toast.error("File size exceeds 5MB");

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'payment-proofs');

      const res = await axios.post('/api/bookings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setScreenshotUrl(res.data.url);
        toast.success("Screenshot uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload screenshot. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!screenshotUrl) {
      return toast.error("Please upload a payment screenshot to proceed.");
    }
    // Reference ID is no longer required as per user request
    onCompleteManual({ reference: "MANUAL_QR_PAYMENT", screenshotUrl });
  };

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
                        booking_type: offering.type === 'retreat' ? 'retreat' : 'yoga',
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
                    onCompleteManual({ reference: response.razorpay_payment_id }); // Reuse manual success state
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
      className="max-w-4xl mx-auto"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Card: QR & Payment Identity */}
        <div className="flex flex-col h-full bg-white/60 p-6 md:p-8 rounded-[40px] border border-[#f1e4da] shadow-sm relative overflow-hidden">
            <div className="text-center space-y-2 mb-6">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#bc6746] opacity-60">Step 5: Scan & Pay</span>
               <h3 className="text-2xl font-serif text-[#4a3b32] uppercase tracking-tighter leading-none italic">Sanctuary Payment</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center">
                <div className="relative group mx-auto w-48 h-48 bg-white rounded-3xl p-4 shadow-xl border border-[#f1e4da] flex items-center justify-center overflow-hidden">
                    {loadingSettings ? (
                        <div className="flex flex-col items-center gap-2">
                           <Loader2 className="w-6 h-6 animate-spin text-[#bc6746]/40" />
                           <p className="text-[8px] font-black uppercase tracking-widest text-[#bc6746]/30">Synchronizing...</p>
                        </div>
                    ) : settings?.qr_image_url ? (
                        <img 
                            src={settings.qr_image_url} 
                            alt="Payment QR" 
                            className="w-full h-full object-contain" 
                        />
                    ) : (
                        <div className="text-[#bc6746]/10">
                            <QrCode className="w-24 h-24" />
                        </div>
                    )}
                </div>

                <div className="mt-8 space-y-3 w-full border-t border-[#f1e4da] pt-6">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#a55a3d]/50 font-bold uppercase tracking-widest">Beneficiary</span>
                        <span className="text-[#4a3b32] font-black uppercase tracking-tighter italic">{settings?.payee_name || "Abharana Kakal Sanctuary"}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#a55a3d]/50 font-bold uppercase tracking-widest">UPI Portal</span>
                        <span className="text-[#4a3b32] font-black lowercase tracking-tighter italic">{settings?.upi_id || "abharana@upi"}</span>
                    </div>
                    
                    {settings?.instructions && (
                        <div className="pt-4 border-t border-[#f1e4da]/50">
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#bc6746] mb-1">Instructions</p>
                            <p className="text-[10px] text-[#4a3b32] italic leading-relaxed">{settings.instructions}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-end pt-4 border-t border-[#f1e4da]">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#bc6746]">Total Amount</span>
                        <span className="text-3xl font-serif font-black text-[#bc6746] tracking-tighter italic leading-none">₹{typeof totalAmount === 'number' ? totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : totalAmount}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Card: Evidence & Settlement */}
        <div className="flex flex-col h-full bg-white p-8 md:p-10 rounded-[50px] shadow-2xl shadow-[#bc6746]/10 border border-[#f1e4da] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#bc6746]/5 to-transparent rounded-bl-[100px]" />
            
            <div className="flex-1 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/60 flex items-center gap-2">
                       <Upload className="w-3 h-3" /> Settlement Evidence
                    </label>
                    <div className="relative h-44 rounded-[30px] border-2 border-dashed border-[#f1e4da] hover:border-[#bc6746]/30 transition-all flex flex-col items-center justify-center bg-[#fffdf8] overflow-hidden group/upload">
                        {screenshotUrl ? (
                            <div className="text-center p-4 space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                                <p className="text-[9px] font-black text-[#bc6746] uppercase tracking-widest italic">Proof Captured</p>
                                <button 
                                  onClick={() => setScreenshotUrl("")}
                                  className="text-[8px] uppercase font-bold text-[#a55a3d] hover:text-[#bc6746] transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" /> Replace Proof
                                </button>
                            </div>
                        ) : (
                          <>
                            {isUploading ? (
                              <Loader2 className="w-8 h-8 animate-spin text-[#bc6746]" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-[#bc6746]/20 group-hover/upload:scale-110 transition-transform duration-500" />
                                <p className="text-[9px] text-[#a55a3d]/40 font-black italic uppercase tracking-[0.3em] text-center px-4">Upload Screenshot<br/><span className="text-[8px] opacity-40 lowercase">(required for manual settlement)</span></p>
                              </>
                            )}
                            <input 
                               type="file" 
                               accept="image/*"
                               onChange={handleFileUpload}
                               disabled={isUploading}
                               className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <button 
                        onClick={handleRazorpayPayment}
                        disabled={isProcessingRazorpay || isSubmitting}
                        className="w-full py-7 bg-[#bc6746] text-white rounded-[24px] font-black uppercase tracking-[0.4em] text-[9px] shadow-2xl shadow-[#bc6746]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-4 disabled:opacity-30 group"
                    >
                        {isProcessingRazorpay ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Instant Activation (Card/UPI) <Sparkles className="w-3 h-3 text-white/50" /></>}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#f1e4da]"></div>
                        </div>
                        <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest">
                            <span className="bg-white px-4 text-[#a55a3d]/40 italic">or manual settlement</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || isProcessingRazorpay}
                        className="w-full py-5 border border-[#bc6746]/20 text-[#bc6746] rounded-[24px] font-black uppercase tracking-[0.4em] text-[9px] hover:bg-[#bc6746]/5 transition-all flex items-center justify-center space-x-4 disabled:opacity-30 group"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Upload Screenshot <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                    
                    <div className="flex items-center gap-3 justify-center opacity-60">
                       <Info className="w-3 h-3 text-[#bc6746]" />
                       <p className="text-[8px] text-[#bc6746] font-black uppercase tracking-widest italic">Manual review verified in 1-6 hours</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </motion.div>
  );
};

export default PaymentStep;
