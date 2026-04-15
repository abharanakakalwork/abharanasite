'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { soundService, mediaService } from '@/lib/api/client';
import { 
  Music, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle,
  Type,
  FileAudio,
  Image as ImageIcon,
  X,
  Loader2,
  CloudLightning
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { AdminAudioPlayer } from '@/components/admin/AdminAudioPlayer';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';

interface SoundSession {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  metadata?: any;
  intent?: string;
  frequency?: string;
  duration?: string;
  category?: string;
  color?: string;
  created_at: string;
}

export default function SoundHealingPage() {
  const [sessions, setSessions] = useState<SoundSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    audio_url: '',
    image_url: '',
    metadata: '',
    intent: '',
    frequency: '',
    duration: '',
    category: '',
    color: '#bc6746',
  });
  
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    isLoading: boolean;
  }>({ isOpen: false, id: '', isLoading: false });

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await soundService.list();
      setSessions(res.data.data);
    } catch (err) {
      toast.error('Failed to load sessions');
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
        audio_url: session.audio_url || '',
        image_url: session.image_url || '',
        metadata: session.metadata ? JSON.stringify(session.metadata, null, 2) : '',
        intent: session.intent || '',
        frequency: session.frequency || '',
        duration: session.duration || '',
        category: session.category || '',
        color: session.color || '#bc6746',
      });
    } else {
      setEditingSession(null);
      setFormData({ 
        title: '', 
        description: '', 
        audio_url: '', 
        image_url: '',
        metadata: '',
        intent: '',
        frequency: '',
        duration: '',
        category: '',
        color: '#bc6746',
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingImage(true);
    const toastId = toast.loading('Uploading spiritual vision...');
    
    try {
      const res = await mediaService.upload(file, 'images');
      if (res.data.success) {
        setFormData(prev => ({ ...prev, image_url: res.data.url }));
        toast.update(toastId, { render: 'Vision captured in storage!', type: 'success', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: 'Failed to upload image', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingAudio(true);
    const toastId = toast.loading('Uploading frequency masterpiece...');
    
    try {
      const res = await mediaService.upload(file, 'audio');
      if (res.data.success) {
        setFormData(prev => ({ ...prev, audio_url: res.data.url }));
        toast.update(toastId, { render: 'Frequency resonated with storage!', type: 'success', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: 'Failed to upload audio', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingAudio || isUploadingImage) {
      toast.warning('Please wait for uploads to complete');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
        const payload = {
          title: formData.title,
          description: formData.description,
          audio_url: formData.audio_url,
          image_url: formData.image_url,
          metadata: formData.metadata ? JSON.parse(formData.metadata) : null,
          intent: formData.intent,
          frequency: formData.frequency,
          duration: formData.duration,
          category: formData.category,
          color: formData.color,
        };

        if (editingSession) {
          await soundService.update(editingSession.id, payload);
          toast.success('Library session updated');
        } else {
          await soundService.create(payload);
          toast.success('Library session created');
        }
      fetchLibrary();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Operation failed. Check JSON or connection.');
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
      await soundService.delete(id);
      fetchLibrary();
      toast.info('Session removed');
    } catch (err) {
      toast.error('Deletion failed');
    } finally {
      setConfirmModal({ isOpen: false, id: '', isLoading: false });
    }
  };

  if (loading) return <div className="p-8 text-center text-[#a55a3d]/50 italic font-black uppercase tracking-widest">Tuning library frequencies...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif text-[#4a3b32] uppercase italic tracking-tighter">Meditation Audio</h1>
          <p className="mt-2 text-[#a55a3d]/70 italic">Add and manage meditation audio tracks.</p>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 rounded-2xl bg-[#bc6746] px-6 py-3 font-black text-white text-[10px] uppercase tracking-widest shadow-lg shadow-[#bc6746]/10 transition-all hover:bg-[#a55a3d] hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>Add Audio</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session, i) => (
          <GlassCard key={session.id} noPadding delay={i * 0.05} className="group h-full flex flex-col border-[#f1e4da]">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={session.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                alt={session.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-end">
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(session)} className="rounded-lg bg-white/20 p-2 text-white transition-colors hover:bg-[#bc6746]">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteSession(session.id)} className="rounded-lg bg-white/20 p-2 text-white transition-colors hover:bg-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-serif font-black text-[#4a3b32] uppercase italic tracking-tighter leading-none">{session.title}</h3>
                <div className="h-8 w-8 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                  <Music className="h-4 w-4" />
                </div>
              </div>
              <p className="flex-1 text-xs text-[#a55a3d]/70 line-clamp-3 leading-relaxed italic font-medium">"{session.description}"</p>
              
              {session.audio_url && (
                <div className="w-full">
                  <AdminAudioPlayer src={session.audio_url} />
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-2xl overflow-hidden rounded-[40px] bg-white border border-[#f1e4da] shadow-2xl"
            >
              <div className="h-2 bg-[#bc6746] w-full" />
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#f1e4da]">
                  <h2 className="text-2xl font-serif text-[#4a3b32] uppercase italic tracking-tighter">
                    {editingSession ? 'Edit Audio' : 'Add Audio'}
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#a55a3d]/50 hover:text-[#bc6746] transition-colors p-2">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Col */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2 flex items-center">
                        <Type className="h-3 w-3 mr-2" /> Title
                      </label>
                      <input 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full rounded-2xl border border-[#f1e4da] bg-[#fffdf8] p-3 text-sm text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif italic"
                        placeholder="Celestial Resonance..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2">
                        Description
                      </label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full h-32 rounded-2xl border border-[#f1e4da] bg-[#fffdf8] p-3 text-sm text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none resize-none font-medium italic"
                        placeholder="Describe the sonic journey..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#bc6746] uppercase tracking-widest">Intent</label>
                        <input 
                          value={formData.intent}
                          onChange={e => setFormData({...formData, intent: e.target.value})}
                          className="w-full rounded-xl border border-[#f1e4da] bg-[#fffdf8] p-3 text-xs text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif italic"
                          placeholder="Deep Rest"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#bc6746] uppercase tracking-widest">Frequency</label>
                        <input 
                          value={formData.frequency}
                          onChange={e => setFormData({...formData, frequency: e.target.value})}
                          className="w-full rounded-xl border border-[#f1e4da] bg-[#fffdf8] p-3 text-xs text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif italic"
                          placeholder="528Hz"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#bc6746] uppercase tracking-widest">Duration</label>
                        <input 
                          value={formData.duration}
                          onChange={e => setFormData({...formData, duration: e.target.value})}
                          className="w-full rounded-xl border border-[#f1e4da] bg-[#fffdf8] p-3 text-xs text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif italic"
                          placeholder="20:00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#bc6746] uppercase tracking-widest">Category</label>
                        <input 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full rounded-xl border border-[#f1e4da] bg-[#fffdf8] p-3 text-xs text-[#4a3b32] focus:ring-1 ring-[#bc6746] outline-none font-serif italic"
                          placeholder="Deep Meditation"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#bc6746] uppercase tracking-widest">UI Color</label>
                        <input 
                          type="color"
                          value={formData.color}
                          onChange={e => setFormData({...formData, color: e.target.value})}
                          className="w-full h-10 rounded-xl border border-[#f1e4da] bg-[#fffdf8] p-1 outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Col - Media */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2 flex items-center">
                        <ImageIcon className="h-3 w-3 mr-2" /> Thumbnail Image
                      </label>
                      <div className="group relative h-40 w-full rounded-[30px] border-2 border-dashed border-[#f1e4da] bg-[#fffdf8] transition-all hover:border-[#bc6746]/30 overflow-hidden">
                        {formData.image_url ? (
                          <div className="relative h-full w-full">
                            <img 
                              src={formData.image_url} 
                              className="h-full w-full object-cover" 
                            />
                            {isUploadingImage && (
                              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                                <Loader2 className="h-8 w-8 text-[#bc6746] animate-spin mb-2" />
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer select-none">
                                <X className="w-5 h-5 mb-1" />
                                <span className="text-[7px] font-black uppercase tracking-widest">Swap Visual</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center text-[#a55a3d]/30">
                            {isUploadingImage ? (
                               <Loader2 className="h-8 w-8 mb-2 animate-spin text-[#bc6746]" />
                            ) : (
                              <>
                                <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Invoke Visual</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={isUploadingImage}
                              className="absolute inset-0 cursor-pointer opacity-0"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2 flex items-center">
                        <FileAudio className="h-3 w-3 mr-2" /> Mastered Audio
                      </label>
                      <div className="relative rounded-2xl border border-[#f1e4da] bg-[#fffdf8] p-4 transition-all hover:border-[#bc6746]/30">
                        <div className="flex items-center space-x-3">
                          {isUploadingAudio ? (
                            <Loader2 className="h-8 w-8 text-[#bc6746] animate-spin" />
                          ) : (
                            <Music className={`h-8 w-8 ${formData.audio_url ? 'text-[#bc6746]' : 'text-[#a55a3d]/30'}`} />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[9px] text-[#a55a3d]/70 truncate font-medium italic">
                              {isUploadingAudio ? 'Bonding with storage...' : (formData.audio_url ? 'Frequency Resonating' : 'Click to bind masterpiece')}
                            </p>
                            {formData.audio_url && !isUploadingAudio && (
                              <div className="mt-1 flex items-center text-[7px] text-green-600 font-black uppercase tracking-widest">
                                <CheckCircle className="h-2 w-2 mr-1" /> Bound to Archive
                              </div>
                            )}
                          </div>
                        </div>
                        <input 
                          type="file" 
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          disabled={isUploadingAudio}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#a55a3d]/50 uppercase tracking-[0.4em] ml-2 flex items-center">
                        Metadata Archive
                      </label>
                      <textarea 
                        value={formData.metadata}
                        onChange={e => setFormData({...formData, metadata: e.target.value})}
                        className="w-full h-24 rounded-2xl border border-[#f1e4da] bg-[#fffdf8] p-3 text-[9px] font-mono text-[#a55a3d]/70 focus:ring-1 ring-[#bc6746] outline-none resize-none"
                        placeholder='{ "focus": "cellular-level" }'
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 space-x-4 border-t border-[#f1e4da]">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 py-4 rounded-2xl border border-[#f1e4da] text-[#4a3b32] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#fffdf8]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || isUploadingAudio || isUploadingImage}
                    className="flex items-center px-12 py-4 rounded-2xl bg-[#bc6746] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#bc6746]/10 transition-all hover:bg-[#a55a3d] hover:scale-[1.03] active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (isUploadingAudio || isUploadingImage) ? (
                      <CloudLightning className="h-4 w-4 animate-pulse mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Saving...' : (isUploadingAudio || isUploadingImage) ? 'Uploading Media...' : (editingSession ? 'Save Changes' : 'Add Audio')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Dissolve Resonance"
        message="Are you sure you want to permanently dissolve this vibration from the sonic archives?"
        confirmText="Dissolve"
        variant="danger"
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: '', isLoading: false })}
      />
    </div>
  );
}
