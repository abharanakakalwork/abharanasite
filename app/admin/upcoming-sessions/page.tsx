'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { soundService, mediaService } from '@/lib/api/client';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle,
  Type,
  Image as ImageIcon,
  X,
  Loader2,
  CalendarDays,
  Clock,
  DollarSign,
  QrCode,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';
import { cn } from '@/lib/utils';

interface UpcomingSession {
  id: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  upi_id: string;
  payee_name: string;
  qr_image_url: string;
  instructions: string;
  created_at: string;
}

export default function UpcomingSessionsPage() {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    date: '',
    time: '',
    duration: '',
    price: 0,
    upi_id: '',
    payee_name: '',
    qr_image_url: '',
    instructions: '',
  });
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    isLoading: boolean;
  }>({ isOpen: false, id: '', isLoading: false });

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const res = await soundService.upcoming.list();
      setUpcomingSessions(res.data.data);
    } catch (err) {
      toast.error('Failed to load upcoming sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (session: any = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        title: session.title || '',
        description: session.description || '',
        image_url: session.image_url || '',
        date: session.date || '',
        time: session.time || '',
        duration: session.duration || '',
        price: session.price || 0,
        upi_id: session.upi_id || '',
        payee_name: session.payee_name || '',
        qr_image_url: session.qr_image_url || '',
        instructions: session.instructions || '',
      });
    } else {
      setEditingSession(null);
      setFormData({ 
        title: '', 
        description: '', 
        image_url: '',
        date: '',
        time: '',
        duration: '',
        price: 0,
        upi_id: '',
        payee_name: '',
        qr_image_url: '',
        instructions: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingImage(true);
    const toastId = toast.loading('Uploading session imagery...');
    
    try {
      const res = await mediaService.upload(file, 'images');
      if (res.data.success) {
        setFormData(prev => ({ ...prev, image_url: res.data.url }));
        toast.update(toastId, { render: 'Visual captured!', type: 'success', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: 'Failed to upload image', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingQR(true);
    const toastId = toast.loading('Uploading Payment QR...');
    
    try {
      const res = await mediaService.upload(file, 'payments');
      if (res.data.success) {
        setFormData(prev => ({ ...prev, qr_image_url: res.data.url }));
        toast.update(toastId, { render: 'Payment Portal Bonded!', type: 'success', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: 'Failed to upload QR code', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploadingQR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage || isUploadingQR) {
      toast.warning('Please wait for uploads to complete');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
        if (editingSession) {
          await soundService.upcoming.update(editingSession.id, formData);
          toast.success('Upcoming session updated');
        } else {
          await soundService.upcoming.create(formData);
          toast.success('Upcoming session created');
        }
      fetchUpcoming();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.details || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSession = async (id: string) => {
    setConfirmModal({ isOpen: true, id, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await soundService.upcoming.delete(id);
      fetchUpcoming();
      toast.info('Session removed');
    } catch (err) {
      toast.error('Deletion failed');
    } finally {
      setConfirmModal({ isOpen: false, id: '', isLoading: false });
    }
  };

  if (loading) return <div className="p-8 text-center text-[#a55a3d]/50 italic font-black uppercase tracking-widest">Synchronizing spiritual gatherings...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif text-[#4a3b32] uppercase italic tracking-tighter">Events</h1>
          <p className="mt-2 text-[#a55a3d]/70 italic">Manage upcoming events and session details.</p>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 rounded-2xl bg-[#bc6746] px-6 py-3 font-black text-white text-[10px] uppercase tracking-widest shadow-lg shadow-[#bc6746]/10 transition-all hover:bg-[#a55a3d] hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {upcomingSessions.map((session, i) => (
          <GlassCard key={session.id} noPadding delay={i * 0.05} className="group h-full flex flex-col overflow-hidden border-[#f1e4da]">
            <div className="relative h-64 w-full">
              <img 
                src={session.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                alt={session.title}
                className="h-full w-full object-cover grayscale-[20%] transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#4a3b32]/90 via-[#4a3b32]/40 to-transparent" />
              
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#f1e4da] shadow-sm flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#bc6746] uppercase tracking-widest leading-none">₹{typeof session.price === 'number' ? session.price.toFixed(2).replace(/\.00$/, '') : session.price}</span>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between text-[8px] font-black tracking-[0.3em] text-white uppercase mb-2">
                  <span className="opacity-80 italic font-serif">Synchronized Gathering</span>
                </div>
                <h3 className="text-2xl font-serif font-black text-white uppercase italic tracking-tighter leading-none mb-4 group-hover:text-[#f1e4da] transition-colors">
                  {session.title}
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/70 uppercase tracking-widest">
                        <CalendarDays className="w-3 h-3 text-[#bc6746]" /> {session.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/70 uppercase tracking-widest">
                        <Clock className="w-3 h-3 text-[#bc6746]" /> {session.time}
                    </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(session)} className="p-3 bg-white border border-[#f1e4da] rounded-2xl shadow-sm hover:scale-110 transition-all text-[#bc6746]">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => deleteSession(session.id)} className="p-3 bg-white border border-[#f1e4da] rounded-2xl shadow-sm hover:scale-110 transition-all text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-8 space-y-6">
              <p className="text-[13px] text-[#a55a3d]/80 line-clamp-3 leading-relaxed italic font-medium">
                "{session.description}"
              </p>
              
              <div className="pt-4 mt-auto border-t border-[#f1e4da]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[#bc6746] uppercase tracking-[0.2em] block">Total Duration</span>
                    <span className="text-[11px] font-serif font-bold text-[#4a3b32] uppercase italic">{session.duration} Journey</span>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#f1e4da] flex items-center justify-center text-[#bc6746] shadow-sm">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4a3b32]/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="w-full max-w-4xl"
            >
              <GlassCard className="border-[#bc6746]/20 p-12 shadow-[0_50px_100px_rgba(0,0,0,0.3)] rounded-[60px] overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-[#bc6746] to-transparent" />
                
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#f1e4da]/50">
                  <div>
                    <h2 className="text-4xl font-serif text-[#4a3b32] uppercase italic tracking-tighter leading-none">
                      {editingSession ? 'Edit Event' : 'Add Event'}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#bc6746]/40 mt-2">Spiritual Event Configuration</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 border border-[#f1e4da] rounded-2xl hover:bg-[#bc6746]/5 transition-all">
                    <X className="w-6 h-6 text-[#4a3b32]" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left: Content & Schedule */}
                    <div className="lg:col-span-7 space-y-8">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2">Session Title</label>
                           <input 
                               value={formData.title}
                               onChange={e => setFormData({...formData, title: e.target.value})}
                               className="w-full bg-[#fffdf8] border-b border-[#f1e4da] px-2 py-4 text-2xl font-serif italic text-[#4a3b32] focus:border-[#bc6746] outline-none transition-all placeholder:text-[#bc6746]/10"
                               placeholder="Celestial Alignment..."
                               required
                           />
                       </div>

                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2">Description</label>
                           <textarea 
                               value={formData.description}
                               onChange={e => setFormData({...formData, description: e.target.value})}
                               className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-[30px] p-6 text-sm font-medium italic text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none resize-none"
                               placeholder="Describe the resonant journey..."
                               rows={3}
                           />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                               <label className="text-[9px] font-black text-[#a55a3d]/50 uppercase tracking-widest ml-1">Event Date</label>
                               <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-4 py-4 font-serif font-black text-[#bc6746] outline-none focus:border-[#bc6746] transition-all"/>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[9px] font-black text-[#a55a3d]/50 uppercase tracking-widest ml-1">Invocation Time</label>
                               <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-4 py-4 font-serif font-black text-[#bc6746] outline-none focus:border-[#bc6746] transition-all"/>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[9px] font-black text-[#a55a3d]/50 uppercase tracking-widest ml-1">Total Length</label>
                               <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 90 Mins" className="w-full bg-[#fffdf8] border border-[#f1e4da] rounded-2xl px-4 py-4 font-serif font-black text-[#bc6746] outline-none focus:border-[#bc6746] transition-all italic"/>
                           </div>
                       </div>
                    </div>

                    {/* Right: Media & Payment */}
                    <div className="lg:col-span-5 space-y-8">
                       {/* Session Image */}
                       <div className="space-y-3">
                           <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
                               <ImageIcon className="w-3 h-3" /> Visual Identity
                           </label>
                           <div className="group relative h-48 w-full rounded-[40px] border-2 border-dashed border-[#f1e4da] bg-[#fffdf8] transition-all hover:border-[#bc6746]/30 overflow-hidden flex items-center justify-center">
                               {formData.image_url ? (
                                   <div className="relative h-full w-full">
                                       <img src={formData.image_url} className="h-full w-full object-cover" />
                                       <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer select-none">
                                           <RefreshCw className="w-6 h-6 mb-2" />
                                           <span className="text-[8px] font-black uppercase tracking-widest leading-none">Swap Visual</span>
                                           <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                       </label>
                                   </div>
                               ) : (
                                   <div className="flex flex-col items-center gap-2 text-[#bc6746]/20">
                                       {isUploadingImage ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-12 h-12" />}
                                       <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isUploadingImage ? 'Capturing...' : 'Invoke Visual'}</span>
                                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                                   </div>
                               )}
                           </div>
                       </div>

                       {/* Individual Payment Configuration */}
                       <div className="bg-[#bc6746]/5 rounded-[40px] p-8 border border-[#bc6746]/10 space-y-6">
                           <div className="flex items-center gap-3">
                               <QrCode className="w-5 h-5 text-[#bc6746]" />
                               <span className="text-[10px] font-black text-[#bc6746] uppercase tracking-[0.3em]">Payment Identity</span>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                   <label className="text-[8px] font-black uppercase text-[#bc6746]/50 ml-1">Investment</label>
                                   <div className="relative">
                                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bc6746]/40 text-xs font-bold">₹</span>
                                       <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-white border border-[#f1e4da] rounded-2xl px-8 py-3 text-sm font-serif font-black text-[#bc6746] outline-none"/>
                                   </div>
                               </div>
                               <div className="space-y-2">
                                   <label className="text-[8px] font-black uppercase text-[#bc6746]/50 ml-1">Registration QR</label>
                                   <div className="relative h-11 bg-white border border-[#f1e4da] rounded-2xl flex items-center justify-center overflow-hidden hover:border-[#bc6746]/30 transition-all">
                                      {formData.qr_image_url ? (
                                          <div className="flex items-center gap-2 px-3 w-full">
                                              <CheckCircle className="w-3 h-3 text-green-500" />
                                              <span className="text-[8px] font-black uppercase tracking-tight text-green-600 truncate">QR Bonded</span>
                                              <button type="button" onClick={() => setFormData({...formData, qr_image_url: ''})} className="ml-auto text-red-400 hover:text-red-600"><AlertCircle className="w-3 h-3"/></button>
                                          </div>
                                      ) : (
                                          <div className="flex items-center gap-2 p-3">
                                              {isUploadingQR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 text-[#bc6746]/40" />}
                                              <span className="text-[8px] font-black uppercase tracking-widest text-[#bc6746]/40">Bind QR</span>
                                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleQRUpload} disabled={isUploadingQR} />
                                          </div>
                                      )}
                                   </div>
                               </div>
                           </div>

                           <div className="space-y-4">
                               <input type="text" value={formData.upi_id} onChange={e => setFormData({...formData, upi_id: e.target.value})} placeholder="e.g. abharana@upi" className="w-full bg-white border border-[#f1e4da] rounded-2xl px-5 py-3 text-xs text-[#4a3b32] outline-none focus:ring-1 ring-[#bc6746] font-medium"/>
                               <input type="text" value={formData.payee_name} onChange={e => setFormData({...formData, payee_name: e.target.value})} placeholder="Beneficiary Name" className="w-full bg-white border border-[#f1e4da] rounded-2xl px-5 py-3 text-xs text-[#4a3b32] outline-none focus:ring-1 ring-[#bc6746] font-serif italic"/>
                           </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex pt-6 border-t border-[#f1e4da]/50">
                    <button 
                      type="submit" 
                      disabled={isSubmitting || isUploadingImage || isUploadingQR}
                      className="w-full py-7 bg-[#bc6746] text-white rounded-[32px] text-[12px] font-black uppercase tracking-[0.5em] transition-all shadow-2xl shadow-[#bc6746]/30 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-4">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                            Initializing Synchrony...
                        </div>
                      ) : (editingSession ? 'Verified Update' : 'Invoke Live Session')}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Dissolve Session"
        message="Are you sure you want to permanently dissolve this vibration from the upcoming gathers?"
        confirmText="Dissolve"
        variant="danger"
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: '', isLoading: false })}
      />
    </div>
  );
}
