import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/courses/[id]
 * Public: Fetch a single course with its curriculum.
 * Only returns published courses and published lessons.
 */
export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = await params;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*, course_sections(*, course_lessons(*))')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error || !course) {
      return NextResponse.json({ error: 'Course not found or private' }, { status: 404 });
    }

    // Sort sections and lessons by sort_order
    if (course.course_sections) {
      // 1. Filter out unpublished lessons for the public view
      course.course_sections.forEach((section: any) => {
        if (section.course_lessons) {
          section.course_lessons = section.course_lessons.filter((l: any) => l.is_published);
          section.course_lessons.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
      });

      // 2. Sort sections
      course.course_sections.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }

    return NextResponse.json({ success: true, data: course });
  } catch (err: any) {
    console.error('[Public Course Detail Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch course details', details: err.message }, { status: 500 });
  }
}
