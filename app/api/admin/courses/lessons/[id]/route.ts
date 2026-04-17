import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * PUT /api/admin/courses/lessons/[id]
 */
async function putHandler(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();

    const { data: lesson, error } = await supabaseAdmin
      .from('course_lessons')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: lesson });
  } catch (err: any) {
    console.error('[Admin Lesson Update Error]:', err);
    return NextResponse.json({ error: 'Failed to update lesson', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/courses/lessons/[id]
 */
async function deleteHandler(req: NextRequest, { params }: any) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('course_lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (err: any) {
    console.error('[Admin Lesson Delete Error]:', err);
    return NextResponse.json({ error: 'Failed to delete lesson', details: err.message }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
