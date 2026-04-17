import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendResetPasswordEmail } from '@/lib/api/email';
import crypto from 'crypto';

/**
 * POST /api/auth/student/forgot-password
 * Body: { email }
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Check if student exists
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    // If student doesn't exist, we return success anyway for security (prevent email enumeration)
    if (error || !student) {
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // 2. Generate reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // 3. Save to database
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString(),
      })
      .eq('id', student.id);

    if (updateError) {
      console.error('[Forgot Password DB Error]:', updateError);
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 });
    }

    // 4. Send email
    // Note: In production, change this to your actual domain
    const host = req.headers.get('origin') || 'https://abharanakakal.com';
    const resetLink = `${host}/auth/student/reset-password?token=${resetToken}`;
    
    await sendResetPasswordEmail(student.email, resetLink);

    return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
