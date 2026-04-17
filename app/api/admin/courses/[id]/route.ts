import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/admin/courses/[id]
 * Fetch a single course with its curriculum.
 */
async function getHandler(req: NextRequest, { params }: any) {
  try {
    const { id } = params;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*, course_sections(*, course_lessons(*))')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Sort sections and lessons by sort_order
    if (course.course_sections) {
      course.course_sections.sort((a: any, b: any) => a.sort_order - b.sort_order);
      course.course_sections.forEach((section: any) => {
        if (section.course_lessons) {
          section.course_lessons.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
      });
    }

    return NextResponse.json({ success: true, data: course });
  } catch (err: any) {
    console.error('[Admin Course Detail Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch course details', details: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/courses/[id]
 * Update course info.
 */
async function putHandler(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();
    console.log('[Admin Course Update Body]:', body);

    // Filter only allowed fields to prevent schema mismatch errors (e.g. course_sections)
    const { title, slug, description, thumbnail_url, price, category, is_published } = body;
    
    const payload: any = {};
    if (title !== undefined) payload.title = title;
    if (slug !== undefined) payload.slug = slug;
    if (description !== undefined) payload.description = description;
    if (thumbnail_url !== undefined) payload.thumbnail_url = thumbnail_url;
    if (price !== undefined) payload.price = Number(price) || 0;
    if (category !== undefined) payload.category = category;
    if (is_published !== undefined) payload.is_published = !!is_published;

    console.log('[Admin Course Update Sanitized]:', payload);

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
        console.error('[Supabase Course Update Error]:', error);
        throw error;
    }

    return NextResponse.json({ success: true, data: course });
  } catch (err: any) {
    console.error('[Admin Course Update Error]:', err);
    return NextResponse.json({ error: 'Failed to update course', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/courses/[id]
 */
async function deleteHandler(req: NextRequest, { params }: any) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (err: any) {
    console.error('[Admin Course Delete Error]:', err);
    return NextResponse.json({ error: 'Failed to delete course', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
