import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/yoga/sessions
 * Public: List available yoga sessions (optionally filtered by offering_id).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const offeringId = url.searchParams.get('offering_id');

    // Fetch sessions
    let sessionQuery = supabaseAdmin
      .from('yoga_sessions')
      .select('*, yoga_offerings(*)')
      .eq('is_active', true)
      // We don't filter is_blocked here for Admin, but we do for Public
      .gte('session_date', new Date().toISOString().split('T')[0])
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (offeringId) {
      sessionQuery = sessionQuery.eq('offering_id', offeringId);
    }

    const { data: sessions, error: sessionError } = await sessionQuery;
    if (sessionError) throw sessionError;

    const now = new Date();
    
    // Process and Filter sessions
    const processedSessions = sessions.map(s => {
        const sessionStart = new Date(`${s.session_date}T${s.start_time}`);
        const sessionEnd = new Date(sessionStart.getTime() + (s.duration_minutes || 60) * 60000);
        const cooldownStart = new Date(sessionStart.getTime() - (s.cooldown_minutes || 30) * 60000);
        
        let status = s.status || 'scheduled';
        
        // Auto-completion logic
        if (now > sessionEnd) {
            status = 'completed';
        } else if (s.booked_count >= s.capacity) {
            status = 'full';
        } else if (now > cooldownStart) {
            status = 'booking_closed';
        }

        return { ...s, calculated_status: status, is_in_cooldown: now > cooldownStart };
    });

    // Client-side filtering: Hide completed, blocked, or sessions in cooldown
    const isAdmin = req.headers.get('Authorization')?.includes('Bearer');
    const filteredSessions = processedSessions.filter(s => {
        if (isAdmin) return true; // Admins see everything
        
        return (
            !s.is_blocked && 
            s.calculated_status !== 'completed' && 
            s.calculated_status !== 'booking_closed' &&
            s.calculated_status !== 'full'
        );
    });

    // Fetch availability exceptions (blocked dates)
    const { data: exceptions, error: exceptionError } = await supabaseAdmin
      .from('yoga_availability_exceptions')
      .select('*')
      .gte('exception_date', new Date().toISOString().split('T')[0]);

    if (exceptionError) throw exceptionError;

    return NextResponse.json({ 
      success: true, 
      data: {
        sessions: filteredSessions,
        exceptions
      }
    });
  } catch (err: any) {
    console.error('Yoga sessions fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch sessions', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/yoga/sessions
 * Protected: Admin only to create a new session slot.
 */
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { offering_id, session_date, start_time, capacity, meeting_link } = body;

    // 1. Check if the date is blocked
    const { data: blockedDate } = await supabaseAdmin
      .from('yoga_availability_exceptions')
      .select('id')
      .eq('exception_date', session_date)
      .eq('is_blocked', true)
      .single();

    if (blockedDate) {
      return NextResponse.json({ error: 'This date is currently blocked in the availability manager' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('yoga_sessions')
      .insert({ offering_id, session_date, start_time, capacity, meeting_link })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Yoga session creation error:', err);
    return NextResponse.json({ error: 'Failed to create session', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
