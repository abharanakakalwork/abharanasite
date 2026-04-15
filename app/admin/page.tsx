'use client';

import React, { useEffect, useState, memo } from 'react';
import { GlassCard } from '@/components/admin/GlassCard';
import { dashboardService, enquiryService, bookingService } from '@/lib/api/client';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  Clock,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Memoized Chart component to isolate re-renders
const ActivityChart = memo(function ActivityChart({ data }: { data: any[] }) {
  return (
    <div className="h-80 w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#bc6746" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#bc6746" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4da" />
          <XAxis 
            dataKey="name" 
            stroke="#a55a3d" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '12px', 
              border: '1px solid #f1e4da',
              backdropFilter: 'blur(10px)',
              color: '#4a3b32'
            }} 
            itemStyle={{ color: '#bc6746' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#bc6746" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, enquiriesRes, bookingsRes] = await Promise.all([
          dashboardService.stats(),
          enquiryService.list(),
          bookingService.list({ limit: 5 })
        ]);
        setStats(statsRes.data.data);
        setRecentEnquiries(enquiriesRes.data.data.slice(0, 5));
        setRecentBookings(bookingsRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded-full bg-[#bc6746]/20 shadow-2xl shadow-[#bc6746]/10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-[#4a3b32]">Dashboard</h1>
          <p className="mt-2 text-[#a55a3d]/70">See the latest activity and quick stats.</p>
        </motion.div>
        
        <div className="flex items-center space-x-3 text-sm text-[#a55a3d]/50">
          <Clock className="h-4 w-4" />
          <span>Last sync: Just now</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <GlassCard delay={0.1}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#a55a3d]/70 uppercase tracking-widest">Enquiries</p>
              <h3 className="mt-2 text-4xl font-bold text-[#4a3b32]">{stats?.enquiries_count || 0}</h3>
              <p className="mt-2 text-xs text-[#bc6746]/70 flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>Total messages received</span>
              </p>
            </div>
            <div className="rounded-xl bg-[#bc6746]/10 p-3 text-[#bc6746] ring-1 ring-[#bc6746]/10">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#a55a3d]/70 uppercase tracking-widest">Total Bookings</p>
              <h3 className="mt-2 text-4xl font-bold text-[#4a3b32]">{stats?.bookings_count || 0}</h3>
              <p className="mt-2 text-xs text-[#bc6746]/70 flex items-center">
                <CreditCard className="h-3 w-3 mr-1" />
                <span>Across all sessions</span>
              </p>
            </div>
            <div className="rounded-xl bg-[#bc6746]/10 p-3 text-[#bc6746] ring-1 ring-[#bc6746]/10">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#a55a3d]/70 uppercase tracking-widest">Revenue</p>
              <h3 className="mt-2 text-4xl font-bold text-[#4a3b32]">
                 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats?.revenue || 0)}
              </h3>
              <p className="mt-2 text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Total verified metrics</span>
              </p>
            </div>
            <div className="rounded-xl bg-[#bc6746]/10 p-3 text-[#bc6746] ring-1 ring-[#bc6746]/10">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Activity Chart */}
        <div className="lg:col-span-2">
          <GlassCard noPadding delay={0.4} className="h-full">
            <div className="p-6 pb-0">
              <h3 className="text-lg font-bold text-[#4a3b32]">Bookings Activity</h3>
              <p className="text-xs text-[#a55a3d]/50 mt-1">Confirmed transactions over the last 7 days</p>
            </div>
            <ActivityChart data={stats?.chartData || []} />
          </GlassCard>
        </div>

        {/* Recent Bookings */}
        <GlassCard delay={0.5} className="flex flex-col h-[500px] overflow-hidden">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <div className="h-8 w-1 border-r border-[#bc6746] rounded-full" />
               <h3 className="text-xl font-bold text-[#4a3b32] tracking-tight">Recent Bookings</h3>
            </div>
            <Link 
              href="/admin/bookings" 
              className="text-xs font-black uppercase tracking-widest text-[#bc6746] hover:text-[#a55a3d] transition-colors flex items-center group"
            >
              View All 
              <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div 
            className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar"
            data-lenis-prevent
            style={{ touchAction: 'pan-y' }}
          >
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, i) => (
                <div 
                  key={booking.id}
                  className="group relative p-4 rounded-2xl border border-[#f1e4da]/50 bg-white/50 backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg shadow-[#bc6746]/5 border-l-4 border-l-emerald-500/50 hover:border-l-emerald-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#4a3b32] truncate uppercase tracking-tight">{booking.user_name}</h4>
                      <p className="text-[10px] text-[#a55a3d]/60 font-medium truncate">{booking.user_email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> PAID
                    </span>
                  </div>
                  
                  <div className="relative mt-2 p-3 rounded-xl bg-[#fcf9f2]/50 border border-[#f1e4da]/30 flex justify-between items-center text-[11px] text-[#4a3b32]/80 leading-relaxed">
                    <span className="font-bold uppercase text-[#bc6746]">{booking.booking_type}</span>
                    <span className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(booking.total_amount)}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <span className="text-[9px] font-bold text-[#a55a3d]/30 uppercase tracking-tighter">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                 <div className="h-12 w-12 rounded-full bg-[#f1e4da]/30 flex items-center justify-center text-[#bc6746]/20 mb-4">
                    <CreditCard className="h-6 w-6" />
                 </div>
                 <p className="text-xs text-[#a55a3d]/50 italic">No recent bookings found.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recent Enquiries */}
        <GlassCard delay={0.6} className="flex flex-col h-[500px] overflow-hidden">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <div className="h-8 w-1 border-r border-[#bc6746] rounded-full" />
               <h3 className="text-xl font-bold text-[#4a3b32] tracking-tight">Recent Messages</h3>
            </div>
            <Link 
              href="/admin/enquiries" 
              className="text-xs font-black uppercase tracking-widest text-[#bc6746] hover:text-[#a55a3d] transition-colors flex items-center group"
            >
              View All 
              <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div 
            className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar"
            data-lenis-prevent
            style={{ touchAction: 'pan-y' }}
          >
            {recentEnquiries.length > 0 ? (
              recentEnquiries.map((enquiry, i) => (
                <Link 
                  key={enquiry.id}
                  href={`/admin/enquiries?id=${enquiry.id}`}
                  className="block"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="group relative p-4 rounded-2xl border border-[#f1e4da]/50 bg-white/50 backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg shadow-[#bc6746]/5 border-l-4 border-l-[#bc6746]/20 hover:border-l-[#bc6746] cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#4a3b32] truncate uppercase tracking-tight">{enquiry.name}</h4>
                        <p className="text-[10px] text-[#a55a3d]/60 font-medium truncate">{enquiry.email}</p>
                      </div>
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${enquiry.status === 'pending' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-green-400'}`} />
                    </div>
                    
                    <div className="relative mt-2 p-3 rounded-xl bg-[#fcf9f2]/50 border border-[#f1e4da]/30 italic text-[11px] text-[#4a3b32]/80 leading-relaxed line-clamp-2">
                      "{enquiry.message}"
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                      <span className="text-[9px] font-bold text-[#a55a3d]/30 uppercase tracking-tighter">
                        {new Date(enquiry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                 <div className="h-12 w-12 rounded-full bg-[#f1e4da]/30 flex items-center justify-center text-[#bc6746]/20 mb-4">
                    <MessageSquare className="h-6 w-6" />
                 </div>
                 <p className="text-xs text-[#a55a3d]/50 italic">No recent enquiries found.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
