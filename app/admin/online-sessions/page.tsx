"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { yogaService, mediaService } from '@/lib/api/client';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Users, 
  Link as LinkIcon,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  CalendarDays,
  ShieldCheck,
  Ban,
  X,
  CreditCard,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Calendar } from '@/components/ui/Calendar';
import { SlotSelector } from '@/components/booking/SlotSelector';
import { cn, formatDateLocal, formatTime12h } from '@/lib/utils';
import { useYogaRealtime } from '@/lib/hooks/useYogaRealtime';
import { AdminTable } from '@/components/admin/AdminTable';

// Custom Modals
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';
import { PromptModal } from '@/components/admin/modals/PromptModal';

interface Offering {
  id: string;
  title: string;
  description: string;
  duration: string;
  single_price: number;
  package_5_price: number;
  package_10_price: number;
  package_15_price: number;
  image_url?: string;
}

interface Session {
  id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  cooldown_minutes: number;
  capacity: number;
  booked_count: number;
  meeting_link: string;
  is_active: boolean;
  is_blocked: boolean;
  status: string;
  blocked_reason: string | null;
  yoga_offerings: Offering;
}

interface Booking {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  booking_type: string;
  total_amount: number;
  payment_status: 'pending' | 'submitted' | 'paid' | 'failed' | 'verified';
  booking_status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  payment_reference?: string;
  payment_screenshot_url?: string;
  base_amount: number;
  gst_amount: number;
  created_at: string;
  yoga_sessions: Session;
}

