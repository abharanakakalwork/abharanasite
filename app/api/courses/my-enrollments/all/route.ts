import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateStudentSession } from '@/lib/student-auth';

/**
 * GET /api/courses/my-enrollments/all
 * Returns all courses the authenticated student is enrolled in.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    
    const student = await validateStudentSession(token);
    if (!student) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { data: enrollments, error } = await supabaseAdmin
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        status,
        created_at,
        courses (
          id,
          title,
          thumbnail_url,
          description
        )
      `)
      .eq('student_id', student.studentId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Fetch All Enrollments Error]:', error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data: enrollments 
    });

  } catch (err: any) {
    console.error('[My Enrollments API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
