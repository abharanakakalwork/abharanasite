import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * POST /api/admin/courses/sections
 * Create a new section within a course.
 */
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { course_id, title, sort_order } = body;

    if (!course_id || !title) {
        return NextResponse.json({ error: 'Course ID and title are required' }, { status: 400 });
    }

    const { data: section, error } = await supabaseAdmin
      .from('course_sections')
      .insert({ course_id, title, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) {
        console.error('[Supabase Section Insert Error]:', error);
        throw error;
    }

    return NextResponse.json({ success: true, data: section });
  } catch (err: any) {
    console.error('[Admin Section Create Error]:', err);
    return NextResponse.json({ error: 'Failed to create section', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
