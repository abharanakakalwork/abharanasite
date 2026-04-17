"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  GripVertical, 
  Video, 
  Edit2, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Play,
  Upload
} from 'lucide-react';
import { courseService } from '@/lib/api/client';
import { toast } from 'react-toastify';
import BulkVideoUpload from './BulkVideoUpload';
import { StatusToggle } from '@/components/admin/StatusToggle';

interface Props {
  courseId: string;
  initialSections: any[];
  onRefresh: () => void;
}

export default function CurriculumBuilder({ courseId, initialSections, onRefresh }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [bulkUploadSectionId, setBulkUploadSectionId] = useState<string | null>(null);

  const handleAddSection = async () => {
    setLoading('add-section');
    try {
      await courseService.sections.create({
        course_id: courseId,
        title: 'New Section',
        sort_order: initialSections.length
      });
      toast.success('New chapter added');
      onRefresh();
    } catch {
      toast.error('Failed to add section');
    } finally {
      setLoading(null);
    }
  };

  const handleAddLesson = async (sectionId: string, lessonCount: number) => {
    setLoading(`add-lesson-${sectionId}`);
    try {
      await courseService.lessons.create({
        section_id: sectionId,
        title: 'New Lesson',
        sort_order: lessonCount,
        video_url: ''
      });
      toast.success('New lesson added');
      onRefresh();
    } catch {
      toast.error('Failed to add lesson');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure? This will delete all lessons in this section.')) return;
    try {
      await courseService.sections.delete(id);
      toast.success('Section removed');
      onRefresh();
    } catch {
      toast.error('Failed to remove section');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await courseService.lessons.delete(id);
      toast.success('Lesson removed');
      onRefresh();
    } catch {
      toast.error('Failed to remove lesson');
    }
  };

  const handleUpdateSection = async (id: string, title: string) => {
    try {
      await courseService.sections.update(id, { title });
      setEditingSection(null);
      onRefresh();
    } catch {
      toast.error('Failed to update section');
    }
  };

  const handleUpdateLesson = async (id: string, data: any) => {
    try {
      await courseService.lessons.update(id, data);
      setEditingLesson(null);
      onRefresh();
    } catch {
      toast.error('Failed to update lesson');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-[#4a3b32]">Curriculum</h2>
        <button 
          onClick={handleAddSection}
          disabled={!!loading}
          className="flex items-center gap-2 px-6 py-2 bg-[#bc6746]/5 border border-[#bc6746]/20 text-[#bc6746] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#bc6746] hover:text-white transition-all shadow-sm"
        >
          {loading === 'add-section' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          <span>Add Section</span>
        </button>
      </div>

      <div className="space-y-4">
        {initialSections?.map((section, sIdx) => (
          <div key={section.id} className="bg-white/40 border border-[#f1e4da] rounded-2xl overflow-hidden shadow-sm">
            {/* Section Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#f1e4da]/50 bg-white/20">
              <div className="flex items-center gap-4 flex-1">
                <GripVertical className="text-[#a55a3d]/20 w-4 h-4" />
                {editingSection === section.id ? (
                  <input 
                    autoFocus
                    className="bg-transparent font-serif font-bold text-[#4a3b32] outline-none border-b border-[#bc6746]"
                    defaultValue={section.title}
                    onBlur={(e) => handleUpdateSection(section.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateSection(section.id, (e.target as any).value)}
                  />
                ) : (
                  <span className="font-serif font-bold text-[#4a3b32]">{section.title}</span>
                )}
                <button onClick={() => setEditingSection(section.id)} className="p-1.5 text-[#a55a3d]/40 hover:text-[#bc6746] transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                    onClick={() => setBulkUploadSectionId(section.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#bc6746]/10 text-[#bc6746] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#bc6746] hover:text-white transition-all"
                    title="Bulk Upload Videos"
                >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Bulk Upload</span>
                </button>
                <button 
                    onClick={() => handleAddLesson(section.id, section.course_lessons?.length || 0)}
                    disabled={!!loading}
                    className="p-2 text-[#bc6746] hover:bg-white/50 rounded-lg transition-all"
                    title="Add Lesson"
                >
                    {loading === `add-lesson-${section.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDeleteSection(section.id)} className="p-2 text-[#a55a3d]/40 hover:text-red-500 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lessons List */}
            <div className="p-3 space-y-2">
                {section.course_lessons?.map((lesson, lIdx) => (
                  <div 
                    key={lesson.id}
                    className="bg-white/60 border border-[#f1e4da] rounded-xl p-3 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="shrink-0 w-16 aspect-video rounded-lg bg-[#bc6746]/5 border border-[#f1e4da] overflow-hidden flex items-center justify-center text-[#bc6746] text-[10px] font-black relative group-hover:border-[#bc6746]/30">
                        {lesson.video_url ? (
                          <img 
                            src={`https://vz-117edb63-f79.b-cdn.net/${lesson.video_url}/thumbnail.jpg`} 
                            className="w-full h-full object-cover" 
                            alt=""
                            onError={(e) => {
                              (e.target as any).src = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=100";
                            }}
                          />
                        ) : (
                          <Video className="w-4 h-4 opacity-20" />
                        )}
                      </div>
                      <div className="flex-1">
                        {editingLesson === lesson.id ? (
                          <div className="space-y-2">
                            <input 
                              autoFocus
                              className="w-full bg-white border border-[#f1e4da] rounded-lg px-3 py-1 text-sm outline-none"
                              defaultValue={lesson.title}
                              onBlur={(e) => handleUpdateLesson(lesson.id, { ...lesson, title: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <div className="relative flex-1 group/upload">
                                    <input 
                                      placeholder="Bunny Video ID (e.g. 7474-abc-...)"
                                      className="w-full bg-white border border-[#f1e4da] rounded-lg px-3 py-1 text-[10px] outline-none group-focus-within/upload:border-[#bc6746]"
                                      defaultValue={lesson.video_url}
                                      onBlur={(e) => handleUpdateLesson(lesson.id, { ...lesson, video_url: e.target.value })}
                                    />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                       <button 
                                          onClick={() => {
                                              const input = document.createElement('input');
                                              input.type = 'file';
                                              input.accept = 'video/*';
                                              input.onchange = async (e: any) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  
                                                  const toastId = toast.loading(`Uploading "${file.name}" to Sanctuary...`);
                                                  try {
                                                      const sessionRes = await videoService.createSession(file.name);
                                                      const sessionData = sessionRes.data.data;
                                                      
                                                      await videoService.uploadFile(file, sessionData, (pct) => {
                                                          toast.update(toastId, { render: `Uploading: ${pct}%`, type: 'default', isLoading: true });
                                                      });

                                                      await handleUpdateLesson(lesson.id, { ...lesson, video_url: sessionData.videoId });
                                                      toast.update(toastId, { render: "Synchronized successfully", type: "success", isLoading: false, autoClose: 3000 });
                                                  } catch (err) {
                                                      toast.update(toastId, { render: "Upload failed", type: "error", isLoading: false, autoClose: 3000 });
                                                  }
                                              };
                                              input.click();
                                          }}
                                          className="p-1 text-[#bc6746] hover:bg-[#bc6746]/10 rounded transition-colors"
                                          title="Upload to Bunny"
                                       >
                                          <Upload className="w-3 h-3" />
                                       </button>
                                    </div>
                                </div>
                                <input 
                                  placeholder="Duration (e.g. 12:45)"
                                  className="w-24 bg-white border border-[#f1e4da] rounded-lg px-3 py-1 text-[10px] outline-none"
                                  defaultValue={lesson.duration}
                                  onBlur={(e) => handleUpdateLesson(lesson.id, { ...lesson, duration: e.target.value })}
                                />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-[#4a3b32]">{lesson.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${lesson.video_url ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {lesson.video_url ? 'Video Linked' : 'No Video'}
                                </span>
                                {lesson.duration && <span className="text-[10px] text-[#a55a3d]/50 italic">{lesson.duration}</span>}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingLesson(lesson.id === editingLesson ? null : lesson.id)} className="p-2 text-[#a55a3d]/40 hover:text-[#bc6746] transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <StatusToggle 
                        status={lesson.is_published}
                        onToggle={(newStatus) => handleUpdateLesson(lesson.id, { ...lesson, is_published: newStatus })}
                        labels={{ true: 'Live', false: 'Draft' }}
                      />
                      <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-[#a55a3d]/40 hover:text-red-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              {!section.course_lessons?.length && (
                <div className="py-8 text-center border-2 border-dashed border-[#f1e4da]/50 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/30">No lessons in this chapter</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {!initialSections?.length && (
          <div className="py-20 text-center bg-white/20 border border-dashed border-[#f1e4da] rounded-2xl">
            <h3 className="text-lg font-serif text-[#4a3b32]/40 italic">Empty Curriculum</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/30 mt-1">Add your first section to begin the journey</p>
          </div>
        )}
      </div>

      {/* Bulk Upload Modal Overlay */}
      {bulkUploadSectionId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2d2420]/60 backdrop-blur-sm">
          <BulkVideoUpload 
            courseId={courseId}
            sectionId={bulkUploadSectionId}
            onClose={() => setBulkUploadSectionId(null)}
            onSuccess={() => {
              setBulkUploadSectionId(null);
              onRefresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
