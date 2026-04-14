import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { comparePasswords, createSession } from '@/lib/auth-helpers';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { token, admin: { id, email } }
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Fetch admin from Supabase
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (error || !admin) {
      if (error) console.error('[Login DB Error]:', error);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 2. Compare passwords
    const isValid = await comparePasswords(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Create a session (with max 5 session logic)
    const session = await createSession(admin.id);

    return NextResponse.json({
      message: 'Login successful',
      token: session.token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
