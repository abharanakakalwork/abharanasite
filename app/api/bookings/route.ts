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
    const search = searchParams.get('search');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Setup base queries for Counting
    let modernCountQuery = supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true });
    let legacyCountQuery = supabaseAdmin.from('yoga_bookings').select('*', { count: 'exact', head: true });

    // Apply filters to modern
    if (type && type !== 'all') modernCountQuery = modernCountQuery.eq('booking_type', type);
    if (status && status !== 'all') modernCountQuery = modernCountQuery.eq('payment_status', status);
    if (search) {
      modernCountQuery = modernCountQuery.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%,payment_reference.ilike.%${search}%`);
    }

    // Apply filters to legacy
    if (type && type !== 'all' && type !== 'yoga') {
       // Legacy is only 'yoga'
       legacyCountQuery = legacyCountQuery.eq('id', 'impossible_id'); // zero results
    } else {
        if (status && status !== 'all') legacyCountQuery = legacyCountQuery.eq('payment_status', status);
        if (search) {
            legacyCountQuery = legacyCountQuery.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%,payment_reference.ilike.%${search}%`);
        }
    }

    // Get Counts
    const [{ count: modernCount, error: mErr }, { count: legacyCount, error: lErr }] = await Promise.all([
        modernCountQuery,
        legacyCountQuery
    ]);

    if (mErr) throw mErr;
    if (lErr) throw lErr;

    const N1 = modernCount || 0;
    const N2 = legacyCount || 0;
    const total = N1 + N2;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    let results: any[] = [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // Fetch from modern if overlap
    if (startIndex < N1) {
       let mQuery = supabaseAdmin.from('bookings').select('*').order('created_at', { ascending: false });
       if (type && type !== 'all') mQuery = mQuery.eq('booking_type', type);
       if (status && status !== 'all') mQuery = mQuery.eq('payment_status', status);
       if (search) mQuery = mQuery.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%,payment_reference.ilike.%${search}%`);
       
       mQuery = mQuery.range(startIndex, Math.min(endIndex, N1 - 1));
       const { data } = await mQuery;
       if (data) results = results.concat(data);
    }

    // Fetch from legacy if overlap
    if (endIndex >= N1) {
       const legacyStart = Math.max(0, startIndex - N1);
       const legacyEnd = endIndex - N1;

       if ((!type || type === 'all' || type === 'yoga')) {
           let lQuery = supabaseAdmin.from('yoga_bookings').select('*').order('created_at', { ascending: false });
           if (status && status !== 'all') lQuery = lQuery.eq('payment_status', status);
           if (search) lQuery = lQuery.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%,payment_reference.ilike.%${search}%`);
           
           lQuery = lQuery.range(legacyStart, legacyEnd);
           const { data } = await lQuery;
           if (data) {
               results = results.concat(data.map((b: any) => ({
                   ...b,
                   booking_type: 'yoga',
                   reference_id: b.session_id,
                   amount: b.base_amount,
                   is_legacy: true 
               })));
           }
       }
    }

    return NextResponse.json({ 
        success: true, 
        data: results,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    });
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
