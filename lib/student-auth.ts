import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase-admin';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MAX_SESSIONS = parseInt(process.env.MAX_DEVICE_SESSIONS || '5', 10);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in environment variables');
}

export interface StudentAuthPayload {
  studentId: string;
  email: string;
}

/**
 * Signs a JWT token with the student payload.
 */
export const signStudentToken = (payload: StudentAuthPayload): string => {
  return jwt.sign({ ...payload }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

/**
 * Verifies a JWT token and returns the student payload.
 */
export const verifyStudentToken = (token: string): StudentAuthPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as StudentAuthPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Hashes a password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a password with a hash.
 */
export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Session Management: Creates a new student session and enforces the max 5 sessions rule.
 */
export const createStudentSession = async (studentId: string, deviceId: string = 'unknown') => {
  // 1. Check current active sessions for this student
  const { data: sessions, error: fetchError } = await supabaseAdmin
    .from('student_sessions')
    .select('id, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('[Student Session Fetch Error]:', fetchError);
    throw fetchError;
  }

  // 2. If sessions >= MAX_SESSIONS, delete the oldest ones
  if (sessions.length >= MAX_SESSIONS) {
    const sessionsToDelete = sessions.slice(0, sessions.length - MAX_SESSIONS + 1);
    const sessionIds = sessionsToDelete.map((s) => s.id);
    
    await supabaseAdmin
      .from('student_sessions')
      .delete()
      .in('id', sessionIds);
  }

  // 3. Create the new session
  const { data: student } = await supabaseAdmin
    .from('students')
    .select('email')
    .eq('id', studentId)
    .single();

  const payload: StudentAuthPayload = { studentId, email: student?.email || '' };
  const token = signStudentToken(payload);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

  const { data: newSession, error: insertError } = await supabaseAdmin
    .from('student_sessions')
    .insert({
      student_id: studentId,
      device_id: deviceId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('[Student Session Create Error]:', insertError);
    throw insertError;
  }

  return newSession;
};

/**
 * Validates a student session against the database.
 */
export const validateStudentSession = async (token: string) => {
  const payload = verifyStudentToken(token);
  if (!payload) return null;

  const { data: session, error } = await supabaseAdmin
    .from('student_sessions')
    .select('student_id, students(email, full_name)')
    .eq('token', token)
    .single();

  if (error || !session) {
    if (error) console.error('[Student Session Validate Error]:', error);
    return null;
  }

  return {
    studentId: session.student_id,
    //@ts-ignore
    email: session.students.email,
    //@ts-ignore
    name: session.students.full_name,
  };
};

/**
 * Deletes a student session (Logout).
 */
export const deleteStudentSession = async (token: string) => {
  await supabaseAdmin.from('student_sessions').delete().eq('token', token);
};
