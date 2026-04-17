import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { comparePasswords, createStudentSession } from '@/lib/student-auth';

/**
 * POST /api/auth/student/login
 * Body: { email, password }
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Fetch student from Supabase
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('id, email, full_name, password_hash')
      .eq('email', email)
      .single();

    if (error || !student) {
      if (error) console.error('[Student Login DB Error]:', error);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 2. Compare passwords
    const isValid = await comparePasswords(password, student.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Create a session
    const session = await createStudentSession(student.id);

    return NextResponse.json({
      message: 'Login successful',
      token: session.token,
      student: {
        id: student.id,
        email: student.email,
        name: student.full_name,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
