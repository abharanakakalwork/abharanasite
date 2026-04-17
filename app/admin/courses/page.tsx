"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { courseService, mediaService } from '@/lib/api/client';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  Image as ImageIcon,
  Edit,
  Video,
  Eye,
  Settings,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import { AdminTable } from '@/components/admin/AdminTable';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';
import { StatusToggle } from '@/components/admin/StatusToggle';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  price: number;
  is_published: boolean;
  category: string;
  created_at: string;
}

export default function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, title: string }>({
    isOpen: false,
    id: '',
    title: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.list();
      setCourses(res.data.data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await courseService.update(id, { is_published: !currentStatus });
      setCourses(courses.map(c => c.id === id ? { ...c, is_published: !currentStatus } : c));
      toast.success(`Course ${!currentStatus ? 'live in the sanctuary' : 'returned to library'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await courseService.delete(confirmDelete.id);
      toast.success('Course evaporated from the sanctuary');
      setCourses(courses.filter(c => c.id !== confirmDelete.id));
    } catch (err) {
      toast.error('Failed to delete course');
    } finally {
      setConfirmDelete({ isOpen: false, id: '', title: '' });
    }
  };

  if (loading && courses.length === 0) return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-[#bc6746]">
        <Loader2 className="animate-spin h-8 w-8 mb-4" /> 
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Gathering wisdom from the cloud...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#4a3b32] tracking-tighter uppercase italic">Video Courses</h1>
          <p className="mt-2 text-[#a55a3d]/70 max-w-md text-sm italic">Create and manage your recorded yoga wisdom.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchCourses} 
            className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-[#f1e4da] text-[#bc6746] hover:bg-[#bc6746]/5 transition-all shadow-sm"
          >
            <RefreshCw className={loading ? "animate-spin w-5 h-5" : "w-5 h-5"} />
          </button>
          
          <Link 
            href="/admin/courses/new"
            className="flex items-center space-x-2 px-6 py-3 bg-[#bc6746] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#bc6746]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Course</span>
          </Link>
        </div>
      </div>

      <GlassCard className="p-0 border-[#f1e4da] overflow-hidden bg-white/30 backdrop-blur-md">
        <AdminTable 
          data={courses}
          columns={[
            {
              header: "Course",
              accessor: (course) => (
                <div className="flex items-center space-x-4">
                  {course.thumbnail_url ? (
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-[#f1e4da]">
                      <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-[#bc6746]/5 flex items-center justify-center text-[#bc6746]">
                      <Video className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-[#4a3b32] text-lg">{course.title}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/50 italic">{course.category}</span>
                  </div>
                </div>
              )
            },
            {
              header: "Status",
              accessor: (course) => (
                <StatusToggle 
                  status={course.is_published}
                  onToggle={() => handleToggleStatus(course.id, course.is_published)}
                />
              )
            },
            {
              header: "Price",
              accessor: (course) => (
                <span className="font-bold text-[#4a3b32]">₹{course.price}</span>
              )
            },
            {
              header: "Created",
              accessor: (course) => (
                <span className="text-xs text-[#a55a3d]">{new Date(course.created_at).toLocaleDateString()}</span>
              )
            },
            {
              header: "Actions",
              accessor: (course) => (
                <div className="flex items-center gap-2">
                  <Link href={`/admin/courses/${course.id}`} className="p-2.5 rounded-xl bg-white/50 border border-[#f1e4da] text-[#bc6746] hover:bg-[#bc6746] hover:text-white transition-all">
                    <Settings className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => setConfirmDelete({ isOpen: true, id: course.id, title: course.title })}
                    className="p-2.5 rounded-xl bg-white/50 border border-[#f1e4da] text-[#a55a3d]/50 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          ]}
        />
        
        {courses.length === 0 && !loading && (
          <div className="p-20 text-center flex flex-col items-center space-y-4">
             <div className="h-20 w-20 bg-[#f5ece5] rounded-full flex items-center justify-center text-[#bc6746]">
                <Video className="h-10 w-10 opacity-30" />
             </div>
             <div>
                <h3 className="text-xl font-serif text-[#4a3b32]">No Courses Yet</h3>
                <p className="text-sm text-[#a55a3d]/60 italic mt-1">Ready to share your wisdom? Create your first course above.</p>
             </div>
          </div>
        )}
      </GlassCard>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title="Delete Course?"
        message={`Are you sure you want to remove "${confirmDelete.title}"? This action is permanent and will dissolve all curriculum data linked to it.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete({ isOpen: false, id: '', title: '' })}
      />
    </div>
  );
}
