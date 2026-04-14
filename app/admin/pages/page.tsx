'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { pagesService } from '@/lib/api/client';
import { Loader2, Save, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/admin/Editor'), { ssr: false });

const PAGE_OPTIONS = [
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-conditions', label: 'Terms & Conditions' },
  { slug: 'refund-policy', label: 'Refund Policy' },
];

export default function AdminPages() {
  const [activeSlug, setActiveSlug] = useState('privacy-policy');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageData, setPageData] = useState<{ title: string; content: string }>({
    title: '',
    content: ''
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
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Not found, reset to default state
        const defaultTitle = PAGE_OPTIONS.find(p => p.slug === slug)?.label || '';
        setPageData({ title: defaultTitle, content: '' });
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
      await pagesService.update(activeSlug, pageData);
      toast.success('Page harmony restored (Saved)');
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

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-[#4a3b32]">Static Pages</h1>
          <p className="mt-2 text-[#a55a3d]/70 italic">Manage policies and foundational truths.</p>
        </motion.div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-64 flex-shrink-0 space-y-2">
          {PAGE_OPTIONS.map((page) => (
            <button
              key={page.slug}
              onClick={() => setActiveSlug(page.slug)}
              className={`w-full text-left flex items-center space-x-3 px-4 py-4 rounded-2xl transition-all duration-300 font-bold tracking-wider text-xs uppercase ${
                activeSlug === page.slug
                  ? 'bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20'
                  : 'bg-white/50 text-[#4a3b32]/60 hover:bg-[#bc6746]/10 hover:text-[#bc6746]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{page.label}</span>
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1">
          <GlassCard className="h-full min-h-[600px] flex flex-col relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-3xl">
                <Loader2 className="w-8 h-8 text-[#bc6746] animate-spin mb-4" />
                <p className="text-xs uppercase tracking-widest text-[#a55a3d] font-bold">Unfolding truth...</p>
              </div>
            ) : null}

            <form onSubmit={handleSave} className="flex-1 flex flex-col space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">Page Title</label>
                <input 
                  value={pageData.title}
                  onChange={e => setPageData({...pageData, title: e.target.value})}
                  className="w-full rounded-2xl border border-[#f1e4da] bg-white p-4 text-2xl font-serif font-bold text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">Content</label>
                <div className="flex-1 rounded-2xl border border-[#f1e4da] bg-white pt-4 px-2 custom-scrollbar focus-within:border-[#bc6746] transition-colors relative min-h-[400px]">
                  {!isLoading && (
                    <Editor 
                      data={isJsonString(pageData.content) ? (typeof pageData.content === 'string' ? JSON.parse(pageData.content) : pageData.content) : undefined}
                      onChange={(data) => setPageData({ ...pageData, content: data as any })}
                    />
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-[#f1e4da]/50 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving || isLoading}
                  className="px-10 py-4 rounded-full bg-[#bc6746] text-white font-bold shadow-xl shadow-[#bc6746]/20 transition-all hover:bg-[#a55a3d] hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center uppercase tracking-widest text-xs"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <Save className="h-4 w-4 mr-3" />}
                  Save Page
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
