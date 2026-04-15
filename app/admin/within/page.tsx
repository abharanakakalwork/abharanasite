'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { blogService, mediaService } from '@/lib/api/client';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle,
  Tag,
  Type,
  ImageIcon,
  X,
  Loader2,
  Layers,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/admin/Editor'), { ssr: false });


interface BlogPost {
  id: string;
  title: string;
  content: string;
  category_id: string;
  image_url: string;
  created_at: string;
  journal_categories: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function WithinAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [loading, setLoading] = useState(true);
  
  // Post Form State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    image_url: '',
  });
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    isLoading: boolean;
  }>({ isOpen: false, id: '', isLoading: false });

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        blogService.posts.list(),
        blogService.categories.list()
      ]);
      setPosts(postsRes.data.data);
      setCategories(catsRes.data.data);
    } catch (err) {
      toast.error('Failed to load wisdom vibrations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPostModal = (post: BlogPost | null = null) => {
    if (post) {
      setEditingPost(post);
      setPostFormData({
        title: post.title,
        content: post.content,
        category_id: post.category_id || (categories.length > 0 ? categories[0].id : ''),
        image_url: post.image_url || '',
      });
    } else {
      setEditingPost(null);
      setPostFormData({ 
        title: '', 
        content: '', 
        category_id: categories.length > 0 ? categories[0].id : '', 
        image_url: '' 
      });
    }
    setPostImageFile(null);
    setIsPostModalOpen(true);
  };

  // Ensure category is set if categories load after modal opens
  useEffect(() => {
    if (isPostModalOpen && !editingPost && !postFormData.category_id && categories.length > 0) {
      setPostFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories, isPostModalOpen, editingPost, postFormData.category_id]);

  const isJsonString = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
    try {
      const res = await mediaService.upload(file, 'blogs');
      if (res.data.success) {
        setPostFormData(prev => ({ ...prev, image_url: res.data.url }));
        toast.success('Image stored in the sacred archives');
      }
    } catch (err) {
      toast.error('Failed to upload image into the cosmic space');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isImageUploading) return;
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('title', postFormData.title);
    data.append('content', postFormData.content);
    data.append('category_id', postFormData.category_id);
    if (postFormData.image_url) data.append('image_url', postFormData.image_url);

    try {
      if (editingPost) {
        await blogService.posts.update(editingPost.id, data);
        toast.success('Resonance Harmonized');
      } else {
        await blogService.posts.create(data);
        toast.success('New resonance Written');
      }
      fetchData();
      setIsPostModalOpen(false);
    } catch (err) {
      toast.error('Writing failed in the void');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePost = async (id: string) => {
    setConfirmModal({ isOpen: true, id, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await blogService.posts.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.info('Entry dissolved');
    } catch (err) {
      toast.error('Deletion failed');
    } finally {
      setConfirmModal({ isOpen: false, id: '', isLoading: false });
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await blogService.categories.create(newCategoryName);
      setNewCategoryName('');
      toast.success('Category Manifested');
      fetchData();
    } catch (err) {
      toast.error('Category manifestation failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-[#a55a3d]/70 font-light italic">Unfolding the sacred scrolls...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-[#4a3b32]">Blog</h1>
          <p className="mt-2 text-[#a55a3d]/70 italic">Manage blog posts and categories.</p>
        </motion.div>
        
        <div className="flex rounded-2xl bg-[#bc6746]/5 p-1 border border-[#f1e4da] backdrop-blur-xl">
           <button 
             onClick={() => setActiveTab('posts')}
             className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'posts' ? 'bg-[#bc6746] text-white shadow-lg' : 'text-[#a55a3d]/50 hover:text-[#bc6746]'}`}
           >
             Posts
           </button>
           <button 
             onClick={() => setActiveTab('categories')}
             className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'categories' ? 'bg-[#bc6746] text-white shadow-lg' : 'text-[#a55a3d]/50 hover:text-[#bc6746]'}`}
           >
             Categories
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'posts' ? (
          <motion.div 
            key="posts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Post Controls */}
            <div className="flex items-center space-x-4">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a55a3d]/40" />
                 <input className="w-full rounded-2xl border border-[#f1e4da] bg-white/50 py-3 pl-12 pr-4 text-sm text-[#4a3b32] placeholder-[#a55a3d]/30 outline-none focus:border-[#bc6746]/30" placeholder="Search the archives..." />
               </div>
               <button 
                 onClick={() => handleOpenPostModal()} 
                 className="flex items-center space-x-2 rounded-full bg-[#bc6746] px-8 py-3 font-semibold text-white uppercase tracking-widest text-xs shadow-lg shadow-[#bc6746]/20 transition-all hover:bg-[#a55a3d] hover:-translate-y-0.5 active:scale-95"
               >
                  <Plus className="h-4 w-4" />
                  <span>Add Post</span>
               </button>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <GlassCard key={post.id} noPadding delay={i * 0.05} className="group flex flex-col h-full">
                   <div className="relative h-48 overflow-hidden bg-[#1a1008]">
                    {post.image_url && <img src={post.image_url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1008]/90 via-[#1a1008]/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-[#bc6746]/80 px-3 py-1 text-[9px] font-bold text-white backdrop-blur-md border border-white/10 uppercase tracking-widest leading-none">
                        {post.journal_categories?.name || 'Wisdom'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                       <button onClick={() => handleOpenPostModal(post)} className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-[#bc6746] transition-all"><Edit2 className="w-3 h-3" /></button>
                       <button onClick={() => deletePost(post.id)} className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-red-500/50 transition-all"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                   <div className="p-6 flex-1 flex flex-col space-y-3">
                    <h3 className="text-lg font-serif font-bold text-[#4a3b32] uppercase tracking-wider line-clamp-2 leading-tight group-hover:text-[#bc6746] transition-colors">
                      {post.title}
                    </h3>
                    <p className="flex-1 text-[11px] text-[#a55a3d]/70 line-clamp-4 italic leading-relaxed">
                      {post.content.length > 100 && post.content.startsWith('{') ? 'Block Content...' : post.content.substring(0, 200) + '...'}
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-[#f1e4da]">
                       <span className="text-[10px] text-[#a55a3d]/40 font-mono tracking-tighter">
                         {new Date(post.created_at).toLocaleDateString()}
                       </span>
                       <FileText className="w-3 h-3 text-[#a55a3d]/10" />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <GlassCard>
               <h3 className="text-xl font-bold text-[#4a3b32] mb-6 uppercase tracking-widest">Add Category</h3>
               <form onSubmit={addCategory} className="flex space-x-4 mb-8">
                  <input 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="flex-1 rounded-2xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm"
                    placeholder="E.g., Quantum Healing, Nature, Wellness..."
                  />
                  <button type="submit" className="px-8 py-4 rounded-2xl bg-[#bc6746] text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#bc6746]/10">
                    Add
                  </button>
               </form>

               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-[0.2em] mb-2 block">Current Foundations</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {categories.map(cat => (
                       <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#f1e4da] group hover:border-[#bc6746]/30 transition-all shadow-sm">
                          <div className="flex items-center space-x-3">
                            <Tag className="w-4 h-4 text-[#bc6746]" />
                            <span className="text-sm text-[#4a3b32]/80 font-bold uppercase tracking-wider">{cat.name}</span>
                          </div>
                          <button className="text-[#a55a3d]/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                       </div>
                     ))}
                  </div>
               </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl rounded-3xl overflow-hidden bg-[#fffdf8] border border-[#f1e4da] shadow-2xl flex flex-col max-h-[90vh] paper-grain"
            >
              <div className="h-1.5 bg-gradient-to-r from-[#bc6746] via-[#a55a3d] to-[#bc6746] w-full" />
              <form 
                onSubmit={handlePostSubmit} 
                className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8"
                data-lenis-prevent
                style={{ touchAction: 'pan-y' }}
              >
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold text-[#4a3b32] uppercase tracking-widest">
                       {editingPost ? 'Edit Resonance' : 'Write Eternal Inspiration'}
                    </h2>
                    <button type="button" onClick={() => setIsPostModalOpen(false)} className="p-2 rounded-full bg-[#bc6746]/10 text-[#bc6746] hover:bg-[#bc6746] hover:text-white transition-all"><X className="w-5 h-5" /></button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">Post Title</label>
                          <input 
                             value={postFormData.title}
                             onChange={e => setPostFormData({...postFormData, title: e.target.value})}
                             className="w-full rounded-2xl border border-[#f1e4da] bg-white p-4 text-xl font-bold text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm"
                             placeholder="The Awakening Journey..."
                             required
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">Cosmic Wisdom (Content)</label>
                          <div className="relative">
                            <Editor 
                              data={isJsonString(postFormData.content) ? JSON.parse(postFormData.content) : undefined}
                              onChange={(data) => setPostFormData({ ...postFormData, content: JSON.stringify(data) })}
                            />
                            {!isJsonString(postFormData.content) && postFormData.content && (
                              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs italic">
                                <p className="font-bold mb-1">Notice:</p>
                                This entry contains legacy text data. It will be converted to blocks once you start editing and save.
                                <div className="mt-2 p-2 bg-white/50 rounded border border-amber-100 max-h-20 overflow-auto">
                                  {postFormData.content}
                                </div>
                              </div>
                            )}
                          </div>
                       </div>
                    </div>

                    {/* Meta Sidebar */}
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest italic">Foundation (Category)</label>
                           <div className="relative">
                             <select 
                               value={postFormData.category_id}
                               onChange={e => setPostFormData({...postFormData, category_id: e.target.value})}
                               className="w-full rounded-2xl border border-[#f1e4da] bg-white p-4 text-sm text-[#4a3b32] focus:border-[#bc6746] outline-none shadow-sm cursor-pointer hover:border-[#bc6746]/30 transition-all font-semibold"
                             >
                                <option value="" disabled>Select a vibration...</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-white">{cat.name}</option>)}
                             </select>
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                               <Tag className="w-4 h-4 text-[#bc6746]/40" />
                             </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest">Energy Snapshot (Thumbnail)</label>
                           <div className="relative h-64 w-full rounded-3xl overflow-hidden border-2 border-dashed border-[#f1e4da] bg-white transition-all hover:border-[#bc6746]/30 flex items-center justify-center group cursor-pointer shadow-sm">
                              {isImageUploading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
                                  <Loader2 className="w-8 h-8 animate-spin text-[#bc6746] mb-2" />
                                  <span className="text-[10px] font-bold text-[#bc6746] uppercase tracking-widest">Ascending...</span>
                                </div>
                              )}
                              {postFormData.image_url ? (
                                <img 
                                  src={postFormData.image_url} 
                                  className="h-full w-full object-cover" 
                                />
                              ) : (
                                <div className="text-center space-y-2 text-[#a55a3d]/30">
                                  <Plus className="h-10 w-10 mx-auto" />
                                  <p className="text-[10px] font-bold uppercase tracking-widest">Invoke Image</p>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={isImageUploading}
                              />
                           </div>
                           <p className="text-[10px] text-[#a55a3d]/30 italic mt-2 text-center">Optimized for high-vibrational displays.</p>
                        </div>
                    </div>
                 </div>

                  <div className="flex justify-end pt-6 space-x-6 border-t border-[#f1e4da]/50">
                    <button 
                      type="button" 
                      onClick={() => setIsPostModalOpen(false)}
                      className="px-8 py-3 rounded-full text-[#a55a3d]/50 hover:text-[#4a3b32] transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                      Wait (Cancel)
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || isImageUploading}
                      className="px-12 py-4 rounded-full bg-[#bc6746] text-white font-bold shadow-xl shadow-[#bc6746]/20 transition-all hover:bg-[#a55a3d] hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center uppercase tracking-widest text-xs"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <BookOpen className="h-4 w-4 mr-3" />}
                      {editingPost ? 'RESTORE HARMONY' : 'MANIFEST WISDOM'}
                    </button>
                  </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Dissolve Entry"
        message="Are you sure you want to permanently dissolve this sacred insight from the archives?"
        confirmText="Dissolve"
        variant="danger"
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: '', isLoading: false })}
      />
    </div>
  );
}
