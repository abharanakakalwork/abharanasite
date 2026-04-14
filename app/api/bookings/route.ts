import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/bookings
 * Returns all bookings across all modules, sorted by creation date.
 * Merges legacy yoga_bookings for full historical visibility.
 */
async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // 1. Fetch from unified bookings
    let unifiedQuery = supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      unifiedQuery = unifiedQuery.eq('booking_type', type);
    }
    if (status && status !== 'all') {
      unifiedQuery = unifiedQuery.eq('payment_status', status);
    }

    const { data: unifiedData, error: unifiedError } = await unifiedQuery;
    if (unifiedError) throw unifiedError;

    // 2. Fetch from legacy yoga_bookings if type is 'all' or 'yoga'
    let legacyYogaData: any[] = [];
    if (!type || type === 'all' || type === 'yoga') {
        let legacyQuery = supabaseAdmin
            .from('yoga_bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (status && status !== 'all') {
            legacyQuery = legacyQuery.eq('payment_status', status);
        }

        const { data, error } = await legacyQuery;
        if (!error && data) {
            legacyYogaData = data.map(b => ({
                ...b,
                booking_type: 'yoga',
                reference_id: b.session_id,
                amount: b.base_amount,
                is_legacy: true 
            }));
        }
    }

    // 3. Merge and Sort
    const allBookings = [...(unifiedData || []), ...legacyYogaData].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ success: true, data: allBookings });
  } catch (err: any) {
    console.error('[Bookings List Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch bookings', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/bookings (Unified Creation)
 */
export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { 
          booking_type,
          reference_id,
          user_name, 
          user_email, 
          user_phone, 
          amount, 
          gst_amount, 
          total_amount, 
          payment_reference, 
          payment_screenshot_url,
          metadata 
      } = body;
  
      if (!booking_type || !reference_id || !user_email) {
        return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
      }

      if (booking_type === 'yoga') {
        const session_id = reference_id;

        const { data: session, error: sessionErr } = await supabaseAdmin
          .from('yoga_sessions')
          .select('*, yoga_offerings(*)')
          .eq('id', session_id)
          .single();

        if (sessionErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        const now = new Date();
        const sessionStart = new Date(`${session.session_date}T${session.start_time}`);
        const sessionEnd = new Date(sessionStart.getTime() + (session.duration_minutes || 60) * 60000);
        const cooldownStart = new Date(sessionStart.getTime() - (session.cooldown_minutes || 30) * 60000);

        if (session.is_blocked || session.status === 'cancelled') return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 400 });
        if (now > sessionEnd || session.status === 'completed') return NextResponse.json({ error: 'This session has already ended.' }, { status: 400 });
        if (session.booked_count >= session.capacity) return NextResponse.json({ error: 'This session is already full.' }, { status: 400 });
        if (now > cooldownStart) return NextResponse.json({ error: `Bookings for this session closed at ${cooldownStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` }, { status: 400 });

        const { data: blockedDate } = await supabaseAdmin
          .from('yoga_availability_exceptions')
          .select('id')
          .eq('exception_date', session.session_date)
          .eq('is_blocked', true)
          .single();

        if (blockedDate) return NextResponse.json({ error: 'This date is currently unavailable for bookings.' }, { status: 400 });
      }
  
      const { data: booking, error } = await supabaseAdmin
        .from('bookings')
        .insert({
          booking_type,
          reference_id,
          user_name,
          user_email,
          user_phone,
          amount: typeof amount === 'number' ? Number(amount.toFixed(2)) : amount,
          gst_amount: typeof gst_amount === 'number' ? Number(gst_amount.toFixed(2)) : gst_amount,
          total_amount: typeof total_amount === 'number' ? Number(total_amount.toFixed(2)) : total_amount,
          payment_reference,
          payment_screenshot_url,
          metadata,
          payment_status: payment_reference ? 'submitted' : 'pending',
          booking_status: 'pending'
        })
        .select()
        .single();
  
      if (error) throw error;

      if (booking_type === 'yoga') {
          const { data: session } = await supabaseAdmin.from('yoga_sessions').select('booked_count').eq('id', reference_id).single();
          await supabaseAdmin.from('yoga_sessions').update({ booked_count: (session?.booked_count || 0) + 1 }).eq('id', reference_id);
      }
  
      return NextResponse.json({ success: true, data: booking });
    } catch (err: any) {
      console.error('[Unified Booking Create Error]:', err);
      return NextResponse.json({ error: 'Failed to create booking', details: err.message }, { status: 500 });
    }
}

export const GET = withAuth(getHandler);
