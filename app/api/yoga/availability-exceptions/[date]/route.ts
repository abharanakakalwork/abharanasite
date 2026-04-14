import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * DELETE /api/yoga/availability-exceptions/[date]
 * Admin only: Unblock a specific date.
 */
async function deleteHandler(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is missing' }, { status: 400 });
    }

    console.log(`[API] Unblocking date: ${date}`);

    const { error } = await supabaseAdmin
      .from('yoga_availability_exceptions')
      .delete()
      .eq('exception_date', date);

    if (error) {
      console.error('[Supabase Error] Failed to delete exception:', error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Date ${date} is now marked as available` 
    });
  } catch (err: any) {
    console.error('Yoga availability [date] delete error:', err);
    return NextResponse.json({ 
      error: 'Failed to unblock date', 
      details: err.message 
    }, { status: 500 });
  }
}

export const DELETE = withAuth(deleteHandler);
