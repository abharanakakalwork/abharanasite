import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * PATCH /api/enquiries/[id]
 * Protected: Admin only to update status or record info.
 */
async function patchHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = params;
    const body = await req.json();

    const { data: enquiry, error } = await supabaseAdmin
      .from('enquiries')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: enquiry });
  } catch (err: any) {
    console.error('Enquiry update error:', err);
    return NextResponse.json({ error: 'Failed to update enquiry', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/enquiries/[id]
 * Protected: Admin only to remove an enquiry.
 */
async function deleteHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('enquiries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (err: any) {
    console.error('Enquiry deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete enquiry', details: err.message }, { status: 500 });
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
