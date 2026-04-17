import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateStudentSession } from '@/lib/student-auth';

/**
 * GET /api/courses/my-enrollments?courseId=xxx
 * Checks if the current student is enrolled in a specific course.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ enrolled: false });
    }

    const student = await validateStudentSession(token);
    if (!student) {
      return NextResponse.json({ enrolled: false });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    // MODE 1: Check enrollment for a specific course (used on Course Detail pages)
    if (courseId) {
      const { data: enrollment, error } = await supabaseAdmin
        .from('course_enrollments')
        .select('id')
        .eq('student_id', student.studentId)
        .eq('course_id', courseId)
        .eq('status', 'paid')
        .maybeSingle();

      if (error) {
        console.error('[My Enrollments Check Error]:', error);
        return NextResponse.json({ enrolled: false });
      }

      return NextResponse.json({ enrolled: !!enrollment });
    }

    // MODE 2: Return ALL paid enrollments for the student (used on My Courses dashboard)
    const { data: enrollments, error } = await supabaseAdmin
      .from('course_enrollments')
      .select(`
        id,
        status,
        course_id,
        course:courses (
          id,
          title,
          thumbnail_url,
          description,
          price
        )
      `)
      .eq('student_id', student.studentId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[My Enrollments Fetch Error]:', error);
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }

    return NextResponse.json({ enrollments });
  } catch (err: any) {
    console.error('[My Enrollments API Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
