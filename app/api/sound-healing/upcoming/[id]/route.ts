import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * PATCH /api/sound-healing/upcoming/[id]
 * Protected: Admin only to update an upcoming session.
 */
async function patchHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data: session, error } = await supabaseAdmin
      .from('upcoming_sessions')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Upcoming Update Error]:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    console.error('Upcoming session update error:', err);
    return NextResponse.json({ error: 'Failed to update upcoming session', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/sound-healing/upcoming/[id]
 * Protected: Admin only to delete an upcoming session.
 */
async function deleteHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('upcoming_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Upcoming Delete Error]:', error);
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Session deleted' });
  } catch (err: any) {
    console.error('Upcoming session deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete upcoming session', details: err.message }, { status: 500 });
  }
}

/**
 * GET /api/sound-healing/upcoming/[id]
 * Public: Fetch a single upcoming session's details.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: session, error } = await supabaseAdmin
      .from('upcoming_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    console.error('Session fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch session details', details: err.message }, { status: 500 });
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
