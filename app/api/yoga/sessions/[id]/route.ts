import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * PATCH /api/yoga/sessions/[id]
 * Protected: Admin only to update session slot details.
 */
async function patchHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { 
        session_date, 
        start_time, 
        capacity, 
        is_blocked, 
        blocked_reason, 
        status, 
        meeting_link,
        duration_minutes,
        cooldown_minutes
    } = body;

    const { data: updated, error } = await supabaseAdmin
      .from('yoga_sessions')
      .update({ 
        session_date, 
        start_time, 
        capacity, 
        is_blocked, 
        blocked_reason, 
        status, 
        meeting_link,
        duration_minutes,
        cooldown_minutes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Yoga session update error:', err);
    return NextResponse.json({ error: 'Failed to update session', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/yoga/sessions/[id]
 * Protected: Admin only to remove a session slot record.
 */
async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const id = params.id;
      const { error } = await supabaseAdmin
        .from('yoga_sessions')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error('Yoga session delete error:', err);
      return NextResponse.json({ error: 'Failed to delete session', details: err.message }, { status: 500 });
    }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
