'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { pagesService } from '@/lib/api/client';
import { Loader2, Save, FileText, CheckCircle, ShieldCheck, Scale, Coins, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/admin/Editor'), { ssr: false });

const PAGE_OPTIONS = [
  { 
    slug: 'privacy-policy', 
    label: 'Privacy Policy', 
    description: 'Data usage & visitor safety',
    icon: ShieldCheck,
    color: '#bc6746'
  },
  { 
    slug: 'terms-conditions', 
    label: 'Terms & Conditions', 
    description: 'Legal bounds & agreements',
    icon: Scale,
    color: '#a55a3d'
  },
  { 
    slug: 'refund-policy', 
    label: 'Refund Policy', 
    description: 'Cancellation & returns',
    icon: Coins,
    color: '#8b4513'
  },
];

export default function AdminPages() {
  const [activeSlug, setActiveSlug] = useState('privacy-policy');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageData, setPageData] = useState<{ title: string; content: string; updated_at?: string }>({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchPage(activeSlug);
  }, [activeSlug]);

  const fetchPage = async (slug: string) => {
    setIsLoading(true);
    try {
      const res = await pagesService.get(slug);
      if (res.data.success) {
        setPageData({
          title: res.data.data.title,
          content: res.data.data.content || '',
          updated_at: res.data.data.updated_at
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        const option = PAGE_OPTIONS.find(p => p.slug === slug);
        setPageData({ 
          title: option?.label || '', 
          content: '',
          updated_at: undefined
        });
      } else {
        toast.error('Failed to load page content');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await pagesService.update(activeSlug, pageData);
      if (res.data.success) {
        setPageData(prev => ({ ...prev, updated_at: res.data.data.updated_at }));
        toast.success('Truth preserved (Saved successfully)');
      }
    } catch (err) {
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const isJsonString = (str: any) => {
    if (typeof str !== 'string') return typeof str === 'object';
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-serif font-bold tracking-tight text-[#4a3b32]">Site Pages</h1>
          <p className="mt-3 text-[#a55a3d]/70 italic text-lg">Curate the foundational truths and legal tapestries of your digital sanctuary.</p>
        </motion.div>
        
        {pageData.updated_at && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-[#bc6746]/10"
          >
            <Clock className="w-4 h-4 text-[#bc6746]" />
            <span className="text-[10px] font-bold text-[#a55a3d] uppercase tracking-widest">
              Last Synergy: {formatDate(pageData.updated_at)}
            </span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] border border-white/50 p-6 shadow-2xl shadow-[#bc6746]/5">
            <h3 className="text-[10px] font-bold text-[#a55a3d]/40 uppercase tracking-[0.2em] mb-6 px-2">Document Sanctum</h3>
            <div className="space-y-3">
              {PAGE_OPTIONS.map((page) => {
                const Icon = page.icon;
                const isActive = activeSlug === page.slug;
                
                return (
                  <button
                    key={page.slug}
                    onClick={() => setActiveSlug(page.slug)}
                    className={`w-full group relative flex items-center gap-4 p-5 rounded-3xl transition-all duration-500 text-left ${
                      isActive
                        ? 'bg-white shadow-xl shadow-[#bc6746]/10 scale-[1.02]'
                        : 'hover:bg-white/60 hover:translate-x-1'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#bc6746] rounded-r-full"
                      />
                    )}
                    
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${
                      isActive 
                        ? 'bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/30' 
                        : 'bg-white text-[#4a3b32]/40 group-hover:text-[#bc6746]'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-serif font-bold text-lg leading-tight transition-colors ${
                        isActive ? 'text-[#4a3b32]' : 'text-[#4a3b32]/60'
                      }`}>
                        {page.label}
                      </p>
                      <p className="text-xs text-[#a55a3d]/50 mt-1 truncate">{page.description}</p>
                    </div>
                    
                    <ChevronRight className={`w-5 h-5 transition-all duration-500 ${
                      isActive ? 'text-[#bc6746] translate-x-0' : 'text-[#4a3b32]/20 -translate-x-2'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#bc6746] to-[#a55a3d] text-white shadow-xl shadow-[#bc6746]/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <h4 className="font-serif text-xl font-bold mb-2">Sacred Guidelines</h4>
            <p className="text-sm text-white/80 leading-relaxed italic">"Clear terms foster peaceful spirits. Ensure these documents reflect the current flow of Abharana."</p>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
            >
              <GlassCard className="min-h-[700px] flex flex-col relative overflow-hidden border-white/40 shadow-2xl">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md z-20 rounded-3xl">
                    <Loader2 className="w-12 h-12 text-[#bc6746] animate-spin mb-4" />
                    <p className="text-xs uppercase tracking-[0.3em] text-[#a55a3d] font-bold">Unfolding truth...</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="flex-1 flex flex-col space-y-8 p-4 md:p-8">
                  <div className="pb-8 border-b border-[#f1e4da] flex items-center justify-between">
                    <div className="hidden md:flex items-center gap-2 text-[#a55a3d]/50 italic text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Updates are reflected across all client portals instantly.</span>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSaving || isLoading}
                      className="group relative w-full md:w-auto overflow-hidden px-12 py-5 rounded-2xl bg-gradient-to-r from-[#bc6746] to-[#a55a3d] text-white font-bold shadow-xl shadow-[#bc6746]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center uppercase tracking-widest text-xs"
                    >
                      <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <div className="relative z-10 flex items-center">
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />}
                        {isSaving ? 'Preserving...' : 'Commit Changes'}
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-[0.2em] ml-2">Document Title</label>
                    <input 
                      value={pageData.title}
                      onChange={e => setPageData({...pageData, title: e.target.value})}
                      placeholder="Give this truth a name..."
                      className="w-full rounded-2xl border-2 border-[#f1e4da] bg-white/50 p-6 text-3xl font-serif font-bold text-[#4a3b32] focus:border-[#bc6746] focus:bg-white outline-none shadow-inner transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-[0.2em] ml-2">Wisdom Content</label>
                    <div className="flex-1 rounded-3xl border-2 border-[#f1e4da] bg-white flex flex-col shadow-inner focus-within:border-[#bc6746] transition-all duration-300 overflow-hidden">
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {!isLoading && (
                          <Editor 
                            data={isJsonString(pageData.content) ? (typeof pageData.content === 'string' ? JSON.parse(pageData.content) : pageData.content) : undefined}
                            onChange={(data) => setPageData({ ...pageData, content: data as any })}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
