'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { authService } from '@/lib/api/client';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  Settings, 
  Shield, 
  Smartphone, 
  Globe, 
  Clock, 
  LogOut, 
  Trash2,
  Lock,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';

interface Session {
  id: string;
  device_id: string;
  created_at: string;
  expires_at: string;
  token: string;
}

export default function SettingsPage() {
  const { user, logout } = useAdminAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading: boolean;
    variant?: 'danger' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, isLoading: false });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await authService.sessions.list();
      setSessions(response.data.data);
    } catch (err) {
      toast.error('Failed to reveal active dimensions (sessions)');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Sever Connection',
      message: 'Are you sure you want to sever this connection? The device will be forced to re-authenticate.',
      variant: 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await authService.sessions.revoke(id);
          setSessions(prev => prev.filter(s => s.id !== id));
          toast.info('Connection severed');
        } catch (err) {
          toast.error('Severance failed');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const revokeAllSessions = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Dissolve All Dimensions',
      message: 'Are you sure you want to sever ALL active connections except your current one? All other devices will be logged out.',
      variant: 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        setIsRevokingAll(true);
        try {
          await authService.sessions.revoke();
          toast.success('All other dimensions closed');
          fetchSessions();
        } catch (err) {
          toast.error('Failed to close dimensions');
        } finally {
          setIsRevokingAll(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-[#a55a3d]/70 font-light italic">Synchronizing portal settings...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight text-[#4a3b32] flex items-center">
          <Settings className="mr-4 h-8 w-8 text-[#bc6746]" />
          Admin Settings
        </h1>
        <p className="mt-2 text-[#a55a3d]/70 ml-12">Manage your account and active login sessions.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Profile & Security */}
        <div className="lg:col-span-1 space-y-8">
           <GlassCard delay={0.1}>
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#bc6746] to-[#a55a3d] p-0.5 shadow-xl shadow-[#bc6746]/10">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[#4a3b32]">
                       <User className="h-10 w-10" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-[#4a3b32] uppercase tracking-wider">{user?.email}</h3>
                    <p className="text-[10px] text-[#bc6746] font-bold uppercase tracking-[0.2em] mt-1">Master Administrator</p>
                 </div>
                 <div className="flex items-center space-x-2 text-sm text-[#a55a3d]/70 italic bg-[#bc6746]/5 px-4 py-1 rounded-full border border-[#f1e4da]">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span>Vulnerability: 0%</span>
                 </div>
              </div>
           </GlassCard>

           <GlassCard delay={0.2} className="border-[#bc6746]/20">
              <h3 className="text-sm font-bold text-[#4a3b32] mb-6 uppercase tracking-widest flex items-center">
                 <Lock className="w-4 h-4 mr-2" />
                 Security
              </h3>
              <div className="space-y-4">
                 <p className="text-md text-[#a55a3d]/70 italic leading-relaxed">
                   Your administrative access is bound by high-fidelity JWT encryption and database session tracking.
                 </p>
                 <button className="w-full py-3 rounded-xl bg-[#bc6746]/5 border border-[#f1e4da] text-xs font-bold text-[#a55a3d]/50 hover:text-[#bc6746] hover:bg-[#bc6746]/10 transition-all uppercase tracking-widest">
                    Update Password (Manual)
                 </button>
              </div>
           </GlassCard>
        </div>

        {/* Right Col: Session Management */}
        <div className="lg:col-span-2 space-y-8">
           <GlassCard delay={0.3} noPadding className="h-full">
              <div className="p-8 border-b border-[#f1e4da] flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-bold text-[#4a3b32] uppercase tracking-widest flex items-center">
                       <Smartphone className="w-5 h-5 mr-3 text-[#bc6746]" />
                       Active Sessions
                    </h3>
                    <p className="text-sm text-[#a55a3d]/50 mt-1 italic">Manage your active presence across devices (Max 5).</p>
                 </div>
                 <button 
                   onClick={revokeAllSessions}
                   disabled={isRevokingAll}
                   className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                 >
                    LOG OUT ALL
                 </button>
              </div>

              <div className="divide-y divide-[#f1e4da]">
                 <AnimatePresence mode="popLayout">
                    {sessions.map((session, i) => (
                       <motion.div 
                         key={session.id}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         className="p-6 flex items-center justify-between group hover:bg-[#bc6746]/5 transition-colors"
                       >
                          <div className="flex items-center space-x-6">
                             <div className="h-12 w-12 rounded-2xl bg-[#bc6746]/5 flex items-center justify-center text-[#a55a3d]/50 group-hover:text-[#bc6746] transition-colors">
                                <Globe className="h-6 w-6" />
                             </div>
                             <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                   <h4 className="text-sm font-bold text-[#4a3b32]">Session in the Void</h4>
                                   {/* Check if current token? Not easy without knowing current, but can guestimate */}
                                   <span className="text-[8px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20 font-bold uppercase">Active</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                   <span className="text-xs text-[#a55a3d]/70 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Manifested: {new Date(session.created_at).toLocaleString()}
                                   </span>
                                   <span className="text-xs text-[#a55a3d]/30 italic">
                                      Relic: {session.device_id || 'Browser Presence'}
                                   </span>
                                </div>
                             </div>
                          </div>
                          
                          <button 
                             onClick={() => revokeSession(session.id)}
                             className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
              
              <div className="p-8 bg-[#bc6746]/5 rounded-b-3xl">
                 <div className="flex items-start space-x-4 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-1" />
                    <div className="space-y-1">
                       <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Energy Retention Policy</h4>
                       <p className="text-[10px] text-[#a55a3d]/50 leading-relaxed italic">
                         Your presence is limited to 5 concurrent dimensions. Manifesting a 6th will automatically dissolve your oldest session in the archives.
                       </p>
                    </div>
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>

      <div className="flex justify-center pt-12">
         <button 
           onClick={logout}
           className="flex items-center space-x-3 px-12 py-4 rounded-2xl bg-white border border-[#f1e4da] text-[#a55a3d]/70 font-bold hover:text-red-600 hover:border-red-500/20 hover:bg-red-500/5 transition-all uppercase tracking-[0.2em] shadow-xl group active:scale-95 shadow-[#bc6746]/5"
         >
            <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-2" />
            <span>Log Out</span>
         </button>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
