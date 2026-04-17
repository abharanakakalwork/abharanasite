"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/admin/GlassCard';
import { courseService, mediaService } from '@/lib/api/client';
import { 
  ChevronRight, 
  Plus, 
  Trash2, 
  Loader2, 
  Save, 
  Settings, 
  BookOpen, 
  Video, 
  ArrowLeft,
  GripVertical,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import CurriculumBuilder from './components/CurriculumBuilder';
import Editor from '@/components/admin/Editor';
import { StatusToggle } from '@/components/admin/StatusToggle';

// --- Sub-components (Simplified for now, will expand later) --- //

export default function CourseBuilder() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');

  useEffect(() => {
    if (id && id !== 'new') {
      fetchCourse();
    } else {
      setCourse({
        title: '',
        description: '',
        price: 0,
        category: 'Yoga',
        is_published: false,
        thumbnail_url: '',
        course_sections: []
      });
      setLoading(false);
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await courseService.get(id as string);
      setCourse(res.data.data);
    } catch (err) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id === 'new') {
        const res = await courseService.create(course);
        toast.success('Course born in the sanctuary');
        router.push(`/admin/courses/${res.data.data.id}`);
      } else {
        await courseService.update(id as string, course);
        toast.success('Wisdom synchronized');
      }
    } catch (err) {
      toast.error('Failed to save course info');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!course?.id || id === 'new') return;
    try {
      const newStatus = !course.is_published;
      await courseService.update(id as string, { is_published: newStatus });
      setCourse({ ...course, is_published: newStatus });
      toast.success(`Course ${newStatus ? 'is now Live' : 'returned to Draft'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-[#bc6746]">
        <Loader2 className="animate-spin h-8 w-8 mb-4" /> 
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Synchronizing curriculum...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-[#f1e4da] text-[#bc6746] hover:bg-[#bc6746]/5 transition-all shadow-sm">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
                <h1 className="text-3xl font-serif text-[#4a3b32] tracking-tighter uppercase italic">
                    {course?.title || 'New Course'}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/60">Course Builder</p>
                    {id !== 'new' && (
                        <div className="h-1 w-1 rounded-full bg-[#f1e4da]" />
                    )}
                    {id !== 'new' && (
                        <StatusToggle 
                            status={course.is_published}
                            onToggle={handleToggleStatus}
                        />
                    )}
                </div>
            </div>
        </div>

        <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-[#f1e4da] shadow-sm">
            {[
                { id: 'info', label: 'General Info', icon: Settings },
                { id: 'curriculum', label: 'Curriculum', icon: BookOpen }
            ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    activeTab === tab.id ? 'bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20' : 'text-[#a55a3d]/50 hover:text-[#bc6746]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
            ))}
        </div>
      </div>

      <div>
        {activeTab === 'info' ? (
          <div key="info">
            <form onSubmit={handleSaveInfo} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e725d] ml-1">Course Title</label>
                            <input 
                              type="text"
                              value={course.title}
                              onChange={e => setCourse({...course, title: e.target.value})}
                              placeholder="e.g. 21 Days of Feminine Awakening"
                              className="w-full bg-white/50 border border-[#f1e4da] rounded-2xl px-6 py-4 text-[#4a3b32] text-lg font-serif focus:ring-2 ring-[#bc6746]/20 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e725d] ml-1">Description</label>
                            <textarea 
                              rows={8}
                              value={course.description}
                              onChange={e => setCourse({...course, description: e.target.value})}
                              placeholder="Describe the journey..."
                              className="w-full bg-white/50 border border-[#f1e4da] rounded-2xl px-6 py-4 text-[#4a3b32] text-sm focus:ring-2 ring-[#bc6746]/20 outline-none transition-all resize-none"
                            />
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-8">
                    <GlassCard className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e725d] ml-1">Thumbnail</label>
                            <div className="aspect-video rounded-2xl bg-white/50 border-2 border-dashed border-[#f1e4da] flex flex-col items-center justify-center text-[#bc6746]/40 overflow-hidden relative group">
                                {course.thumbnail_url ? (
                                    <>
                                        <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" className="p-3 bg-white rounded-full text-[#bc6746] shadow-xl">
                                                <Upload className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Portrait</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            toast.info("Uploading thumbnail...");
                                            try {
                                                const res = await mediaService.upload(file, 'courses');
                                                setCourse({...course, thumbnail_url: res.data.url});
                                                toast.success("Thumbnail synchronized");
                                            } catch {
                                                toast.error("Upload failed");
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e725d] ml-1">Price (₹)</label>
                                <input 
                                  type="number"
                                  value={course.price}
                                  onChange={e => setCourse({...course, price: Number(e.target.value)})}
                                  className="w-full bg-white/50 border border-[#f1e4da] rounded-2xl px-4 py-3 text-[#4a3b32] font-bold focus:ring-2 ring-[#bc6746]/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8e725d] ml-1">Category</label>
                                <select 
                                  value={course.category}
                                  onChange={e => setCourse({...course, category: e.target.value})}
                                  className="w-full bg-white/50 border border-[#f1e4da] rounded-2xl px-4 py-3 text-[#4a3b32] text-sm focus:ring-2 ring-[#bc6746]/20 outline-none transition-all appearance-none"
                                >
                                    <option>Yoga</option>
                                    <option>Meditation</option>
                                    <option>Philosophy</option>
                                </select>
                            </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={saving}
                          className="w-full py-4 bg-[#bc6746] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-[#bc6746]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>{id === 'new' ? 'Create Course' : 'Save Changes'}</span>
                        </button>
                    </GlassCard>
                </div>
            </form>
            </div>
          ) : (
            <div key="curriculum">
               <div className="max-w-4xl mx-auto">
                  <CurriculumBuilder 
                     courseId={id as string} 
                     initialSections={course.course_sections || []} 
                     onRefresh={fetchCourse} 
                  />
               </div>
            </div>
          )}
      </div>
    </div>
  );
}
