import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * PUT /api/admin/courses/sections/[id]
 */
async function putHandler(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();

    const { data: section, error } = await supabaseAdmin
      .from('course_sections')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: section });
  } catch (err: any) {
    console.error('[Admin Section Update Error]:', err);
    return NextResponse.json({ error: 'Failed to update section', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/courses/sections/[id]
 */
async function deleteHandler(req: NextRequest, { params }: any) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('course_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Section deleted successfully' });
  } catch (err: any) {
    console.error('[Admin Section Delete Error]:', err);
    return NextResponse.json({ error: 'Failed to delete section', details: err.message }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
