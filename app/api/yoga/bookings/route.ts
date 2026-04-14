import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/yoga/bookings
 * Protected: Admin only to list all user bookings.
 */
async function getHandler() {
  try {
    const { data, error } = await supabaseAdmin
      .from('yoga_bookings')
      .select('*, yoga_sessions(*, yoga_offerings(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Yoga bookings fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch bookings', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/yoga/bookings
 * Public: User submission for booking a session.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        session_id, 
        user_name, 
        user_email, 
        user_phone, 
        booking_type, 
        package_size, 
        total_amount, 
        base_amount,
        gst_amount,
        payment_reference, 
        payment_screenshot_url 
    } = body;

    // 1. Fetch the session details to check capacity and date
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('yoga_sessions')
      .select('*, yoga_offerings(*)')
      .eq('id', session_id)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Strict Availability Validations
    const now = new Date();
    const sessionStart = new Date(`${session.session_date}T${session.start_time}`);
    const sessionEnd = new Date(sessionStart.getTime() + (session.duration_minutes || 60) * 60000);
    const cooldownStart = new Date(sessionStart.getTime() - (session.cooldown_minutes || 30) * 60000);

    if (session.is_blocked || session.status === 'cancelled') {
      return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 400 });
    }

    // Completion Check
    if (now > sessionEnd || session.status === 'completed') {
        return NextResponse.json({ error: 'This session has already ended.' }, { status: 400 });
    }

    // Capacity Check
    if (session.booked_count >= session.capacity) {
      return NextResponse.json({ error: 'This session is already full.' }, { status: 400 });
    }

    // Cooldown/Booking Window Check
    if (now > cooldownStart) {
        return NextResponse.json({ 
            error: `Bookings for this session closed at ${cooldownStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` 
        }, { status: 400 });
    }

    // 3. Check if the date is blocked (availability exception)
    const { data: blockedDate } = await supabaseAdmin
      .from('yoga_availability_exceptions')
      .select('id')
      .eq('exception_date', session.session_date)
      .eq('is_blocked', true)
      .single();

    if (blockedDate) {
      return NextResponse.json({ error: 'This date is currently unavailable for bookings.' }, { status: 400 });
    }

    // 4. Create the booking record
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from('yoga_bookings')
      .insert({ 
        session_id, 
        user_name, 
        user_email, 
        user_phone, 
        booking_type, 
        package_size, 
        total_amount: typeof total_amount === 'number' ? Number(total_amount.toFixed(2)) : total_amount, 
        base_amount: typeof base_amount === 'number' ? Number(base_amount.toFixed(2)) : base_amount,
        gst_amount: typeof gst_amount === 'number' ? Number(gst_amount.toFixed(2)) : gst_amount,
        payment_reference, 
        payment_screenshot_url,
        booking_status: 'pending', 
        payment_status: 'submitted' 
      })
      .select()
      .single();

    if (bookingErr) throw bookingErr;

    // 5. Atomic increment of booked_count
    await supabaseAdmin
      .from('yoga_sessions')
      .update({ booked_count: (session.booked_count || 0) + 1 })
      .eq('id', session_id);

    return NextResponse.json({ success: true, data: booking });
  } catch (err: any) {
    console.error('Yoga booking creation error:', err);
    return NextResponse.json({ error: 'Failed to process booking', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
