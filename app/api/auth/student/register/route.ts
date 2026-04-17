import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hashPassword, createStudentSession } from '@/lib/student-auth';

/**
 * POST /api/auth/student/register
 * Body: { email, password, name }
 */
export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    // 1. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Create student
    const { data: student, error: createError } = await supabaseAdmin
      .from('students')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: name,
      })
      .select('id, email, full_name')
      .single();

    if (createError || !student) {
      console.error('[Student Register Error]:', createError);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // 4. Create a session
    const session = await createStudentSession(student.id);

    return NextResponse.json({
      message: 'Registration successful',
      token: session.token,
      student: {
        id: student.id,
        email: student.email,
        name: student.full_name,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
