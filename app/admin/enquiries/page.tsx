'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/admin/GlassCard';
import { enquiryService } from '@/lib/api/client';
import { 
  MessageSquare, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Eye,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/admin/modals/ConfirmModal';
import { AdminTable } from '@/components/admin/AdminTable';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
  status: 'pending' | 'read' | 'resolved';
  created_at: string;
}

function EnquiriesContent() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    isLoading: boolean;
  }>({ isOpen: false, id: '', isLoading: false });
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && enquiries.length > 0) {
      const enquiry = enquiries.find(e => e.id === id);
      if (enquiry) {
        setSelectedEnquiry(enquiry);
      }
    }
  }, [enquiries, searchParams]);

  const fetchEnquiries = async () => {
    try {
      const response = await enquiryService.list();
      setEnquiries(response.data.data);
    } catch (err) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      await enquiryService.update(id, { status });
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: status as any } : e));
      if (selectedEnquiry?.id === id) setSelectedEnquiry({ ...selectedEnquiry, status: status as any });
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error('Status update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteEnquiry = async (id: string) => {
    setConfirmModal({ isOpen: true, id, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await enquiryService.delete(id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      toast.info('Enquiry deleted');
    } catch (err) {
      toast.error('Deletion failed');
    } finally {
      setConfirmModal({ isOpen: false, id: '', isLoading: false });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'read': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#a55a3d]/70 font-light italic">Aligning data frequencies...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight text-[#4a3b32]">Messages</h1>
          <p className="mt-2 text-[#a55a3d]/70">Respond to the whispers of seekers.</p>
        </motion.div>
        <span className="rounded-full bg-[#bc6746]/5 border border-[#f1e4da] px-4 py-1 text-xs text-[#a55a3d]/50 font-bold">
          {enquiries.length} total requests
        </span>
      </div>

      {/* Table View */}
      <AdminTable 
        data={enquiries}
        columns={[
          { 
            header: "Date", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#4a3b32]">{new Date(item.created_at).toLocaleDateString()}</span>
                <span className="text-[10px] text-[#a55a3d]/50 font-mono tracking-tighter uppercase">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )
          },
          { 
            header: "Seeker", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-[#4a3b32] uppercase tracking-tight">{item.name}</span>
                <span className="text-[10px] font-bold text-[#bc6746] opacity-60 tracking-wider lowercase">{item.email}</span>
              </div>
            )
          },
          { 
            header: "Interest", 
            accessor: (item) => item.interest ? (
               <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6746] bg-[#bc6746]/5 px-3 py-1 rounded-full border border-[#bc6746]/10">
                 {item.interest}
               </span>
            ) : <span className="text-[10px] italic text-[#4a3b32]/20">General</span>
          },
          { 
            header: "Status", 
            accessor: (item) => (
              <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest inline-block text-center min-w-[80px] ${getStatusColor(item.status)}`}>
                {item.status}
              </div>
            )
          },
          { 
            header: "Actions", 
            className: "text-right",
            accessor: (item) => (
              <div className="flex items-center justify-end space-x-2">
                <button 
                  onClick={() => setSelectedEnquiry(item)}
                  className="p-2 rounded-xl bg-white border border-[#f1e4da] text-[#bc6746] hover:bg-[#bc6746] hover:text-white transition-all shadow-sm active:scale-95"
                  title="View Message"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateStatus(item.id, item.status === 'resolved' ? 'pending' : 'resolved')}
                  className="p-2 rounded-xl bg-white border border-[#f1e4da] text-[#bc6746] hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95"
                  title={item.status === 'resolved' ? "Reopen" : "Mark Resolved"}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteEnquiry(item.id)}
                  className="p-2 rounded-xl bg-white border border-[#f1e4da] text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          }
        ]}
        onRowClick={(item) => setSelectedEnquiry(item)}
      />

      {/* Modal - Enquiry Details */}
      <AnimatePresence>
        {selectedEnquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#fffdf8] border border-[#f1e4da] rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Header Gradient */}
              <div className="h-2 bg-[#bc6746] w-full" />
              
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 w-full">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#bc6746]/10 flex items-center justify-center text-[#bc6746]">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#4a3b32] uppercase tracking-wider">{selectedEnquiry.name}</h2>
                        <div className={`mt-1 px-3 py-1 rounded-full border inline-block text-[10px] font-bold uppercase ${getStatusColor(selectedEnquiry.status)}`}>
                          {selectedEnquiry.status}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-white border border-[#f1e4da] shadow-sm">
                        <Mail className="h-4 w-4 text-[#bc6746]" />
                        <span className="text-sm text-[#4a3b32]/80 font-bold tracking-tight">{selectedEnquiry.email}</span>
                      </div>
                      {selectedEnquiry.phone && (
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white border border-[#f1e4da] shadow-sm">
                          <Phone className="h-4 w-4 text-[#bc6746]" />
                          <span className="text-sm text-[#4a3b32]/80 font-bold">{selectedEnquiry.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedEnquiry(null)}
                    className="p-2 rounded-xl bg-[#bc6746]/5 text-[#a55a3d]/50 hover:text-[#4a3b32] hover:bg-[#bc6746]/10 transition-all active:scale-90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#a55a3d]/50 uppercase tracking-widest flex items-center">
                    <MessageSquare className="w-3 h-3 mr-2" />
                    Seeker's Message
                  </span>
                  <div className="bg-[#bc6746]/5 p-6 rounded-2xl border border-[#bc6746]/10 relative">
                    <p className="text-[#4a3b32]/90 leading-relaxed italic text-lg">
                      "{selectedEnquiry.message}"
                    </p>
                    {selectedEnquiry.interest && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#bc6746]/40 uppercase tracking-widest">Interest:</span>
                        <span className="text-xs font-bold text-[#bc6746] bg-white px-3 py-1 rounded-full border border-[#bc6746]/10 shadow-sm uppercase tracking-wider">
                          {selectedEnquiry.interest}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                 <div className="flex items-center justify-between pt-4 border-t border-[#f1e4da]">
                  <div className="flex space-x-3">
                    {selectedEnquiry.status !== 'resolved' && (
                      <button 
                        onClick={() => updateStatus(selectedEnquiry.id, 'resolved')}
                        disabled={isUpdating}
                        className="flex items-center px-6 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100 text-xs font-bold hover:bg-green-100 transition-all uppercase tracking-widest disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : null}
                        Resolve Request
                      </button>
                    )}
                    {selectedEnquiry.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(selectedEnquiry.id, 'read')}
                        disabled={isUpdating}
                        className="flex items-center px-6 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold hover:bg-blue-100 transition-all uppercase tracking-widest disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : null}
                        Mark as Read
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteEnquiry(selectedEnquiry.id)}
                    className="p-2 text-red-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Delete Enquiry"
        message="Are you sure you want to permanently delete this enquiry? This action cannot be reversed."
        confirmText="Delete"
        variant="danger"
        isLoading={confirmModal.isLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: '', isLoading: false })}
      />
    </div>
  );
}

export default function EnquiriesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] flex-col items-center justify-center text-[#bc6746]">
        <Loader2 className="animate-spin h-8 w-8 mb-4" /> 
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Loading sanctuary data...</p>
      </div>
    }>
      <EnquiriesContent />
    </Suspense>
  );
}
