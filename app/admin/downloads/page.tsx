'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { downloadService, mediaService } from '@/lib/api/client';
import { Download, Plus, Trash2, Loader2, File, HardDrive, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';

interface DownloadItem {
  id: string;
  heading: string;
  subheading: string;
  file_url: string;
  file_size_bytes: number;
  created_at: string;
}

export default function AdminDownloads() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    file_url: '',
    file_size_bytes: 0,
  });

  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, id: string, isLoading: boolean}>({
    isOpen: false,
    id: '',
    isLoading: false
  });

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const res = await downloadService.list();
      if (res.data.success) {
        setDownloads(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await mediaService.upload(file, 'downloads');
      if (res.data.success) {
        setFormData(prev => ({ 
          ...prev, 
          file_url: res.data.url,
          file_size_bytes: file.size
        }));
        toast.success('File stored in sacred archives');
      }
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file_url) {
      toast.error('Please upload a file to proceed.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await downloadService.create(formData);
      toast.success('New download manifested');
      fetchDownloads();
      setIsModalOpen(false);
      setFormData({ heading: '', subheading: '', file_url: '', file_size_bytes: 0 });
    } catch (err) {
      toast.error('Failed to save download');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await downloadService.delete(confirmModal.id);
      setDownloads(prev => prev.filter(d => d.id !== confirmModal.id));
      toast.info('Download dissolved');
    } catch (err) {
      toast.error('Deletion failed');
    } finally {
      setConfirmModal({ isOpen: false, id: '', isLoading: false });
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown Size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return (bytes / 1024).toFixed(1) + ' KB';
    return mb.toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-[#4a3b32]">Downloads</h1>
          <p className="mt-2 text-[#a55a3d]/70 italic">Manage wisdom files for the community.</p>
        </motion.div>

        <button 
          onClick={() => {
            setFormData({ heading: '', subheading: '', file_url: '', file_size_bytes: 0 });
            setIsModalOpen(true);
          }} 
          className="flex items-center space-x-2 rounded-full bg-[#bc6746] px-8 py-3 font-semibold text-white uppercase tracking-widest text-xs shadow-lg shadow-[#bc6746]/20 transition-all hover:bg-[#a55a3d] hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New File</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#bc6746] animate-spin" /></div>
      ) : downloads.length === 0 ? (
        <GlassCard className="text-center py-20">
          <Download className="w-12 h-12 mx-auto text-[#a55a3d]/30 mb-4" />
          <p className="text-[#4a3b32] font-serif text-xl mb-2">No files manifested yet</p>
          <p className="text-[#a55a3d]/70 italic text-sm">Upload a guide, audio file, or document to get started.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((dl, i) => (
            <motion.div
              key={dl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard noPadding className="h-full flex flex-col group relative overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#bc6746] to-transparent w-full" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#bc6746]/10 p-3 rounded-2xl">
                      <File className="w-6 h-6 text-[#bc6746]" />
                    </div>
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, id: dl.id, isLoading: false })}
                      className="p-2 text-[#a55a3d]/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#4a3b32] mb-1 line-clamp-2">{dl.heading}</h3>
                  <p className="text-sm text-[#a55a3d]/70 italic mb-6 line-clamp-2 flex-1">{dl.subheading}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#f1e4da]/60">
                    <div className="flex items-center text-xs font-bold text-[#a55a3d]/50 tracking-widest uppercase">
                      <HardDrive className="w-3 h-3 mr-2" />
                      {formatSize(dl.file_size_bytes)}
                    </div>
                    <a href={dl.file_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#bc6746] tracking-widest uppercase hover:underline">
                      View
                    </a>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-xl rounded-3xl overflow-hidden bg-[#fffdf8] border border-[#f1e4da] shadow-2xl flex flex-col paper-grain"
            >
              <div className="h-1.5 bg-gradient-to-r from-[#bc6746] via-[#a55a3d] to-[#bc6746] w-full" />
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div>
                    <h2 className="text-2xl font-serif font-bold text-[#4a3b32] uppercase tracking-widest mb-1">
                       New Spiritual Offering
                    </h2>
                    <p className="text-sm text-[#a55a3d]/70 italic">Upload a file for the community to download.</p>
                 </div>

                 <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">Title (Heading)</label>
                       <input 
                          value={formData.heading}
                          onChange={e => setFormData({...formData, heading: e.target.value})}
                          className="w-full rounded-2xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm"
                          placeholder="E.g., Root Chakra Meditation Guide"
                          required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">Description (Subheading)</label>
                       <textarea 
                          value={formData.subheading}
                          onChange={e => setFormData({...formData, subheading: e.target.value})}
                          rows={3}
                          className="w-full rounded-2xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm resize-none"
                          placeholder="A brief description of what this download contains..."
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">File Upload</label>
                       <div className="relative border-2 border-dashed border-[#bc6746]/30 bg-[#bc6746]/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-[#bc6746]/10 transition-colors group cursor-pointer overflow-hidden">
                          {isUploading ? (
                            <div className="flex flex-col items-center z-10 relative">
                              <Loader2 className="w-8 h-8 text-[#bc6746] animate-spin mb-3" />
                              <span className="text-xs font-bold text-[#bc6746] uppercase tracking-widest">Uploading...</span>
                            </div>
                          ) : formData.file_url ? (
                            <div className="flex flex-col items-center z-10 relative">
                              <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">File Ready</span>
                              <span className="text-[10px] text-[#a55a3d]/60 mt-1">{formatSize(formData.file_size_bytes)}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center z-10 relative">
                              <Download className="w-8 h-8 text-[#bc6746]/60 group-hover:text-[#bc6746] mb-3 transition-colors" />
                              <span className="text-xs font-bold text-[#a55a3d]/80 uppercase tracking-widest">Select File</span>
                            </div>
                          )}
                          <input 
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                            disabled={isUploading}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-6 space-x-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-full text-[#a55a3d]/60 hover:text-[#4a3b32] transition-colors font-bold uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || isUploading || !formData.file_url}
                    className="px-10 py-3 rounded-full bg-[#bc6746] text-white font-bold shadow-lg shadow-[#bc6746]/20 transition-all hover:bg-[#a55a3d] hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center uppercase tracking-widest text-[10px]"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Manifest File
                  </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Dissolve Download"
        message="Are you sure you want to permanently dissolve this resource from the server?"
        confirmText="Dissolve"
        variant="danger"
        isLoading={confirmModal.isLoading}
        onConfirm={handleDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: '', isLoading: false })}
      />
    </div>
  );
}
