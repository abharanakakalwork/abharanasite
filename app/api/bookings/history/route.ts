import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/bookings/history
 * Fetches user's previous bookings by email across both bookings and yoga_bookings tables
 */
async function getHistoryHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // 1. Fetch from unified bookings
    const { data: unifiedData, error: unifiedError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (unifiedError) throw unifiedError;

    // 2. Fetch from legacy yoga_bookings
    const { data: legacyData, error: legacyError } = await supabaseAdmin
      .from('yoga_bookings')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (legacyError) throw legacyError;

    // Transform legacy data to match unified format roughly for UI display
    const formattedLegacy = (legacyData || []).map(b => ({
      ...b,
      booking_type: 'yoga',
      reference_id: b.session_id,
      amount: b.base_amount,
      is_legacy: true 
    }));

    // 3. Merge and Sort
    const allBookings = [...(unifiedData || []), ...formattedLegacy].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ success: true, data: allBookings });
  } catch (err: any) {
    console.error('[Bookings History Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch booking history', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(getHistoryHandler);
