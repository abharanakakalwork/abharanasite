'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { retreatService, mediaService } from '@/lib/api/client';
import { 
  Palmtree, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle,
  Calendar,
  DollarSign,
  Type,
  ImageIcon,
  X,
  Loader2,
  Layers,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';

interface Retreat {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  gallery?: string[];
  date: string;
  created_at: string;
}

export default function RetreatsPage() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRetreat, setEditingRetreat] = useState<Retreat | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    date: '',
    image_urls: [] as string[],
    gallery: [] as string[],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    isLoading: boolean;
  }>({ isOpen: false, id: '', isLoading: false });

  useEffect(() => {
    fetchRetreats();
  }, []);

  const fetchRetreats = async () => {
    try {
      const response = await retreatService.list();
      setRetreats(response.data.data);
    } catch (err) {
      toast.error('Failed to load retreats');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (retreat: Retreat | null = null) => {
    if (retreat) {
      setEditingRetreat(retreat);
      setFormData({
        title: retreat.title,
        description: retreat.description,
        price: retreat.price.toString(),
        date: retreat.date ? new Date(retreat.date).toISOString().split('T')[0] : '',
        image_urls: retreat.image_urls || [],
        gallery: retreat.gallery || [],
      });
    } else {
      setEditingRetreat(null);
      setFormData({ title: '', description: '', price: '', date: '', image_urls: [], gallery: [] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      toast.warn('Please wait for uploads to complete');
      return;
    }
    setIsSubmitting(true);
    
    // Send clean JSON payload
    const payload = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      date: formData.date,
      existing_images: formData.image_urls,
      gallery: formData.gallery
    };

    try {
      if (editingRetreat) {
        await retreatService.update(editingRetreat.id, payload);
        toast.success('Retreat sanctuary updated');
      } else {
        await retreatService.create(payload);
        toast.success('New sanctuary Manifested');
      }
      fetchRetreats();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Manifestation failed in the void');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRetreat = async (id: string) => {
    setConfirmModal({ isOpen: true, id, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await retreatService.delete(id);
      setRetreats(prev => prev.filter(r => r.id !== id));
      toast.info('Sanctuary dissolved');
    } catch (err) {
      toast.error('Deletion failed');
    } finally {
      setConfirmModal({ isOpen: false, id: '', isLoading: false });
    }
  };

  const removeImage = async (url: string) => {
    try {
      // Optimistic update
      setFormData(prev => ({ 
        ...prev, 
        image_urls: prev.image_urls.filter(u => u !== url),
        gallery: prev.gallery.filter(u => u !== url)
      }));
      
      // Immediate purge from Bunny
      await mediaService.purge(url);
    } catch (err) {
      console.error('Failed to purge image:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(file => mediaService.upload(file, 'retreats'));

    try {
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(res => res.data.url);
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, ...newUrls]
      }));
      toast.success(`${newUrls.length} images manifested`);
    } catch (err) {
      toast.error('Failed to upload some images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(file => mediaService.upload(file, 'retreats'));

    try {
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(res => res.data.url);
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newUrls]
      }));
      toast.success(`${newUrls.length} gallery photos added`);
    } catch (err) {
      toast.error('Failed to upload some gallery photos');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#a55a3d]/70 font-light italic">Opening portal to retreats...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight text-[#4a3b32]">Retreat Sanctuaries</h1>
          <p className="mt-2 text-[#a55a3d]/70">Manage the portals to deep restoration.</p>
        </motion.div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 rounded-2xl bg-[#bc6746] px-6 py-3 font-bold text-white shadow-lg shadow-[#bc6746]/10 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span>New Retreat</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {retreats.map((retreat, i) => (
            <GlassCard key={retreat.id} noPadding delay={i * 0.05} className="group h-full flex flex-col">
              {/* Gallery Preview */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                {retreat.image_urls?.[0] ? (
                  <img 
                    src={retreat.image_urls[0]} 
                    alt={retreat.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-700">
                    <Palmtree className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="rounded-lg bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10 uppercase tracking-widest">
                    ${retreat.price}
                  </span>
                  <span className="rounded-lg bg-indigo-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10 flex items-center">
                    <Calendar className="h-3 h-3 mr-1" />
                    {retreat.date ? new Date(retreat.date).toLocaleDateString() : 'TBA'}
                  </span>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button onClick={() => handleOpenModal(retreat)} className="rounded-lg bg-white/10 p-2 text-white transition-all hover:bg-purple-500/50 hover:scale-110">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteRetreat(retreat.id)} className="rounded-lg bg-white/10 p-2 text-white transition-all hover:bg-red-500/50 hover:scale-110">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-[#4a3b32] uppercase tracking-wider line-clamp-1">{retreat.title}</h3>
                  <div className="h-8 w-8 rounded-full bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
                <p className="flex-1 text-xs text-[#a55a3d]/70 line-clamp-4 leading-relaxed italic">{retreat.description}</p>
                
                {/* Image Count indicators */}
                <div className="flex items-center space-x-1 pt-2 border-t border-[#f1e4da]">
                   <Layers className="h-3 w-3 text-[#a55a3d]/50 mr-1" />
                   <span className="text-[10px] text-[#a55a3d]/50 font-bold uppercase tracking-widest">{retreat.image_urls?.length || 0} Layers of imagery</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#fffdf8] border border-[#f1e4da] shadow-2xl flex flex-col"
            >
              <div className="h-2 bg-[#bc6746] w-full" />
              
              <div 
                className="flex-1 overflow-y-auto p-8 custom-scrollbar"
                data-lenis-prevent
                style={{ touchAction: 'pan-y' }}
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#4a3b32] uppercase tracking-widest">
                      {editingRetreat ? 'Update Sanctuary' : 'Manifest New Retreat'}
                    </h2>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#a55a3d]/50 hover:text-[#bc6746] transition-colors">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#a55a3d]/50 uppercase tracking-widest flex items-center">
                          <Type className="h-3 w-3 mr-2" /> Sanctuary Title
                        </label>
                        <input 
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="w-full rounded-xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none transition-all shadow-sm"
                          placeholder="Sacred Silence Retreat..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#a55a3d]/50 uppercase tracking-widest flex items-center">
                            <DollarSign className="h-3 w-3 mr-2" /> Energy Exchange
                          </label>
                          <input 
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="w-full rounded-xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm"
                            placeholder="1200"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#a55a3d]/50 uppercase tracking-widest flex items-center">
                            <Calendar className="h-3 w-3 mr-2" /> Oracle Date
                          </label>
                          <input 
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full rounded-xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#a55a3d]/50 uppercase tracking-widest flex items-center">
                          Sanctuary Description
                        </label>
                        <textarea 
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full h-48 rounded-xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none resize-none leading-relaxed shadow-sm"
                          placeholder="What journey awaits seekers in this portal?"
                        />
                      </div>
                    </div>

                    {/* Image Management */}
                    <div className="space-y-8">
                      {/* Hero Image */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-[#a55a3d]/50 uppercase tracking-widest flex items-center">
                          <ImageIcon className="h-3 w-3 mr-2" /> Main Hero Snapshot
                        </label>
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-[#f1e4da] bg-[#fffdf8] hover:border-[#bc6746] transition-all group">
                          {formData.image_urls?.[0] ? (
                            <>
                              <img src={formData.image_urls[0]} className="h-full w-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeImage(formData.image_urls[0])}
                                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a55a3d]/30">
                              <Plus className="h-8 w-8 mb-2" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Invoke Hero Image</span>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gallery Photos */}
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-[#a55a3d]/50 uppercase tracking-widest flex items-center">
                          <Layers className="h-3 w-3 mr-2" /> Sanctuary Gallery (Visual Layers)
                        </label>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {formData.gallery.map((url, idx) => (
                            <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-[#f1e4da] bg-[#fffdf8]">
                              <img src={url} className="h-full w-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeImage(url)}
                                className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          
                          <div className="relative aspect-square rounded-xl border-2 border-dashed border-[#f1e4da] bg-[#fffdf8] flex flex-col items-center justify-center text-[#a55a3d]/30 hover:border-[#bc6746] transition-all cursor-pointer">
                             <Plus className="h-6 w-6 mb-1" />
                             <span className="text-[8px] font-bold uppercase">Add Photo</span>
                             <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              disabled={isUploading}
                              onChange={handleGalleryUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                             />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#bc6746]/5 border border-[#bc6746]/10 p-6 space-y-3">
                         <div className="flex items-center text-[#bc6746]">
                           <Layers className="w-4 h-4 mr-2" />
                           <span className="text-xs font-bold">Optimization Tip</span>
                         </div>
                         <p className="text-[10px] text-[#a55a3d]/70 leading-relaxed italic">
                           Each image is seamlessly manifested via the high-fidelity cloud storage. Recommend using landscape-oriented shots to maintain the sanctuary's aesthetic balance.
                         </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 space-x-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 rounded-xl border border-[#f1e4da] text-[#a55a3d]/70 font-bold transition-all hover:bg-[#bc6746]/5"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex items-center px-12 py-3 rounded-xl bg-[#bc6746] text-white font-bold shadow-xl shadow-[#bc6746]/20 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                      {editingRetreat ? 'Harmonize Sanctuary' : 'Manifest Sanctuary'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Dissolve Sanctuary"
        message="Are you sure you want to permanently dissolve this retreat sanctuary? This action is irreversible."
        confirmText="Dissolve"
        variant="danger"
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: '', isLoading: false })}
      />
    </div>
  );
}
