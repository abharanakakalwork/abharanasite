import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateStudentSession } from '@/lib/student-auth';
import { generatePlaybackToken } from '@/lib/bunny-stream';

/**
 * GET /api/courses/[id]/watch
 * Gatekeeper API for the Video Player.
 * 1. Validates student token.
 * 2. Checks course enrollment.
 * 3. Returns curriculum + signed playback tokens for the lessons.
 */
export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id: courseId } = await params;
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    
    // 1. Validate student session
    const student = await validateStudentSession(token);
    if (!student) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    // 2. Verify enrollment
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .select('id')
      .eq('student_id', student.studentId)
      .eq('course_id', courseId)
      .eq('status', 'paid')
      .maybeSingle();

    if (enrollError || !enrollment) {
      return NextResponse.json({ error: 'Access denied. Please purchase the course.' }, { status: 403 });
    }

    // 3. Fetch full course curriculum
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select(`
        id, title, description, thumbnail_url,
        course_sections (
          id, title, sort_order,
          course_lessons (
            id, title, video_url, duration, sort_order, description, is_preview, is_published
          )
        )
      `)
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course content not found' }, { status: 404 });
    }

    // 4. Sort curriculum and prepare playback tokens
    // We only provide tokens for published lessons
    if (course.course_sections) {
      course.course_sections.sort((a: any, b: any) => a.sort_order - b.sort_order);
      
      course.course_sections.forEach((section: any) => {
        if (section.course_lessons) {
          // Filter to only published lessons
          section.course_lessons = section.course_lessons.filter((l: any) => l.is_published);
          section.course_lessons.sort((a: any, b: any) => a.sort_order - b.sort_order);

          // Generate playback token for each lesson to ensure immediate availability
          section.course_lessons.forEach((lesson: any) => {
            if (lesson.video_url) {
              const playbackInfo = generatePlaybackToken(lesson.video_url);
              lesson.playback = {
                token: playbackInfo.token,
                advancedToken: playbackInfo.advancedToken,
                expires: playbackInfo.expires,
                libraryId: playbackInfo.libraryId
              };
            }
          });
        }
      });
    }

    return NextResponse.json({ success: true, data: course });

  } catch (err: any) {
    console.error('[Watch API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
