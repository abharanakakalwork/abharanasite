"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { bookingService } from '@/lib/api/client';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Filter,
  RefreshCw,
  Search,
  Tag,
  User,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cn, formatDateLocal } from '@/lib/utils';
import { AdminTable } from '@/components/admin/AdminTable';
import { AnimatePresence, motion } from 'framer-motion';

interface BookingMetadata {
  item_title?: string;
  offering_title?: string;
  date?: string;
  time?: string;
  session_date?: string;
  type_label?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  [key: string]: unknown;
}

interface Booking {
  id: string;
  booking_type: 'yoga' | 'upcoming' | 'retreat';
  reference_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  total_amount: number;
  payment_status: 'pending' | 'submitted' | 'verified' | 'failed' | 'paid';
  booking_status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  payment_reference?: string;
  payment_screenshot_url?: string;
  created_at: string;
  metadata?: BookingMetadata;
  is_legacy?: boolean;
}

const BOOKINGS_PER_PAGE = 10;

function formatCurrencyLabel(amount: number | string) {
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(numeric)) return `Rs ${amount}`;
  return `Rs ${numeric.toFixed(2).replace(/\.00$/, '')}`;
}

function getBookingTitle(booking: Booking) {
  return booking.metadata?.item_title || booking.metadata?.offering_title || 'Booking';
}

