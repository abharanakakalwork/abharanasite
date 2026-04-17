import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateStudentSession } from '@/lib/student-auth';
import crypto from 'crypto';

/**
 * GET /api/courses/playback?videoId=...&libraryId=...&courseId=...
 * Generates a signed playback token for Bunny Stream.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    const libraryId = searchParams.get('libraryId');
    const courseId = searchParams.get('courseId');

    if (!videoId || !libraryId || !courseId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 1. Validate student session
    const student = await validateStudentSession(token);
    if (!student) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // 2. Verify enrollment (Is the student actually allowed to see this course?)
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .select('id')
      .eq('student_id', student.studentId)
      .eq('course_id', courseId)
      .eq('status', 'paid')
      .maybeSingle();

    if (enrollError || !enrollment) {
      return NextResponse.json({ error: 'No active enrollment found for this course' }, { status: 403 });
    }

    // 3. Generate signed token
    const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY;
    if (!tokenKey) {
      console.error('[Playback API Error]: BUNNY_STREAM_TOKEN_KEY is not defined in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Security Algorithm: sha256(SecurityKey + VideoID + Expires)
    // Expiration: 2 hours from now
    const expires = Math.floor(Date.now() / 1000) + (3600 * 2);
    const input = tokenKey + videoId + expires;
    const signature = crypto.createHash('sha256').update(input).digest('hex');

    return NextResponse.json({
      token: signature,
      expires: expires,
      libraryId: libraryId
    });

  } catch (err: any) {
    console.error('[Playback API Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
