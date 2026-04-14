import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/yoga/availability-exceptions
 * Admin only: List all blocked dates.
 */
async function getHandler() {
  try {
    const { data, error } = await supabaseAdmin
      .from('yoga_availability_exceptions')
      .select('*')
      .order('exception_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Yoga availability fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch availability exceptions', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/yoga/availability-exceptions
 * Admin only: Block a specific date.
 */
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { exception_date, reason, is_blocked = true } = body;

    const { data, error } = await supabaseAdmin
      .from('yoga_availability_exceptions')
      .upsert({ exception_date, reason, is_blocked }, { onConflict: 'exception_date' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Yoga availability creation error:', err);
    return NextResponse.json({ error: 'Failed to update availability', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
