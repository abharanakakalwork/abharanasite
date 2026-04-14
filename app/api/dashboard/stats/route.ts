import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/dashboard/stats
 * Protected route to fetch overall counts.
 */
async function handler(req: NextRequest, { admin }: any) {
  try {
    // 1. Get Enquiries Count
    const { count: enquiriesCount, error: enquiriesError } = await supabaseAdmin
      .from('enquiries')
      .select('*', { count: 'exact', head: true });

    if (enquiriesError) throw enquiriesError;

    // 2. Dummy Visitors Count (since no real tracking yet)
    const visitorsCount = 1250; // Mocked for now

    return NextResponse.json({
      success: true,
      data: {
        enquiries_count: enquiriesCount || 0,
        visitors_count: visitorsCount,
      },
    });
  } catch (err: any) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(handler);