export default function OnlineSessionsAdmin() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'availability' | 'offerings' | 'payment'>('availability');
  
  // Selected Data for Availability Manager
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [offeringForm, setOfferingForm] = useState({
    title: '',
    description: '',
    duration: '60 Mins',
    single_price: 500,
    package_5_price: 2250,
    package_10_price: 4000,
    package_15_price: 5500,
    image_url: ''
  });

  const [slotForm, setSlotForm] = useState({
    offering_id: '',
    start_time: '08:00',
    duration_minutes: 60,
    cooldown_minutes: 60,
    capacity: 15,
    meeting_link: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    upi_id: '',
    payee_name: '',
    qr_image_url: '',
    instructions: '',
    gst_percent: 18,
    is_active: true
  });

  // Modal System State
  const [modalState, setModalState] = useState<{
    confirm?: { isOpen: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean; isLoading?: boolean };
    prompt?: { 
        isOpen: boolean; title: string; message: string; onConfirm: (val: string) => void; 
        type?: 'text' | 'date' | 'time'; defaultValue?: string; placeholder?: string; 
        confirmText?: string; isLoading?: boolean 
    };
  }>({
    confirm: { isOpen: false, title: '', message: '', onConfirm: () => {} },
    prompt: { isOpen: false, title: '', message: '', onConfirm: () => {} }
  });

  // Realtime Integration for the entire dashboard
  const { 
    sessions, setSessions, 
    exceptions, setExceptions 
  } = useYogaRealtime([], [], []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, offeringsRes, paymentRes] = await Promise.all([
        yogaService.sessions.list(),
        yogaService.offerings.list(),
        yogaService.paymentSettings.get()
      ]);
      
      setSessions(sessionsRes.data.data.sessions || []);
      setExceptions(sessionsRes.data.data.exceptions || []);
      setOfferings(offeringsRes.data.data);
      
      if (paymentRes.data.success && paymentRes.data.data) {
        setPaymentForm(paymentRes.data.data);
      }
      
      if (offeringsRes.data.data.length > 0) {
        setSlotForm(prev => ({ ...prev, offering_id: offeringsRes.data.data[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load classes data');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOffering) {
        await yogaService.offerings.update(editingOffering.id, offeringForm);
        toast.success('Offering updated successfully');
      } else {
        await yogaService.offerings.create(offeringForm);
        toast.success('New offering created');
      }
      setIsOfferingModalOpen(false);
      setEditingOffering(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save offering');
    }
  };

  const handleDeleteOffering = async (id: string) => {
    setModalState(prev => ({
        ...prev,
        confirm: {
            isOpen: true,
            title: 'Delete Offering',
            message: 'This will permanently resolve this offering. Existing sessions linked to this offering may be affected.',
            isDanger: true,
            onConfirm: async () => {
                setModalState(s => ({ ...s, confirm: { ...s.confirm!, isLoading: true } }));
                try {
                    await yogaService.offerings.delete(id);
                    toast.success('Offering dissolved');
                    fetchData();
                } catch (err) {
                    toast.error('Failed to dissolve offering');
                } finally {
                    setModalState(s => ({ ...s, confirm: { ...s.confirm!, isOpen: false, isLoading: false } }));
                }
            }
        }
    }));
  };

  const isPastSlot = useMemo(() => {
    if (!selectedDate) return false;
    const now = new Date();
    const [h, m] = slotForm.start_time.split(':').map(Number);
    const checkDate = new Date(selectedDate);
    checkDate.setHours(h, m, 0, 0);
    return checkDate < now;
  }, [selectedDate, slotForm.start_time]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    // 1. Validation: No past slots
    if (isPastSlot) {
        return toast.warning("You cannot create a slot in the past.");
    }

    // 2. Validation: Basic Fields
    if (!slotForm.offering_id) return toast.info("Please select a class format");
    if (slotForm.capacity <= 0) return toast.info("Capacity must be at least 1");
    if (!slotForm.meeting_link.startsWith('http')) return toast.info("Enter a valid meeting URL");
    
    try {
      const dateStr = formatDateLocal(selectedDate);
      
      // 3. Validation: Prevent Duplicates (Same date, same time)
      const isDuplicate = sessions.some(s => 
          s.session_date === dateStr && 
          s.start_time === slotForm.start_time
      );

      if (isDuplicate) {
          return toast.error("A class slot at this exact time already exists.");
      }

      const payload = {
        ...slotForm,
        session_date: dateStr
      };
      await yogaService.sessions.create(payload);
      toast.success('Sanctuary slot synchronized');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create slot');
    }
  };

  const handleDeleteSession = async (id: string) => {
    setModalState(prev => ({
        ...prev,
        confirm: {
            isOpen: true,
            title: 'Remove Session Slot',
            message: 'Are you sure you want to remove this available session? Confirmed bookings for this slot will need to be cancelled manually.',
            isDanger: true,
            onConfirm: async () => {
                setModalState(s => ({ ...s, confirm: { ...s.confirm!, isLoading: true } }));
                try {
                    await yogaService.sessions.delete(id);
                    toast.success('Sanctuary slot removed');
                    fetchData();
                } catch (err) {
                    toast.error('Failed to remove slot');
                } finally {
                    setModalState(s => ({ ...s, confirm: { ...s.confirm!, isOpen: false, isLoading: false } }));
                }
            }
        }
    }));
  };

  const toggleDateLock = async () => {
    if (!selectedDate) return;
    const dateStr = formatDateLocal(selectedDate);
    const isCurrentlyBlocked = exceptions.some(e => e.exception_date === dateStr && e.is_blocked);

    try {
      if (isCurrentlyBlocked) {
        await yogaService.availability.delete(dateStr);
        toast.success('Date is now available');
      } else {
        await yogaService.availability.create({
            exception_date: dateStr,
            is_blocked: true,
            reason: 'Admin Override'
        });
        toast.success('Date has been blocked');
      }
      fetchData();
    } catch (err) {
      toast.error('Failed to update date status');
    }
  };

  // Derived data
  const activeSessions = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = formatDateLocal(selectedDate);
    const filtered = sessions.filter(s => s.session_date === dateStr);
    console.log('[DASHBOARD] Filtering sessions for:', dateStr, 'Count:', filtered.length);
    return filtered;
  }, [selectedDate, sessions]);

  const isBlocked = useMemo(() => {
    if (!selectedDate) return false;
    const dateStr = formatDateLocal(selectedDate);
    return exceptions.some(e => e.exception_date === dateStr && e.is_blocked);
  }, [selectedDate, exceptions]);



  const handleUpdatePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActioningId('payment_update');
    try {
      await yogaService.paymentSettings.update(paymentForm);
      toast.success('Payment settings synchronized');
      fetchData();
    } catch (err) {
      toast.error('Failed to update payment settings');
    } finally {
      setActioningId(null);
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setActioningId('qr_upload');
    try {
      const res = await mediaService.upload(file, 'payments');
      setPaymentForm(prev => ({ ...prev, qr_image_url: res.data.url }));
      toast.success('QR Code uploaded');
    } catch (err) {
      toast.error('Failed to upload QR code');
    } finally {
      setActioningId(null);
    }
  };

  const handleOfferingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setActioningId('offering_image_upload');
    try {
      const res = await mediaService.upload(file, 'offerings');
      setOfferingForm(prev => ({ ...prev, image_url: res.data.url }));
      toast.success('Offering image synchronized');
    } catch (err) {
      toast.error('Failed to upload offering image');
    } finally {
      setActioningId(null);
    }
  };

  if (loading && offerings.length === 0) return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-[#bc6746]">
        <Loader2 className="animate-spin h-8 w-8 mb-4" /> 
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Synchronizing sanctuary data...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-4xl font-serif text-[#4a3b32] tracking-tighter uppercase italic">Classes Dashboard</h1>
            <p className="mt-2 text-[#a55a3d]/70 max-w-md text-sm italic">Verification, availability management, and class configuration.</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-[#f1e4da] text-[#bc6746] hover:bg-[#bc6746]/5 transition-all shadow-sm group"
            title="Refresh Sanctuary Data"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
        
        <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-[#f1e4da] shadow-sm overflow-hidden overflow-x-auto max-w-full">
           {['availability', 'offerings', 'payment'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                    "px-4 md:px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest relative whitespace-nowrap",
                    activeTab === tab ? 'bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20' : 'text-[#a55a3d]/50 hover:text-[#bc6746] hover:bg-white/40'
                )}
             >
                {tab}
             </button>
           ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab: Payment Settings */}
        {activeTab === 'payment' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
             <div className="lg:col-span-4">
                <GlassCard className="p-0 overflow-hidden border-[#bc6746]/10">
                   <div className="bg-[#bc6746]/5 p-6 border-b border-[#f1e4da]">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#bc6746]">Visual Identification</h4>
                   </div>
                   <div className="p-8">
                      {paymentForm.qr_image_url ? (
                        <div className="relative aspect-square group overflow-hidden rounded-[32px] ring-1 ring-[#bc6746]/10">
                            <img 
                                src={paymentForm.qr_image_url} 
                                alt="QR Code" 
                                className="w-full h-full object-cover"
                            />
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer select-none">
                                <RefreshCw className="w-6 h-6 mb-2" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Swap Code</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
                            </label>
                        </div>
                      ) : (
                        <label className="flex aspect-square flex-col items-center justify-center rounded-[32px] bg-[#bc6746]/5 border border-dashed border-[#bc6746]/20 cursor-pointer hover:bg-[#bc6746]/10 transition-colors">
                            <Plus className="w-8 h-8 text-[#bc6746]/40 mb-2" />
                            <p className="text-[9px] text-[#bc6746]/60 font-black uppercase tracking-widest">Upload QR Code</p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
                        </label>
                      )}
                      
                      <p className="mt-6 text-[10px] text-center italic text-[#a55a3d]/40 leading-relaxed">
                        This QR code will be presented to users during the manual checkout flow for Online Sessions.
                      </p>
                   </div>
                </GlassCard>
             </div>

             <div className="lg:col-span-8">
                <GlassCard className="p-10 border-[#bc6746]/10">
                   <form onSubmit={handleUpdatePaymentSettings} className="space-y-8">
                      <div className="flex items-center justify-between pb-6 border-b border-[#f1e4da]">
                         <h3 className="text-2xl font-serif text-[#4a3b32] italic uppercase">Financial Controls</h3>
                         <CreditCard className="w-6 h-6 text-[#bc6746]/30" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">UPI Identifier</label>
                             <input 
                                type="text"
                                value={paymentForm.upi_id}
                                onChange={e => setPaymentForm({ ...paymentForm, upi_id: e.target.value })}
                                placeholder="name@upi"
                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-6 py-4 text-sm text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif"
                             />
                         </div>
                         <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Account Holder Name</label>
                             <input 
                                type="text"
                                value={paymentForm.payee_name}
                                onChange={e => setPaymentForm({ ...paymentForm, payee_name: e.target.value })}
                                placeholder="Abharana Sanctuary"
                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-6 py-4 text-sm text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif"
                             />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                         <div className="md:col-span-8 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Payment Instructions</label>
                             <textarea 
                                value={paymentForm.instructions}
                                onChange={e => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                                placeholder="Scan QR and upload snippet of the transaction..."
                                rows={1}
                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-6 py-4 text-sm text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif italic"
                             />
                         </div>
                         <div className="md:col-span-4 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">GST Percentage (%)</label>
                             <input 
                                type="number"
                                value={paymentForm.gst_percent}
                                onChange={e => setPaymentForm({ ...paymentForm, gst_percent: Number(e.target.value) })}
                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-6 py-4 text-sm text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif"
                             />
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-6 rounded-3xl bg-[#bc6746]/5 border border-[#bc6746]/10">
                         <div className="flex items-center space-x-4">
                            <div className={cn(
                                "p-3 rounded-xl shadow-lg",
                                paymentForm.is_active ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                            )}>
                               <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-xs font-black uppercase tracking-widest text-[#4a3b32]">Payment Acceptance</p>
                               <p className="text-[10px] text-[#bc6746]/60 italic font-serif">Toggle visibility for manual payment flow</p>
                            </div>
                         </div>
                         <button 
                            type="button"
                            onClick={() => setPaymentForm({ ...paymentForm, is_active: !paymentForm.is_active })}
                            className={cn(
                                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out px-0 py-0",
                                paymentForm.is_active ? 'bg-[#bc6746]' : 'bg-gray-200'
                            )}
                         >
                            <span className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                paymentForm.is_active ? 'translate-x-5' : 'translate-x-0'
                            )} />
                         </button>
                      </div>

                      <button 
                         type="submit"
                         disabled={actioningId === 'payment_update'}
                         className="w-full py-5 bg-[#bc6746] text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-[#bc6746]/20 transition-all hover:bg-[#a55a3d] active:scale-95 flex items-center justify-center gap-3"
                      >
                         {actioningId === 'payment_update' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                         Synchronize Payment Settings
                      </button>
                   </form>
                </GlassCard>
             </div>
          </motion.div>
        )}

        {/* Tab 1: Availability Manager */}
        {activeTab === 'availability' && (
          <motion.div 
            key="availability"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start"
          >
            <div className="xl:col-span-7">
               <Calendar 
                 selectedDate={selectedDate}
                 onDateSelect={setSelectedDate}
                 availabilityData={{ sessions, exceptions }}
                 isAdmin
               />
            </div>

            <div className="xl:col-span-5 space-y-8">
                <GlassCard className="border-[#bc6746]/10 p-10">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#f1e4da]">
                        <div>
                            <h2 className="text-2xl font-serif text-[#4a3b32] uppercase tracking-tighter">
                                {selectedDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                            </h2>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/40">Control Station</p>
                        </div>
                        <CalendarDays className="w-6 h-6 text-[#bc6746]/40" />
                    </div>

                    <div className="space-y-8">
                        {/* Status Toggle */}
                        <div className={cn(
                            "p-6 rounded-[30px] border-2 transition-all flex items-center justify-between",
                            isBlocked ? "border-red-100 bg-red-50/20" : "border-green-100 bg-green-50/20"
                        )}>
                            <div className="flex items-center space-x-4">
                                {isBlocked ? (
                                    <div className="p-3 bg-red-500 rounded-2xl text-white shadow-xl shadow-red-500/20"><Ban className="w-5 h-5" /></div>
                                ) : (
                                    <div className="p-3 bg-green-500 rounded-2xl text-white shadow-xl shadow-green-500/20"><ShieldCheck className="w-5 h-5" /></div>
                                )}
                                <div>
                                    <p className="text-sm font-black text-[#4a3b32] uppercase tracking-wide">{isBlocked ? 'Date Blocked' : 'Date Available'}</p>
                                    <p className="text-[9px] text-[#a55a3d]/50 font-black uppercase tracking-widest">{isBlocked ? 'Manual Override' : 'Accepting Slots'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleDateLock}
                                className={cn(
                                    "px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                    isBlocked ? "bg-white text-green-600 border border-green-200" : "bg-white text-red-500 border border-red-200"
                                )}
                            >
                                {isBlocked ? 'Make Available' : 'Block Date'}
                            </button>
                        </div>

                        {/* Existing Slots */}
                        {!isBlocked && (
                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a55a3d]/40 pl-1 italic">Active Time Slots</h4>
                                <div className="space-y-4">
                                    {activeSessions.length > 0 ? activeSessions.map(slot => {
                                        const now = new Date();
                                        const sessionStart = new Date(`${slot.session_date}T${slot.start_time}`);
                                        const sessionEnd = new Date(sessionStart.getTime() + (slot.duration_minutes || 60) * 60000);
                                        const isCompleted = now > sessionEnd;

                                        return (
                                        <div key={slot.id} className={cn(
                                            "flex flex-col p-6 bg-white/40 rounded-3xl border transition-all space-y-4",
                                            slot.is_blocked || slot.status === 'cancelled' ? "border-red-200 bg-red-50/10 grayscale-[0.5]" : "border-[#f1e4da] hover:bg-white/80"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-5">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl",
                                                        slot.is_blocked ? "bg-red-500/10 text-red-500" : (isCompleted ? "bg-gray-100 text-gray-400" : "bg-[#bc6746]/5 text-[#bc6746]")
                                                    )}>
                                                        {slot.is_blocked ? <Ban className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-md font-bold text-[#4a3b32] tracking-tighter">
                                                            {formatTime12h(slot.start_time)}
                                                            {slot.is_blocked && <span className="ml-2 text-[8px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-black uppercase tracking-widest">Blocked</span>}
                                                            {isCompleted && !slot.is_blocked && <span className="ml-2 text-[8px] px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full font-black uppercase tracking-widest">Completed</span>}
                                                        </p>
                                                        <p className="text-[10px] text-[#bc6746]/60 font-black uppercase tracking-widest">{slot.yoga_offerings?.title}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-[#4a3b32]">{slot.booked_count} / {slot.capacity}</p>
                                                    <p className="text-[9px] text-[#a55a3d]/40 uppercase tracking-widest font-black italic">Bookings</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-[#f1e4da]/50">
                                                <div className="flex gap-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] text-[#a55a3d]/40 font-black uppercase tracking-widest leading-none">Duration</p>
                                                        <p className="text-[10px] font-bold text-[#4a3b32]">{slot.duration_minutes}m</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] text-[#a55a3d]/40 font-black uppercase tracking-widest leading-none">Cooldown</p>
                                                        <p className="text-[10px] font-bold text-[#4a3b32]">{slot.cooldown_minutes}m</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setModalState(prev => ({
                                                                ...prev,
                                                                prompt: {
                                                                    isOpen: true,
                                                                    title: 'Reschedule Session',
                                                                    message: 'Select the new date for this sanctuary session.',
                                                                    type: 'date',
                                                                    defaultValue: slot.session_date,
                                                                    confirmText: 'Next Step',
                                                                    onConfirm: (newDate) => {
                                                                        // Step 2: Time Selection
                                                                        setModalState(s => ({
                                                                            ...s,
                                                                            prompt: {
                                                                                ...s.prompt!,
                                                                                title: 'Select Start Time',
                                                                                message: `New date: ${newDate}. Now enter the commencement time.`,
                                                                                type: 'time',
                                                                                defaultValue: slot.start_time,
                                                                                confirmText: 'Finalize',
                                                                                onConfirm: async (newTime) => {
                                                                                    setModalState(m => ({ ...m, prompt: { ...m.prompt!, isLoading: true } }));
                                                                                    try {
                                                                                        await yogaService.sessions.update(slot.id, { 
                                                                                            session_date: newDate, 
                                                                                            start_time: newTime, 
                                                                                            status: 'scheduled' 
                                                                                        });
                                                                                        toast.success('Session transitioned successfully');
                                                                                        fetchData();
                                                                                    } catch (err) {
                                                                                        toast.error('Failed to transition session');
                                                                                    } finally {
                                                                                        setModalState(m => ({ 
                                                                                            ...m, 
                                                                                            prompt: { ...m.prompt!, isOpen: false, isLoading: false } 
                                                                                        }));
                                                                                    }
                                                                                }
                                                                            }
                                                                        }));
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        className="px-3 py-2 bg-white border border-[#f1e4da] text-[#bc6746] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#bc6746] hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <RefreshCw className="w-3 h-3" /> Reschedule
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            const newBlocked = !slot.is_blocked;
                                                            if (newBlocked) {
                                                                setModalState(prev => ({
                                                                    ...prev,
                                                                    prompt: {
                                                                        isOpen: true,
                                                                        title: 'Block Session',
                                                                        message: 'Provide a reason for blocking this specific time slot.',
                                                                        defaultValue: 'Maintenance',
                                                                        onConfirm: async (reason) => {
                                                                            setModalState(s => ({ ...s, prompt: { ...s.prompt!, isLoading: true } }));
                                                                            try {
                                                                                await yogaService.sessions.update(slot.id, { is_blocked: true, blocked_reason: reason });
                                                                                toast.success('Slot blocked');
                                                                                fetchData();
                                                                            } catch (err) {
                                                                                toast.error('Failed to update slot');
                                                                            } finally {
                                                                                setModalState(s => ({ ...s, prompt: { ...s.prompt!, isOpen: false, isLoading: false } }));
                                                                            }
                                                                        }
                                                                    }
                                                                }));
                                                            } else {
                                                                try {
                                                                    await yogaService.sessions.update(slot.id, { is_blocked: false, blocked_reason: null });
                                                                    toast.success('Slot unblocked');
                                                                    fetchData();
                                                                } catch (err) {
                                                                    toast.error('Failed to update slot');
                                                                }
                                                            }
                                                        }}
                                                        className="p-3 text-[#bc6746] hover:bg-[#bc6746]/5 transition-colors bg-white rounded-xl border border-[#f1e4da] shadow-sm"
                                                    >
                                                        {slot.is_blocked ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleDeleteSession(slot.id)} className="p-3 text-[#f1e4da] hover:text-red-500 transition-colors bg-white rounded-xl border border-[#f1e4da] shadow-sm">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    }) : (
                                        <div className="text-center py-10 border-2 border-dashed border-[#f1e4da] rounded-3xl opacity-30 italic text-xs uppercase tracking-widest font-black">
                                            Empty Field
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Create Slot Form */}
                        {!isBlocked && (
                            <div className="pt-8 border-t border-[#f1e4da]">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#bc6746] pl-1 mb-6">Create New Slot</h4>
                                <form onSubmit={handleCreateSlot} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Class Format</label>
                                            <select 
                                                value={slotForm.offering_id}
                                                onChange={e => setSlotForm({ ...slotForm, offering_id: e.target.value })}
                                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-5 py-4 text-[13px] text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none appearance-none font-serif italic"
                                            >
                                                {offerings.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Start Hour</label>
                                            <input 
                                                type="time"
                                                value={slotForm.start_time}
                                                onChange={e => setSlotForm({ ...slotForm, start_time: e.target.value })}
                                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-5 py-4 text-[13px] text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Duration (Min)</label>
                                            <input 
                                                type="number"
                                                value={slotForm.duration_minutes}
                                                onChange={e => setSlotForm({ ...slotForm, duration_minutes: Number(e.target.value) })}
                                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-5 py-4 text-[13px] text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Cooldown (Min)</label>
                                            <input 
                                                type="number"
                                                value={slotForm.cooldown_minutes}
                                                onChange={e => setSlotForm({ ...slotForm, cooldown_minutes: Number(e.target.value) })}
                                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-5 py-4 text-[13px] text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Capacity</label>
                                            <input 
                                                type="number"
                                                value={slotForm.capacity}
                                                onChange={e => setSlotForm({ ...slotForm, capacity: Number(e.target.value) })}
                                                className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-5 py-4 text-[13px] text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-2">Meeting Portal Link (Zoom)</label>
                                        <input 
                                            type="url"
                                            placeholder="https://zoom.us/j/..."
                                            value={slotForm.meeting_link}
                                            onChange={e => setSlotForm({ ...slotForm, meeting_link: e.target.value })}
                                            className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-5 py-4 text-[13px] text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none placeholder:italic"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isPastSlot}
                                        className={cn(
                                            "w-full py-5 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3",
                                            isPastSlot ? "bg-gray-200 cursor-not-allowed text-gray-400" : "bg-[#bc6746] shadow-[#bc6746]/20 active:scale-95"
                                        )}
                                    >
                                        {isPastSlot ? <AlertCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        {isPastSlot ? "Cannot Create Past Slot" : "Create Class Slot"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
          </motion.div>
        )}


        {/* Tab 4: Offerings Configuration */}
        {activeTab === 'offerings' && (
          <motion.div 
            key="offerings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <div className="flex justify-end">
                <button 
                  onClick={() => {
                    setEditingOffering(null);
                    setOfferingForm({
                      title: '',
                      description: '',
                      duration: '60 Mins',
                      single_price: 500,
                      package_5_price: 2250,
                      package_10_price: 4000,
                      package_15_price: 5500,
                      image_url: ''
                    });
                    setIsOfferingModalOpen(true);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#bc6746] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#bc6746]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Offering</span>
                </button>
             </div>

             <AdminTable 
               data={offerings}
               columns={[
                 {
                   header: "Offering",
                   accessor: (item) => (
                     <div className="flex items-center space-x-4">
                        {item.image_url ? (
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-[#f1e4da]">
                            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-[#bc6746]/5 flex items-center justify-center text-[#bc6746]">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-[#4a3b32] uppercase tracking-tight">{item.title}</span>
                          <span className="text-[10px] text-[#bc6746]/60 font-black uppercase tracking-widest leading-none mt-1">{item.duration}</span>
                        </div>
                     </div>
                   )
                 },
                 {
                    header: "Description",
                    accessor: (item) => (
                      <p className="text-[10px] italic text-[#a55a3d]/60 line-clamp-1 max-w-[200px]">
                        {item.description}
                      </p>
                    )
                 },
                 {
                   header: "Standard",
                   accessor: (item) => (
                     <span className="font-serif font-black text-[#bc6746]">
                       ₹{typeof item.single_price === 'number' ? item.single_price.toFixed(2).replace(/\.00$/, '') : item.single_price}
                     </span>
                   )
                 },
                 {
                   header: "PK 5",
                   accessor: (item) => (
                     <span className="font-serif font-bold text-[#4a3b32]/60">
                       ₹{typeof item.package_5_price === 'number' ? item.package_5_price.toFixed(2).replace(/\.00$/, '') : item.package_5_price}
                     </span>
                   )
                 },
                 {
                   header: "PK 10",
                   accessor: (item) => (
                     <span className="font-serif font-bold text-[#4a3b32]/60">
                       ₹{typeof item.package_10_price === 'number' ? item.package_10_price.toFixed(2).replace(/\.00$/, '') : item.package_10_price}
                     </span>
                   )
                 },
                 {
                   header: "PK 15",
                   accessor: (item) => (
                     <span className="font-serif font-bold text-[#4a3b32]/60">
                       ₹{typeof item.package_15_price === 'number' ? item.package_15_price.toFixed(2).replace(/\.00$/, '') : item.package_15_price}
                     </span>
                   )
                 },
                 {
                   header: "Actions",
                   className: "text-right",
                   accessor: (item) => (
                     <div className="flex items-center justify-end space-x-2">
                        <button 
                         onClick={() => {
                           setEditingOffering(item);
                           setOfferingForm({
                             title: item.title,
                             description: item.description,
                             duration: item.duration,
                             single_price: item.single_price,
                             package_5_price: item.package_5_price,
                             package_10_price: item.package_10_price,
                             package_15_price: item.package_15_price,
                             image_url: item.image_url || ''
                           });
                           setIsOfferingModalOpen(true);
                         }}
                         className="p-2 rounded-xl bg-white border border-[#f1e4da] text-[#bc6746] hover:bg-[#bc6746] hover:text-white transition-all shadow-sm active:scale-95"
                       >
                         <RefreshCw className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={() => handleDeleteOffering(item.id)}
                         className="p-2 rounded-xl bg-white border border-[#f1e4da] text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </div>
                   )
                 }
               ]}
             />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Offering Modal - Enhanced */}
      <AnimatePresence>
        {isOfferingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4a3b32]/80 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-2xl">
              <GlassCard className="border-[#bc6746]/20 p-12 shadow-[0_50px_100px_rgba(0,0,0,0.3)] rounded-[60px] overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-[#bc6746] to-transparent" />
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-4xl font-serif text-[#4a3b32] uppercase italic tracking-tighter">{editingOffering ? 'Evolve Offering' : 'New Creation'}</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#a55a3d]/40 mt-2">Class Logic Configuration</p>
                    </div>
                    <button onClick={() => setIsOfferingModalOpen(false)} className="p-4 border border-[#f1e4da] rounded-2xl hover:bg-[#bc6746]/5 transition-all"><X className="w-6 h-6 text-[#4a3b32]" /></button>
                </div>

                <form onSubmit={handleCreateOffering} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/50 ml-2">Class Title</label>
                      <input type="text" required placeholder="e.g. Lunar Hatha Flow" value={offeringForm.title} onChange={e => setOfferingForm({ ...offeringForm, title: e.target.value })} className="w-full bg-[#fffdf8] border-b border-[#f1e4da] px-2 py-4 text-2xl font-serif italic text-[#4a3b32] focus:border-[#bc6746] outline-none transition-all placeholder:text-[#bc6746]/10"/>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/50 ml-2">Temporal Pulse</label>
                       <input type="text" required placeholder="e.g. 75 Mins" value={offeringForm.duration} onChange={e => setOfferingForm({ ...offeringForm, duration: e.target.value })} className="w-full bg-[#fffdf8] border-b border-[#f1e4da] px-2 py-4 text-2xl font-serif italic text-[#4a3b32] focus:border-[#bc6746] outline-none transition-all placeholder:text-[#bc6746]/10"/>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/50 ml-2">Intrinsic Description</label>
                    <textarea rows={2} required placeholder="What essence does this practice carry?" value={offeringForm.description} onChange={e => setOfferingForm({ ...offeringForm, description: e.target.value })} className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-[30px] p-6 text-md italic font-medium text-[#4a3b32] focus:border-[#bc6746] outline-none transition-all placeholder:text-[#bc6746]/10"/>
                  </div>

                  {/* Offering Image Upload */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/50 ml-2">Offering Imagery</label>
                     <div className="flex items-center gap-8 p-6 rounded-[40px] bg-[#bc6746]/5 border border-[#bc6746]/10">
                        {offeringForm.image_url ? (
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-1 ring-[#bc6746]/20 group">
                             <img src={offeringForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                             <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <RefreshCw className="w-4 h-4 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleOfferingImageUpload} />
                             </label>
                          </div>
                        ) : (
                          <label className="flex w-24 h-24 flex-col items-center justify-center rounded-2xl bg-white border border-dashed border-[#bc6746]/20 cursor-pointer hover:bg-[#bc6746]/5 transition-colors">
                             <Plus className="w-5 h-5 text-[#bc6746]/40" />
                             <input type="file" className="hidden" accept="image/*" onChange={handleOfferingImageUpload} />
                          </label>
                        )}
                        <div className="flex-1 space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">Visual Resonance</p>
                           <p className="text-[9px] text-[#bc6746]/60 italic">Upload a curated image to represent this flow on our digital sanctuary.</p>
                           {actioningId === 'offering_image_upload' && (
                             <div className="flex items-center gap-2 mt-2 text-[#bc6746]">
                               <Loader2 className="w-3 h-3 animate-spin" />
                               <span className="text-[8px] font-black uppercase tracking-widest">Bridging Storage...</span>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {['single_price', 'package_5_price', 'package_10_price', 'package_15_price'].map((field) => (
                        <div key={field} className="space-y-2">
                           <label className="text-[8px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-1">
                               {field === 'single_price' ? 'Standard' : `PK ${field.split('_')[1]}`}
                           </label>
                           <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bc6746]/40 font-bold">₹</span>
                            <input type="number" required value={(offeringForm as any)[field]} onChange={e => setOfferingForm({ ...offeringForm, [field]: Number(e.target.value) })} className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-4 pl-9 py-4 font-serif font-black text-[#bc6746] outline-none focus:border-[#bc6746] transition-all"/>
                          </div>
                        </div>
                    ))}
                  </div>

                  <div className="flex space-x-6 pt-10">
                    <button type="submit" className="flex-1 py-6 rounded-3xl bg-[#bc6746] text-white text-[11px] font-black uppercase tracking-[0.5em] transition-all shadow-[0_20px_40px_rgba(188,103,70,0.3)] hover:scale-[1.02] active:scale-95">
                        {editingOffering ? 'Verified Update' : 'Initialize Creation'}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM MODALS */}
      {/* Custom Modals Portal */}
      {modalState.confirm?.isOpen && (
        <ConfirmModal 
          isOpen={modalState.confirm.isOpen}
          title={modalState.confirm.title}
          message={modalState.confirm.message}
          variant={modalState.confirm.isDanger ? 'danger' : 'info'}
          isLoading={modalState.confirm.isLoading}
          onConfirm={modalState.confirm.onConfirm}
          onClose={() => setModalState(prev => ({ 
            ...prev, 
            confirm: { ...prev.confirm!, isOpen: false } 
          }))}
        />
      )}

      {modalState.prompt?.isOpen && (
        <PromptModal 
          isOpen={modalState.prompt.isOpen}
          title={modalState.prompt.title}
          message={modalState.prompt.message}
          type={modalState.prompt.type}
          defaultValue={modalState.prompt.defaultValue}
          placeholder={modalState.prompt.placeholder}
          confirmText={modalState.prompt.confirmText}
          isLoading={modalState.prompt.isLoading}
          onConfirm={modalState.prompt.onConfirm}
          onClose={() => setModalState(prev => ({ 
            ...prev, 
            prompt: { ...prev.prompt!, isOpen: false } 
          }))}
        />
      )}
    </div>
  );
}
