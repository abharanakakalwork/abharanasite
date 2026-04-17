"use client";

import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  X, 
  FileVideo, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Trash2,
  Play
} from 'lucide-react';
import { videoService, courseService } from '@/lib/api/client';
import { toast } from 'react-toastify';

interface UploadingFile {
  file: File;
  id: string;
  status: 'preparing' | 'uploading' | 'processing' | 'done' | 'error';
  progress: number;
  error?: string;
  videoId?: string;
}

interface Props {
  courseId: string;
  sectionId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function BulkVideoUpload({ courseId, sectionId, onSuccess, onClose }: Props) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        file: f,
        id: Math.random().toString(36).substring(7),
        status: 'preparing' as const,
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    const uploadPromises = files.map(async (fileObj) => {
      if (fileObj.status === 'done') return;

      try {
        // 1. Update status
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'preparing' } : f));

        // 2. Create Upload Session
        const sessionRes = await videoService.createSession(fileObj.file.name);
        if (!sessionRes.data.success) throw new Error('Session creation failed');
        const sessionData = sessionRes.data.data;

        // 3. Perform Direct TUS Upload
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading' } : f));
        
        await videoService.uploadFile(fileObj.file, sessionData, (pct) => {
          setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: pct } : f));
        });

        // 4. Update status and save to DB
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'done', videoId: sessionData.videoId } : f));

        // 5. Automatically create lesson for this video
        await courseService.lessons.create({
          section_id: sectionId,
          title: fileObj.file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          video_url: sessionData.videoId,
          sort_order: 99 // Will be normalized by refresh
        });

      } catch (err: any) {
        console.error('Upload failed for file:', fileObj.file.name, err);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: err.message } : f));
      }
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
    toast.success('Upload sequence complete');
    onSuccess();
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-[#f1e4da] rounded-[32px] p-8 shadow-2xl max-w-2xl w-full mx-auto animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif text-[#4a3b32] tracking-tight italic">Digital Bulk Upload</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/60 mt-1">Direct to Bunny Stream (Resumable)</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#bc6746]/10 rounded-full text-[#a55a3d]/40 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drop Zone / Selection */}
      <div className="mb-8 relative group">
        <input 
          type="file" 
          multiple 
          accept="video/*" 
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-[#f1e4da] rounded-3xl p-10 flex flex-col items-center justify-center text-center group-hover:border-[#bc6746]/30 transition-colors bg-white/50">
          <div className="w-16 h-16 bg-[#bc6746]/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-[#bc6746]" />
          </div>
          <p className="text-sm font-serif text-[#4a3b32]">Select yogic videos to upload</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-[#a55a3d]/40 mt-1">MP4, MOV supported • Multiple files allowed</p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {files.map((f) => (
            <div key={f.id} className="bg-white/60 border border-[#f1e4da] rounded-2xl p-4 flex items-center justify-between gap-4 group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#bc6746]/5 flex items-center justify-center text-[#bc6746] flex-shrink-0">
                  <FileVideo className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#4a3b32] truncate">{f.file.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#f1e4da] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${f.status === 'error' ? 'bg-red-400' : 'bg-[#bc6746]'}`}
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black tabular-nums text-[#a55a3d]/60">{f.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {f.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : f.status === 'uploading' ? (
                  <Loader2 className="w-5 h-5 text-[#bc6746] animate-spin" />
                ) : f.status === 'error' ? (
                  <div className="group/err relative">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div className="absolute bottom-full right-0 mb-2 p-2 bg-red-500 text-white text-[8px] rounded-lg opacity-0 group-hover/err:opacity-100 transition-opacity w-32">
                      {f.error}
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => removeFile(f.id)}
                    className="p-2 text-[#a55a3d]/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose}
          className="flex-1 px-6 py-4 border border-[#f1e4da] text-[#4a3b32]/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={startUpload}
          disabled={files.length === 0 || isUploading}
          className="flex-[2] px-6 py-4 bg-[#bc6746] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-[#bc6746]/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isUploading ? 'Flowing to Cloud...' : 'Start Synchronizing'}</span>
        </button>
      </div>
    </div>
  );
}
