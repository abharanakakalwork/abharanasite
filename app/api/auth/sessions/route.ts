import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/auth/sessions
 * Protected: List all active sessions for the current admin.
 */
async function getHandler(req: NextRequest, { admin }: any) {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('admin_id', admin.adminId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: sessions });
  } catch (err: any) {
    console.error('Sessions list error:', err);
    return NextResponse.json({ error: 'Failed to fetch sessions', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/sessions
 * Protected: Revoke a specific session or all sessions.
 */
async function deleteHandler(req: NextRequest, { admin }: any) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');

    if (sessionId) {
      const { error } = await supabaseAdmin
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('admin_id', admin.adminId);
      if (error) throw error;
    } else {
      // Revoke all EXCEPT current? Or just all. 
      // User said "Logout from all devices".
      const { error } = await supabaseAdmin
        .from('sessions')
        .delete()
        .eq('admin_id', admin.adminId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Sessions revoked successfully' });
  } catch (err: any) {
    console.error('Session revocation error:', err);
    return NextResponse.json({ error: 'Failed to revoke sessions', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const DELETE = withAuth(deleteHandler);
