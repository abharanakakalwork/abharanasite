"use client";

import React, { useState } from 'react';
import { X, Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStudentAuth } from '@/hooks/useStudentAuth';

export default function StudentAuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useStudentAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/student/login' : '/api/auth/student/register';
      const res = await axios.post(endpoint, formData);
      
      if (res.data.token) {
        login(res.data.token, res.data.student);
        toast.success(mode === 'login' ? 'Welcome back to the sanctuary' : 'Academy account created!');
        closeAuthModal();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#2d2420]/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-xl border border-[#f1e4da] rounded-[40px] p-10 shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#bc6746]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#bc6746]/5 rounded-full -ml-16 -mb-16 blur-3xl" />

        <button 
          onClick={closeAuthModal}
          className="absolute top-6 right-6 p-2 hover:bg-[#bc6746]/10 rounded-full text-[#a55a3d]/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[#4a3b32] tracking-tight italic">
            {mode === 'login' ? 'Continue your Journey' : 'Join the Sanctuary'}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a55a3d]/60 mt-2">
            Academy Access Required
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#bc6746]/5 rounded-2xl mb-8 border border-[#f1e4da]/50">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'login' ? 'bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20' : 'text-[#a55a3d]/50 hover:text-[#bc6746]'
            }`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'register' ? 'bg-[#bc6746] text-white shadow-lg shadow-[#bc6746]/20' : 'text-[#a55a3d]/50 hover:text-[#bc6746]'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8e725d] ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bc6746]/40" />
                <input 
                  required
                  type="text"
                  placeholder="Abharana Kakal"
                  className="w-full bg-white/50 border border-[#f1e4da] rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 ring-[#bc6746]/20 outline-none transition-all placeholder:text-gray-300"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8e725d] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bc6746]/40" />
              <input 
                required
                type="email"
                placeholder="you@sanctuary.com"
                className="w-full bg-white/50 border border-[#f1e4da] rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 ring-[#bc6746]/20 outline-none transition-all placeholder:text-gray-300"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8e725d] ml-1">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bc6746]/40" />
              <input 
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/50 border border-[#f1e4da] rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 ring-[#bc6746]/20 outline-none transition-all placeholder:text-gray-300"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#bc6746] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#bc6746]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{mode === 'login' ? 'Enter Sanctuary' : 'Create Account'}</span>}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <p className="text-[10px] text-center text-[#a55a3d]/40 font-medium italic mt-6 px-4">
            By entering, you agree to our Terms of Wisdom and Privacy guidelines.
          </p>
        </form>
      </div>
    </div>
  );
}
