import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/dashboard/stats
 * Protected route to fetch overall counts and chart data.
 */
async function handler(req: NextRequest, { admin }: any) {
  try {
    // 1. Get Enquiries Count
    const { count: enquiriesCount } = await supabaseAdmin
      .from('enquiries')
      .select('*', { count: 'exact', head: true });

    // 2. Get Bookings Count
    const { count: bookingsCount } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // 3. Get Revenue
    const { data: revenueData } = await supabaseAdmin
      .from('bookings')
      .select('total_amount, payment_status')
      .in('payment_status', ['paid', 'verified']);
      
    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

    // 4. Chart Data: last 7 days of bookings
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartMap = new Map();
    // Initialize last 7 days to guarantee order
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chartMap.set(days[d.getDay()], 0);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: recentBookings } = await supabaseAdmin
      .from('bookings')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    recentBookings?.forEach(b => {
      const dayName = days[new Date(b.created_at).getDay()];
      if (chartMap.has(dayName)) {
        chartMap.set(dayName, chartMap.get(dayName) + 1);
      }
    });

    const chartData = Array.from(chartMap.entries()).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      success: true,
      data: {
        enquiries_count: enquiriesCount || 0,
        bookings_count: bookingsCount || 0,
        revenue: totalRevenue,
        chartData: chartData
      },
    });
  } catch (err: any) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(handler);
