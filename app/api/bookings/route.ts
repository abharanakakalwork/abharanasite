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
    let modernCountQuery = supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).neq('booking_type', 'course');
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

    // --- Global Category-wise Summary (for dashboard cards) ---
    const getSummaryQuery = (bTable: 'bookings' | 'yoga_bookings', bType?: string) => {
        let q = supabaseAdmin.from(bTable).select('*', { count: 'exact', head: true });
        if (bTable === 'bookings' && bType) {
            if (bType === 'yoga') q = q.or('booking_type.eq.yoga,booking_type.eq.yoga_monthly');
            else q = q.eq('booking_type', bType);
        }
        if (status && status !== 'all') q = q.eq('payment_status', status);
        if (search) q = q.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%,payment_reference.ilike.%${search}%`);
        return q;
    };

    const [
        { count: sYogaModern },
        { count: sYogaLegacy },
        { count: sCourseCount },
        { count: sUpcoming },
        { count: sRetreat },
        { count: sPending }
    ] = await Promise.all([
        getSummaryQuery('bookings', 'yoga'),
        getSummaryQuery('yoga_bookings'),
        (() => {
            let q = supabaseAdmin.from('course_enrollments').select('*', { count: 'exact', head: true });
            if (status && status !== 'all') q = q.eq('status', status);
            // Search filter for courses via student join
            if (search) {
                // Since Supabase doesn't support easy 'or' across joins in HEAD queries without full select, 
                // we'll filter by student_id if students match search
                q = q.filter('student_id', 'in', 
                    supabaseAdmin.from('students').select('id').or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
                );
            }
            return q;
        })(),
        getSummaryQuery('bookings', 'upcoming'),
        getSummaryQuery('bookings', 'retreat'),
        supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).in('payment_status', ['pending', 'submitted'])
    ]);

    const summary = {
        yoga: (sYogaModern || 0) + (sYogaLegacy || 0),
        course: sCourseCount || 0,
        upcoming: sUpcoming || 0,
        retreat: sRetreat || 0,
        pending: sPending || 0
    };

    const N1 = modernCount || 0;
    const N2 = sYogaLegacy || 0; // Legacy yoga count
    const N3 = sCourseCount || 0; // Total courses from enrollment table
    const N4 = sUpcoming || 0;
    const N5 = sRetreat || 0;

    // The listing logic should merge T1 (modern), T2 (courses), T3 (legacy)
    // Actually, since we want to support 'type' filter:
    let total = N1 + N3 + N2; // Unified total across all relevant sources
    if (type === 'yoga') total = (sYogaModern || 0) + (sYogaLegacy || 0);
    if (type === 'course') total = (sCourseCount || 0);
    if (type === 'upcoming') total = (sUpcoming || 0);
    if (type === 'retreat') total = (sRetreat || 0);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    let results: any[] = [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // Helper to determine if we need to fetch from a source
    // Segment mapping: 0..N1-1 (Modern), N1..N1+N3-1 (Courses), N1+N3..end (Legacy)
    
    // 1. Fetch from Modern (if applicable)
    if (type === 'all' || (type !== 'course' && type !== 'yoga')) {
        const t1Start = Math.max(0, startIndex);
        const t1End = Math.min(endIndex, N1 - 1);
        if (t1Start <= t1End) {
            let q = supabaseAdmin.from('bookings').select('*').order('created_at', { ascending: false }).neq('booking_type', 'course');
            if (status && status !== 'all') q = q.eq('payment_status', status);
            if (search) q = q.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%`);
            const { data } = await q.range(t1Start, t1End);
            if (data) results = results.concat(data);
        }
    } else if (type === 'yoga') {
        const t1Start = Math.max(0, startIndex);
        const t1End = Math.min(endIndex, (sYogaModern || 0) - 1);
        if (t1Start <= t1End) {
            let q = supabaseAdmin.from('bookings').select('*').order('created_at', { ascending: false }).or('booking_type.eq.yoga,booking_type.eq.yoga_monthly');
            if (status && status !== 'all') q = q.eq('payment_status', status);
            if (search) q = q.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%`);
            const { data } = await q.range(t1Start, t1End);
            if (data) results = results.concat(data);
        }
    }

    // 2. Fetch from Courses (if applicable)
    if (type === 'all' || type === 'course') {
        let fetchStart = 0;
        let fetchEnd = 0;
        
        if (type === 'course') {
            fetchStart = startIndex;
            fetchEnd = endIndex;
        } else {
            // Segment offset
            fetchStart = Math.max(0, startIndex - N1);
            fetchEnd = Math.min(endIndex - N1, N3 - 1);
        }

        if (fetchStart <= fetchEnd) {
            let q = supabaseAdmin.from('course_enrollments')
                .select('*, students(full_name, email), courses(title)')
                .order('created_at', { ascending: false });
            
            if (status && status !== 'all') q = q.eq('status', status);
            
            if (search) {
                const { data: midStudents } = await supabaseAdmin.from('students').select('id').or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
                const studentIds = midStudents?.map(s => s.id) || [];
                if (studentIds.length > 0) {
                    q = q.in('student_id', studentIds);
                } else {
                    q = q.eq('id', '00000000-0000-0000-0000-000000000000'); // Force empty
                }
            }
            
            const { data } = await q.range(fetchStart, fetchEnd);

            if (data) {
                results = results.concat(data.map((ce: any) => ({
                    id: ce.id,
                    booking_type: 'course',
                    reference_id: ce.course_id,
                    user_name: ce.students?.full_name || 'Student',
                    user_email: ce.students?.email || 'Email missing',
                    total_amount: ce.amount,
                    payment_status: ce.status,
                    payment_reference: ce.payment_id,
                    booking_status: 'confirmed',
                    created_at: ce.created_at,
                    metadata: {
                        item_title: ce.courses?.title || 'Unknown Course',
                        type_label: 'Course Enrollment',
                        course_id: ce.course_id
                    }
                })));
            }
        }
    }

    // 3. Fetch from Legacy Yoga (if applicable)
    if (type === 'all' || type === 'yoga') {
        let fetchStart = 0;
        let fetchEnd = 0;

        if (type === 'yoga') {
            const offset = (sYogaModern || 0);
            fetchStart = Math.max(0, startIndex - offset);
            fetchEnd = endIndex - offset;
        } else {
            const offset = N1 + N3;
            fetchStart = Math.max(0, startIndex - offset);
            fetchEnd = endIndex - offset;
        }

        if (fetchStart <= fetchEnd && fetchStart < N2) {
            let lQuery = supabaseAdmin.from('yoga_bookings').select('*').order('created_at', { ascending: false });
            if (status && status !== 'all') lQuery = lQuery.eq('payment_status', status);
            if (search) lQuery = lQuery.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%,payment_reference.ilike.%${search}%`);
            
            const { data } = await lQuery.range(fetchStart, fetchEnd);
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
        },
        summary
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

      if (booking_type === 'yoga_monthly') {
          const offering_id = reference_id;
          const { data: offering, error: offErr } = await supabaseAdmin
            .from('yoga_offerings')
            .select('id, monthly_price')
            .eq('id', offering_id)
            .single();
          
          if (offErr || !offering) return NextResponse.json({ error: 'Monthly offering not found' }, { status: 404 });
          if (!offering.monthly_price || offering.monthly_price <= 0) {
              return NextResponse.json({ error: 'Monthly subscription is not available for this practice.' }, { status: 400 });
          }
      }

      if (booking_type === 'course') {
        const { data: course, error: cErr } = await supabaseAdmin
          .from('courses')
          .select('id')
          .eq('id', reference_id)
          .single();
        
        if (cErr || !course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
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