function getBookingDate(booking: Booking) {
  return booking.metadata?.date || booking.metadata?.session_date || formatDateLocal(new Date(booking.created_at));
}

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const [previousBookings, setPreviousBookings] = useState<Booking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, filterType, filterStatus]);

  useEffect(() => {
      const timeoutId = setTimeout(() => {
          if (currentPage === 1) fetchBookings();
          else setCurrentPage(1); 
      }, 500);
      return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.list({
          page: currentPage,
          limit: pageSize,
          type: filterType === 'all' ? undefined : filterType,
          status: filterStatus === 'all' ? undefined : filterStatus,
          search: searchQuery || undefined
      });
      setBookings(res.data.data || []);
      if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalBookings(res.data.pagination.total || 0);
      }
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (selectedBooking) {
          loadHistory(selectedBooking.user_email);
      } else {
          setPreviousBookings([]);
      }
  }, [selectedBooking]);

  const loadHistory = async (email: string) => {
      setHistoryLoading(true);
      try {
          const res = await bookingService.history(email);
          setPreviousBookings(res.data.data?.filter((b: any) => b.id !== selectedBooking?.id) || []);
      } catch (e) {
          console.error(e);
      } finally {
          setHistoryLoading(false);
      }
  };

  const stats = useMemo(() => {
    return {
      total: totalBookings,
      pending: bookings.filter((booking) => booking.payment_status === 'submitted' || booking.payment_status === 'pending').length,
      paid: bookings.filter((booking) => booking.payment_status === 'verified' || booking.payment_status === 'paid').length,
      yoga: bookings.filter((booking) => booking.booking_type === 'yoga').length,
      upcoming: bookings.filter((booking) => booking.booking_type === 'upcoming').length,
      retreat: bookings.filter((booking) => booking.booking_type === 'retreat').length,
    };
  }, [bookings, totalBookings]);

  return (
    <div className="min-h-screen bg-[#faf8f6] p-8 pb-24">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-[#4a3b32] md:text-5xl">
            Booking <span className="font-serif italic text-[#bc6746]">Manager</span>
          </h1>
          <p className="mt-2 text-[#4a3b32]/60">View bookings, payment status, and customer history in one place.</p>
        </div>

        <button
          onClick={fetchBookings}
          className="group flex items-center space-x-2 rounded-full border border-[#bc6746]/20 bg-white px-6 py-3 text-[#bc6746] shadow-sm transition-all hover:bg-[#bc6746] hover:text-white"
        >
          <RefreshCw className={cn('h-4 w-4 transition-transform group-hover:rotate-180', loading && 'animate-spin')} />
          <span className="text-sm font-medium">Refresh Data</span>
        </button>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending Payment', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Yoga Bookings', value: stats.yoga, icon: Tag, color: 'text-[#bc6746]', bg: 'bg-[#bc6746]/10' },
          { label: 'Events / Retreats', value: stats.upcoming + stats.retreat, icon: Calendar, color: 'text-stone-600', bg: 'bg-stone-100' },
          { label: 'Total Volume', value: formatCurrencyLabel(bookings.reduce((acc, curr) => acc + curr.total_amount, 0)), icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, index) => (
          <GlassCard key={index} className="p-6">
            <div className="flex items-center space-x-4">
              <div className={cn('rounded-2xl p-3', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#4a3b32]/60">{stat.label}</p>
                <p className="text-2xl font-bold text-[#4a3b32]">{stat.value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mb-8 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a3b32]/40" />
            <input
              type="text"
              placeholder="Search user, email or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border-none bg-[#fdfaf8] py-3 pl-11 pr-6 text-sm text-[#4a3b32] placeholder-[#4a3b32]/30 ring-1 ring-[#bc6746]/10 transition-shadow outline-none focus:ring-2 focus:ring-[#bc6746]/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 rounded-full border border-[#bc6746]/10 bg-[#fdfaf8] px-4 py-1">
              <Filter className="h-3 w-3 text-[#bc6746]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#4a3b32] outline-none"
              >
                <option value="all">All Types</option>
                <option value="yoga">Online Yoga</option>
                <option value="upcoming">Events</option>
                <option value="retreat">Retreats</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 rounded-full border border-[#bc6746]/10 bg-[#fdfaf8] px-4 py-1">
              <span className="text-[10px] uppercase tracking-wider text-[#4a3b32]/40">Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#4a3b32] outline-none"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      <AdminTable
        data={bookings}
        isLoading={loading}
        columns={[
          {
            header: 'Date',
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#4a3b32]">{getBookingDate(item)}</span>
                <span className="text-[10px] uppercase tracking-tighter text-[#a55a3d]/50">
                  {item.metadata?.time || 'Time TBD'}
                </span>
              </div>
            ),
          },
          {
            header: 'Type',
            accessor: (item) => (
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest',
                  item.booking_type === 'yoga'
                    ? 'border-amber-200 bg-amber-100 text-amber-700'
                    : item.booking_type === 'upcoming'
                      ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                      : 'border-purple-200 bg-purple-100 text-purple-700'
                )}
              >
                {item.booking_type}
              </span>
            ),
          },
          {
            header: 'User',
            accessor: (item) => (
              <div className="flex max-w-[200px] flex-col">
                <span className="truncate font-bold uppercase tracking-tight text-[#4a3b32]">{item.user_name}</span>
                <span className="truncate text-[10px] lowercase tracking-wider text-[#bc6746] opacity-60">{item.user_email}</span>
              </div>
            ),
          },
          {
            header: 'Amount',
            accessor: (item) => <span className="text-sm font-black text-[#bc6746]">{formatCurrencyLabel(item.total_amount)}</span>,
          },
          {
            header: 'Payment Status',
            accessor: (item) => {
              return (
              <div
                className={cn(
                  'flex min-w-[100px] items-center justify-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest',
                  'border-emerald-200 bg-emerald-50 text-emerald-600'
                )}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                paid
              </div>
            )},
          },
          {
            header: 'Actions',
            className: 'text-right',
            accessor: (item) => (
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setSelectedBooking(item)}
                  className="rounded-xl border border-[#f1e4da] bg-white p-2 text-[#bc6746] shadow-sm transition-all hover:bg-[#bc6746] hover:text-white active:scale-95"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        onRowClick={(item) => setSelectedBooking(item)}
      />

      {bookings.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#4a3b32]/60">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalBookings)} of {totalBookings} bookings
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 rounded-full border border-[#f1e4da] bg-white px-3 py-1">
              <span className="text-[10px] uppercase tracking-wider text-[#4a3b32]/40">Per Page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-medium text-[#4a3b32] outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-2 rounded-full border border-[#f1e4da] bg-white px-4 py-2 text-sm text-[#4a3b32] transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="rounded-full border border-[#f1e4da] bg-white px-4 py-2 text-sm font-medium text-[#4a3b32]">
                Page {currentPage} of {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-2 rounded-full border border-[#f1e4da] bg-white px-4 py-2 text-sm text-[#4a3b32] transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md sm:p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[40px] border border-[#f1e4da] bg-[#fffdf8] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#f1e4da] bg-[#bc6746]/5 p-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#bc6746]">Booking Details</h4>
                <button onClick={() => setSelectedBooking(null)} className="rounded-full p-2 text-[#bc6746] transition-colors hover:bg-[#bc6746]/10">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div data-lenis-prevent className="custom-scrollbar max-h-[75vh] space-y-6 overflow-y-auto p-8">
                <div className="flex items-center space-x-4 rounded-3xl border border-[#f1e4da] bg-white p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#bc6746]/10 text-[#bc6746]">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-[#4a3b32]">{selectedBooking.user_name}</h3>
                    <p className="text-[10px] font-medium text-[#a55a3d]/60">{selectedBooking.user_email}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-[#f1e4da] bg-white p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Current Booking</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Type</p>
                      <p className="mt-1 text-[#4a3b32]">{selectedBooking.metadata?.type_label || selectedBooking.booking_type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Item</p>
                      <p className="mt-1 text-[#4a3b32]">{getBookingTitle(selectedBooking)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Date</p>
                      <p className="mt-1 text-[#4a3b32]">{getBookingDate(selectedBooking)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Time</p>
                      <p className="mt-1 text-[#4a3b32]">{selectedBooking.metadata?.time || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Reference</span>
                    <span className="rounded-md bg-[#bc6746]/5 px-2 py-1 font-mono text-[10px] font-bold text-[#bc6746]">
                      {selectedBooking.payment_reference || 'Not available'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Payment Status</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]">
                      PAID
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Booking Status</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]">CONFIRMED</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f1e4da]/50 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Total Amount</span>
                    <span className="text-xl font-black text-[#bc6746]">{formatCurrencyLabel(selectedBooking.total_amount)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">
                    Previous Bookings ({previousBookings.length})
                  </p>

                  {historyLoading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="animate-pulse rounded-3xl border border-[#f1e4da] bg-white p-5 h-24" />
                        ))}
                    </div>
                  ) : previousBookings.length > 0 ? (
                    <div className="space-y-3">
                      {previousBookings.map((booking) => (
                        <div key={booking.id} className="rounded-3xl border border-[#f1e4da] bg-white p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-[#4a3b32]">{getBookingTitle(booking)}</p>
                              <p className="mt-1 text-[11px] text-[#a55a3d]/70">
                                {booking.metadata?.type_label || booking.booking_type} • {getBookingDate(booking)}
                                {booking.metadata?.time ? ` • ${booking.metadata.time}` : ''}
                              </p>
                            </div>
                            <span className="rounded-full bg-[#bc6746]/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#bc6746]">
                              PAID
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-[#4a3b32]/70">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Amount</p>
                              <p className="mt-1">{formatCurrencyLabel(booking.total_amount)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Booked On</p>
                              <p className="mt-1">{new Date(booking.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Booking Status</p>
                              <p className="mt-1">CONFIRMED</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a3b32]/40">Reference</p>
                              <p className="mt-1 break-all">{booking.payment_reference || 'Not available'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-[#f1e4da] bg-white/60 px-6 py-8 text-center">
                      <p className="text-sm text-[#4a3b32]/50">No previous bookings found for this user.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
