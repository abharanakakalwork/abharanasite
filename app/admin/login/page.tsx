'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { GlassCard } from '@/components/admin/GlassCard';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      // Error handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-12 text-center text-[#4a3b32]">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block h-16 w-16 rounded-3xl bg-gradient-to-tr from-[#bc6746] to-[#a55a3d] p-4 shadow-2xl shadow-[#bc6746]/20"
          >
            <Lock className="h-full w-full text-white" />
          </motion.div>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">
            Sacred Access
          </h1>
          <p className="mt-2 text-[#a55a3d]/70 font-light italic">
            Enter the Abharana Kakal sanctuary
          </p>
        </div>

        <GlassCard className="border-[#f1e4da] shadow-2xl shadow-[#4a3b32]/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-1">Guardian Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a55a3d]/30" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#f1e4da] bg-white py-3 pl-12 pr-4 text-[#4a3b32] placeholder-[#a55a3d]/20 outline-none transition-all focus:border-[#bc6746]/50 focus:ring-4 focus:ring-[#bc6746]/5"
                  placeholder="admin@abharanakakal.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#a55a3d]/50 ml-1">Eternal Key (Password)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a55a3d]/30" />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#f1e4da] bg-white py-3 pl-12 pr-4 text-[#4a3b32] placeholder-[#a55a3d]/20 outline-none transition-all focus:border-[#bc6746]/50 focus:ring-4 focus:ring-[#bc6746]/5"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#bc6746] py-4 font-bold text-white shadow-xl shadow-[#bc6746]/20 transition-all hover:scale-[1.02] hover:bg-[#a55a3d] active:scale-[0.98] disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center uppercase tracking-widest text-xs">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4 text-white" />
                )}
                Unlock Sanctuary
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover:translate-x-full -translate-x-full" />
            </button>
          </form>
        </GlassCard>

        <div className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#a55a3d]/20">
          Abharana Kakal Management Systems
        </div>
      </motion.div>
    </div>
  );
}
