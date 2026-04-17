import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hashPassword } from '@/lib/student-auth';

/**
 * POST /api/auth/student/reset-password
 * Body: { token, password }
 */
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    // 1. Find student with this token and ensure it's not expired
    const now = new Date().toISOString();
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('reset_token', token)
      .gt('reset_token_expires', now)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // 2. Hash new password
    const passwordHash = await hashPassword(password);

    // 3. Update student and clear token
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('id', student.id);

    if (updateError) {
      console.error('[Reset Password DB Error]:', updateError);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
