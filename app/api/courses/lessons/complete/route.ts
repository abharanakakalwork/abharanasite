import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateStudentSession } from '@/lib/student-auth';

/**
 * POST /api/courses/lessons/complete
 * Body: { courseId, lessonId }
 * Records that a student has completed a specific lesson.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    
    const student = await validateStudentSession(token);
    if (!student) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { courseId, lessonId } = await req.json();

    if (!courseId || !lessonId) {
      return NextResponse.json({ error: 'Course ID and Lesson ID are required' }, { status: 400 });
    }

    // Record completion (using upsert to avoid duplicates)
    const { data: completion, error } = await supabaseAdmin
      .from('lesson_completions')
      .upsert({
        student_id: student.studentId,
        course_id: courseId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString()
      }, { onConflict: 'student_id, lesson_id' })
      .select()
      .single();

    if (error) {
       // If table doesn't exist, we should inform the user
       console.error('[Lesson Completion Error]:', error);
       if (error.code === '42P01') {
         return NextResponse.json({ error: 'DB Table "lesson_completions" is missing. Please run the setup SQL.' }, { status: 501 });
       }
       throw error;
    }

    return NextResponse.json({ success: true, data: completion });

  } catch (err: any) {
    console.error('[Lesson Complete API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

/**
 * GET /api/courses/lessons/complete?courseId=xxx
 * Returns the list of completed lesson IDs for this student in this course.
 */
export async function GET(req: NextRequest) {
    try {
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.split(' ')[1];
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get('courseId');
      
      if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
      
      const student = await validateStudentSession(token);
      if (!student) return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  
      const { data: completions, error } = await supabaseAdmin
        .from('lesson_completions')
        .select('lesson_id')
        .eq('student_id', student.studentId)
        .eq('course_id', courseId);
  
      if (error) {
        if (error.code === '42P01') return NextResponse.json({ lessonIds: [] }); // Table doesn't exist yet
        throw error;
      }
  
      return NextResponse.json({ 
        success: true, 
        lessonIds: completions.map((c: any) => c.lesson_id) 
      });
  
    } catch (err: any) {
      console.error('[Fetch Completions Error]:', err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
