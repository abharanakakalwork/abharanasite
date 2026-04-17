"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { yogaService, mediaService } from '@/lib/api/client';
import { 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle,
  Loader2,
  CalendarDays,
  ShieldCheck,
  Ban,
  X,
  CreditCard,
  Image as ImageIcon,
  RefreshCw,
  Pencil,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Calendar } from '@/components/ui/Calendar';
import { cn, formatDateLocal, formatTime12h } from '@/lib/utils';
import { useYogaRealtime } from '@/lib/hooks/useYogaRealtime';
import { AdminTable } from '@/components/admin/AdminTable';

// Custom Modals
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';
import { PromptModal } from '@/components/admin/modals/PromptModal';
import { Offering, Session, BookingType } from '@/lib/types/booking';

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

const ADMIN_TABS: Array<'availability' | 'offerings'> = ['availability', 'offerings'];
const TAB_LABELS: Record<(typeof ADMIN_TABS)[number], string> = {
  availability: 'Schedule',
  offerings: 'Class Types',
};
const OFFERING_PRICE_FIELDS = ['single_price'] as const;

export default function OnlineSessionsAdmin() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'availability' | 'offerings'>('availability');
  
  // Selected Data for Availability Manager
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [isSubmittingOffering, setIsSubmittingOffering] = useState(false);

  const [offeringForm, setOfferingForm] = useState({
    title: '',
    description: '',
    duration: '60 Mins',
    single_price: 1500,
    monthly_price: 0,
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
      const [sessionsRes, offeringsRes] = await Promise.all([
        yogaService.sessions.list(),
        yogaService.offerings.list()
      ]);
      
      setSessions(sessionsRes.data.data.sessions || []);
      setExceptions(sessionsRes.data.data.exceptions || []);
      setOfferings(offeringsRes.data.data);
      
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
    setIsSubmittingOffering(true);
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
    } finally {
      setIsSubmittingOffering(false);
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
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(message || 'Failed to create slot');
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

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  const selectedDateSummary = useMemo(() => {
    if (isBlocked) return 'Date is currently blocked from accepting bookings.';
    const totalBookings = activeSessions.reduce((sum, slot) => sum + slot.booked_count, 0);
    return `${activeSessions.length} Active Time Slot${activeSessions.length === 1 ? '' : 's'} | ${totalBookings} Total Booking${totalBookings === 1 ? '' : 's'} | Date is accepting bookings.`;
  }, [activeSessions, isBlocked]);




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
            <h1 className="text-4xl font-serif text-[#4a3b32] tracking-tighter uppercase italic">Yoga Classes</h1>
            <p className="mt-2 text-[#a55a3d]/70 max-w-md text-sm italic">Manage class dates, class types, and payment settings.</p>
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
             {ADMIN_TABS.map((tab) => (
               <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                      "px-4 md:px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest relative whitespace-nowrap",
                      activeTab === tab ? 'bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20' : 'text-[#a55a3d]/50 hover:text-[#bc6746] hover:bg-white/40'
                  )}
               >
                  {TAB_LABELS[tab as keyof typeof TAB_LABELS]}
               </button>
             ))}
          </div>
      </div>

      <AnimatePresence mode="wait">

        {/* Tab 1: Availability Manager */}
        {activeTab === 'availability' && (
          <motion.div 
            key="availability"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(26rem,0.95fr)] xl:items-start"
          >
            <div>
               <Calendar 
                 selectedDate={selectedDate}
                 onDateSelect={setSelectedDate}
                 availabilityData={{ sessions, exceptions }}
                 isAdmin
                 className="min-h-[42rem]"
               />
            </div>

            <div className="space-y-6">
                <GlassCard className="overflow-hidden border-[#d8c6b7] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(248,242,235,0.96)_48%,_rgba(244,234,224,0.92))] p-0 shadow-[0_20px_50px_rgba(98,71,50,0.08)]">
                    <div className="p-6 sm:p-7">
                    <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#eadcd0] pb-5">
                        <div>
                            <h2 className="text-[2rem] font-serif leading-none tracking-tight text-[#2f221a]">
                                {selectedDateLabel}
                            </h2>
                            <p className="mt-2 text-sm text-[#6f5645]">
                              {selectedDateSummary}
                            </p>
                        </div>
                        <CalendarDays className="mt-1 h-5 w-5 text-[#7a5a48]" />
                    </div>

                    <div className="space-y-6">
                        {/* Status Toggle */}
                        <div className={cn(
                            "rounded-[24px] border bg-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all",
                            isBlocked ? "border-[#e6c7c7]" : "border-[#1d6b45]/30"
                        )}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    {isBlocked ? (
                                        <div className="rounded-2xl bg-[#8f3d2e] p-3 text-white shadow-lg shadow-[#8f3d2e]/20"><Ban className="h-5 w-5" /></div>
                                    ) : (
                                        <div className="rounded-2xl bg-[#1d6b45] p-3 text-white shadow-lg shadow-[#1d6b45]/20"><ShieldCheck className="h-5 w-5" /></div>
                                    )}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#6f5645]">Date Active</p>
                                        <p className="mt-1 text-base font-semibold text-[#2f221a]">{isBlocked ? 'Date blocked for bookings' : 'Date available for bookings'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={toggleDateLock}
                                    className={cn(
                                        "rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all",
                                        isBlocked ? "border-[#1d6b45]/20 bg-white text-[#1d6b45]" : "border-[#8f3d2e]/20 bg-white text-[#8f3d2e]"
                                    )}
                                >
                                    {isBlocked ? 'Make Available' : 'Block Date'}
                                </button>
                            </div>
                        </div>

                        {/* Existing Slots */}
                        {!isBlocked && (
                            <div className="space-y-5">
                                <div className="space-y-1">
                                  <h4 className="text-[1.55rem] font-serif text-[#2f221a]">Active Time Slots ({activeSessions.length})</h4>
                                  <p className="text-sm text-[#7f6654]">Review availability, capacity, and booking state for every live class on this date.</p>
                                </div>
                                <div className="space-y-4">
                                    {activeSessions.length > 0 ? activeSessions.map(slot => {
                                        const now = new Date();
                                        const sessionStart = new Date(`${slot.session_date}T${slot.start_time}`);
                                        const sessionEnd = new Date(sessionStart.getTime() + (slot.duration_minutes || 60) * 60000);
                                        const isCompleted = now > sessionEnd;
                                        const occupancy = slot.capacity > 0 ? Math.min(100, Math.round((slot.booked_count / slot.capacity) * 100)) : 0;

                                        return (
                                        <div key={slot.id} className={cn(
                                            "space-y-4 rounded-[24px] border bg-white/85 p-4 shadow-[0_12px_30px_rgba(98,71,50,0.06)] transition-all",
                                            slot.is_blocked || slot.status === 'cancelled' ? "border-[#e4c7c2] bg-[#fff7f5]" : "border-[#eadcd0]"
                                        )}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start space-x-4">
                                                    <div className={cn(
                                                        "rounded-2xl p-3",
                                                        slot.is_blocked ? "bg-[#f5dedd] text-[#8f3d2e]" : (isCompleted ? "bg-[#ece8e3] text-[#8f8378]" : "bg-[#f5e2d7] text-[#bc6746]")
                                                    )}>
                                                        {slot.is_blocked ? <Ban className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                          <p className="text-base font-semibold tracking-tight text-[#2f221a]">
                                                            {formatTime12h(slot.start_time)}
                                                          </p>
                                                          {slot.is_blocked && <span className="rounded-full bg-[#f9dfda] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#8f3d2e]">Blocked</span>}
                                                          {isCompleted && !slot.is_blocked && <span className="rounded-full bg-[#ece8e3] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#6b635a]">Completed</span>}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#4f3d30]">
                                                          <span>{slot.yoga_offerings?.title}</span>
                                                          <span className="rounded-full border border-[#d9ccc2] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#7f6654]">
                                                            {slot.status}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                          <div className="h-2.5 w-28 overflow-hidden rounded-full bg-[#eddccf]">
                                                            <div className="h-full rounded-full bg-[#bc6746]" style={{ width: `${occupancy}%` }} />
                                                          </div>
                                                          <p className="text-[11px] text-[#6f5645]">{slot.booked_count} booked / {slot.capacity} capacity</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl border border-[#eadcd0] bg-[#fbf7f2] px-3 py-2 text-right">
                                                    <p className="text-xs font-black text-[#2f221a]">{slot.booked_count} / {slot.capacity}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Bookings</p>
                                                </div>
                                            </div>

                                            <div className="rounded-[20px] border border-[#efe3d9] bg-[#fcfaf7] px-4 py-3 text-[11px] text-[#6f5645]">
                                              Local System Time: {now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}, {selectedDateLabel}
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#efe3d9] pt-4">
                                                <div className="flex gap-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black uppercase tracking-widest leading-none text-[#9b7f69]">Duration</p>
                                                        <p className="text-[10px] font-bold text-[#2f221a]">{slot.duration_minutes}m</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black uppercase tracking-widest leading-none text-[#9b7f69]">Cooldown</p>
                                                        <p className="text-[10px] font-bold text-[#2f221a]">{slot.cooldown_minutes}m</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black uppercase tracking-widest leading-none text-[#9b7f69]">Meeting Link</p>
                                                        <a href={slot.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#bc6746] hover:underline">
                                                          <LinkIcon className="h-3 w-3" /> Open
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
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
                                                        className="flex items-center gap-2 rounded-xl border border-[#eadcd0] bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[#6f5645] transition-all hover:border-[#bc6746] hover:bg-[#bc6746] hover:text-white"
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
                                                        className="rounded-xl border border-[#eadcd0] bg-white p-3 text-[#6f5645] transition-colors hover:bg-[#f5e2d7]"
                                                    >
                                                        {slot.is_blocked ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleDeleteSession(slot.id)} className="rounded-xl border border-[#eadcd0] bg-white p-3 text-[#a48876] transition-colors hover:bg-[#fff0ec] hover:text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    }) : (
                                        <div className="rounded-[24px] border border-dashed border-[#dbc8b8] bg-white/55 px-6 py-10 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8e725d]">No Active Slots</p>
                                            <p className="mt-2 text-sm italic text-[#7f6654]">Create a new time slot below to start accepting bookings on this date.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Create Slot Form */}
                        {!isBlocked && (
                            <div className="border-t border-[#eadcd0] pt-6">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-[1.45rem] font-serif text-[#2f221a]">Add a New Time Slot</h4>
                                    <p className="text-sm text-[#7f6654]">Configure format, start hour, duration, cooldown, and meeting details.</p>
                                  </div>
                                  {isPastSlot && (
                                    <div className="rounded-2xl bg-[#f5ded7] px-3 py-2 text-right text-[10px] text-[#8f3d2e]">
                                      <p className="font-black uppercase tracking-widest">Past Slot</p>
                                      <p className="mt-1 max-w-[14rem] text-[11px] normal-case">Selected time is before the current local system time.</p>
                                    </div>
                                  )}
                                </div>
                                <form onSubmit={handleCreateSlot} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)_9rem]">
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Class Format</label>
                                            <select 
                                                value={slotForm.offering_id}
                                                onChange={e => setSlotForm({ ...slotForm, offering_id: e.target.value })}
                                                className="w-full appearance-none rounded-2xl border border-[#dccbbd] bg-white px-4 py-3 text-[13px] text-[#2f221a] outline-none ring-[#bc6746] transition focus:ring-1"
                                            >
                                                {offerings.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Start Hour</label>
                                            <input 
                                                type="time"
                                                value={slotForm.start_time}
                                                onChange={e => setSlotForm({ ...slotForm, start_time: e.target.value })}
                                                className="w-full rounded-2xl border border-[#dccbbd] bg-white px-4 py-3 text-[13px] text-[#2f221a] outline-none ring-[#bc6746] transition focus:ring-1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Status</label>
                                            <div className={cn(
                                                "rounded-2xl border px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em]",
                                                isPastSlot ? "border-[#e4c7c2] bg-[#fff0ec] text-[#8f3d2e]" : "border-[#d7ccb8] bg-[#fbf7f2] text-[#6f5645]"
                                            )}>
                                                {isPastSlot ? 'Past' : 'Ready'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Duration (Min)</label>
                                            <input 
                                                type="number"
                                                value={slotForm.duration_minutes}
                                                onChange={e => setSlotForm({ ...slotForm, duration_minutes: Number(e.target.value) })}
                                                className="w-full rounded-2xl border border-[#dccbbd] bg-white px-4 py-3 text-[13px] text-[#2f221a] outline-none ring-[#bc6746] transition focus:ring-1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Cooldown (Min)</label>
                                            <input 
                                                type="number"
                                                value={slotForm.cooldown_minutes}
                                                onChange={e => setSlotForm({ ...slotForm, cooldown_minutes: Number(e.target.value) })}
                                                className="w-full rounded-2xl border border-[#dccbbd] bg-white px-4 py-3 text-[13px] text-[#2f221a] outline-none ring-[#bc6746] transition focus:ring-1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Capacity</label>
                                            <input 
                                                type="number"
                                                value={slotForm.capacity}
                                                onChange={e => setSlotForm({ ...slotForm, capacity: Number(e.target.value) })}
                                                className="w-full rounded-2xl border border-[#dccbbd] bg-white px-4 py-3 text-[13px] text-[#2f221a] outline-none ring-[#bc6746] transition focus:ring-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-[#8e725d]">Meeting Portal Link</label>
                                        <input 
                                            type="url"
                                            placeholder="https://zoom.link"
                                            value={slotForm.meeting_link}
                                            onChange={e => setSlotForm({ ...slotForm, meeting_link: e.target.value })}
                                            className="w-full rounded-2xl border border-[#dccbbd] bg-white px-4 py-3 text-[13px] text-[#2f221a] outline-none ring-[#bc6746] transition placeholder:text-[#ad998a] focus:ring-1"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isPastSlot}
                                        className={cn(
                                            "flex w-full items-center justify-center gap-3 rounded-3xl py-4 text-[10px] font-black uppercase tracking-[0.32em] transition-all",
                                            isPastSlot ? "cursor-not-allowed bg-[#e5e1dc] text-[#9f9890]" : "bg-[#d9dde3] text-[#49443e] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] active:scale-[0.99]"
                                        )}
                                    >
                                        {isPastSlot ? <AlertCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        {isPastSlot ? "Cannot Create Past Slot" : "Create Class Slot"}
                                    </button>
                                </form>
                            </div>
                        )}
                        {isBlocked && (
                            <div className="rounded-[24px] border border-dashed border-[#dcc9bd] bg-white/50 px-6 py-10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8e725d]">Date Locked</p>
                                <p className="mt-2 text-sm text-[#7f6654]">Unblock this date to review existing slots or add new availability.</p>
                            </div>
                        )}
                    </div>
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
                      monthly_price: 0,
                      image_url: ''
                    });
                    setIsOfferingModalOpen(true);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#bc6746] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#bc6746]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Class Type</span>
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
                             monthly_price: item.monthly_price || 0,
                             image_url: item.image_url || ''
                           });
                           setIsOfferingModalOpen(true);
                         }}
                         className="p-2 rounded-xl bg-white border border-[#f1e4da] text-[#bc6746] hover:bg-[#bc6746] hover:text-white transition-all shadow-sm active:scale-95"
                       >
                         <Pencil className="h-4 w-4" />
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

      {/* Offering Modal — Redesigned */}
      <AnimatePresence>
        {isOfferingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2d1e17]/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="w-full max-w-xl"
              style={{ maxHeight: '90vh' }}
            >
              <div className="relative bg-[#fdf7f2] border border-[#e8d5c5] rounded-3xl shadow-[0_32px_80px_rgba(74,59,50,0.28)] overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
                {/* Top accent */}
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#bc6746] to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-7 pb-5 shrink-0 border-b border-[#eddccc]">
                  <div>
                    <h2 className="text-2xl font-serif text-[#3a2b22] italic tracking-tight leading-none">
                      {editingOffering ? 'Edit Class Type' : 'New Class Type'}
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.45em] text-[#a55a3d]/50 mt-1.5">Offering Configuration</p>
                  </div>
                  <button
                    onClick={() => setIsOfferingModalOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f1e4da] hover:bg-[#bc6746]/15 text-[#7a5a48] transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body — no scroll, fits 90vh */}
                <form onSubmit={handleCreateOffering} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 px-7 py-5 space-y-4">

                    {/* Row 1: Name + Duration */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/60">Offering Name</label>
                        <input
                          type="text" required
                          placeholder="e.g. Lunar Hatha Flow"
                          value={offeringForm.title}
                          onChange={e => setOfferingForm({ ...offeringForm, title: e.target.value })}
                          className="w-full bg-white border border-[#e8d5c5] rounded-xl px-4 py-2.5 text-sm font-serif italic text-[#3a2b22] focus:border-[#bc6746] focus:ring-1 focus:ring-[#bc6746]/20 outline-none transition-all placeholder:text-[#bc6746]/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/60">Duration</label>
                        <input
                          type="text" required
                          placeholder="e.g. 60 Mins"
                          value={offeringForm.duration}
                          onChange={e => setOfferingForm({ ...offeringForm, duration: e.target.value })}
                          className="w-full bg-white border border-[#e8d5c5] rounded-xl px-4 py-2.5 text-sm font-serif italic text-[#3a2b22] focus:border-[#bc6746] focus:ring-1 focus:ring-[#bc6746]/20 outline-none transition-all placeholder:text-[#bc6746]/20"
                        />
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/60">Description</label>
                      <textarea
                        rows={2} required
                        placeholder="What essence does this practice carry?"
                        value={offeringForm.description}
                        onChange={e => setOfferingForm({ ...offeringForm, description: e.target.value })}
                        className="w-full bg-white border border-[#e8d5c5] rounded-xl px-4 py-2.5 text-sm italic text-[#3a2b22] focus:border-[#bc6746] focus:ring-1 focus:ring-[#bc6746]/20 outline-none transition-all placeholder:text-[#bc6746]/20 resize-none"
                      />
                    </div>

                    {/* Row 3: Image upload */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/60">Class Image</label>
                      <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#bc6746]/5 border border-[#bc6746]/12">
                        {offeringForm.image_url ? (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-1 ring-[#bc6746]/20 group shrink-0">
                            <img src={offeringForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                              <RefreshCw className="w-3.5 h-3.5 text-white" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleOfferingImageUpload} />
                            </label>
                          </div>
                        ) : (
                          <label className="flex w-16 h-16 flex-col items-center justify-center rounded-xl bg-white border border-dashed border-[#bc6746]/25 cursor-pointer hover:bg-[#bc6746]/5 transition-colors shrink-0">
                            <Plus className="w-4 h-4 text-[#bc6746]/40" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleOfferingImageUpload} />
                          </label>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#4a3b32]">Visual Resonance</p>
                          <p className="text-[9px] text-[#bc6746]/60 italic mt-0.5 leading-relaxed">Upload a curated image to represent this flow on our digital sanctuary.</p>
                          {actioningId === 'offering_image_upload' && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-[#bc6746]">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Uploading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Prices */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/60">Price / Month</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bc6746] font-serif text-lg">₹</span>
                          <input
                            type="number"
                            value={offeringForm.monthly_price}
                            onChange={e => setOfferingForm({ ...offeringForm, monthly_price: Number(e.target.value) })}
                            className="w-full bg-white border border-[#e8d5c5] rounded-xl pl-9 pr-4 py-2.5 text-xl font-serif font-black text-[#bc6746] focus:border-[#bc6746] focus:ring-1 focus:ring-[#bc6746]/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a55a3d]/60">Price / Class</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bc6746] font-serif text-lg">₹</span>
                          <input
                            type="number" required
                            value={offeringForm.single_price}
                            onChange={e => setOfferingForm({ ...offeringForm, single_price: Number(e.target.value) })}
                            className="w-full bg-white border border-[#e8d5c5] rounded-xl pl-9 pr-4 py-2.5 text-xl font-serif font-black text-[#bc6746] focus:border-[#bc6746] focus:ring-1 focus:ring-[#bc6746]/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Submit */}
                  <div className="px-7 py-5 border-t border-[#eddccc] shrink-0">
                    <button
                      type="submit"
                      disabled={isSubmittingOffering}
                      className="w-full py-3.5 rounded-2xl bg-[#bc6746] text-white text-[10px] font-black uppercase tracking-[0.45em] shadow-[0_12px_28px_rgba(188,103,70,0.28)] hover:bg-[#a85a3c] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmittingOffering && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{editingOffering ? (isSubmittingOffering ? 'Saving...' : 'Save Changes') : (isSubmittingOffering ? 'Creating...' : 'Create Class Type')}</span>
                    </button>
                  </div>
                </form>
              </div>
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
