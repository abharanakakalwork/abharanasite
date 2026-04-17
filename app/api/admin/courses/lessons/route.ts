import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * POST /api/admin/courses/lessons
 * Add a lesson to a section.
 */
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { section_id, title, video_url, duration, sort_order, description, is_preview, is_published } = body;

    if (!section_id || !title) {
        return NextResponse.json({ error: 'Section ID and title are required' }, { status: 400 });
    }

    const { data: lesson, error } = await supabaseAdmin
      .from('course_lessons')
      .insert({
        section_id,
        title,
        video_url,
        duration,
        sort_order: sort_order || 0,
        description,
        is_preview: is_preview || false,
        is_published: is_published !== undefined ? is_published : true // Default to true if not specified to avoid hidden new lessons
      })
      .select()
      .single();

    if (error) {
        console.error('[Supabase Lesson Insert Error]:', error);
        throw error;
    }

    return NextResponse.json({ success: true, data: lesson });
  } catch (err: any) {
    console.error('[Admin Lesson Create Error]:', err);
    return NextResponse.json({ error: 'Failed to create lesson', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
