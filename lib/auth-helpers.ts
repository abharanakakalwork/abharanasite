import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase-admin';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MAX_SESSIONS = parseInt(process.env.MAX_DEVICE_SESSIONS || '5', 10);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in environment variables');
}

export interface AuthPayload {
  adminId: string;
  email: string;
}

/**
 * Signs a JWT token with the admin payload.
 */
export const signToken = (payload: AuthPayload): string => {
  return jwt.sign({ ...payload }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

/**
 * Verifies a JWT token and returns the payload.
 */
export const verifyToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
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
 * Session Management: Creates a new session and enforces the max 5 sessions rule.
 */
export const createSession = async (adminId: string, deviceId: string = 'unknown') => {
  // 1. Check current active sessions for this admin
  const { data: sessions, error: fetchError } = await supabaseAdmin
    .from('sessions')
    .select('id, created_at')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('[Session Fetch Error]:', fetchError);
    throw fetchError;
  }

  // 2. If sessions >= MAX_SESSIONS, delete the oldest ones
  if (sessions.length >= MAX_SESSIONS) {
    const sessionsToDelete = sessions.slice(0, sessions.length - MAX_SESSIONS + 1);
    const sessionIds = sessionsToDelete.map((s) => s.id);
    
    await supabaseAdmin
      .from('sessions')
      .delete()
      .in('id', sessionIds);
  }

  // 3. Create the new session
  const payload: AuthPayload = { adminId, email: '' }; // Email will be fetched from admins table if needed
  const token = signToken(payload);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

  const { data: newSession, error: insertError } = await supabaseAdmin
    .from('sessions')
    .insert({
      admin_id: adminId,
      device_id: deviceId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('[Session Create Error]:', insertError);
    throw insertError;
  }

  return newSession;
};

/**
 * Validates a session against the database.
 */
export const validateSession = async (token: string) => {
  const payload = verifyToken(token);
  if (!payload) return null;

  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select('admin_id, admins(email)')
    .eq('token', token)
    .single();

  if (error || !session) {
    if (error) console.error('[Session Validate Error]:', error);
    return null;
  }

  return {
    adminId: session.admin_id,
    //@ts-ignore
    email: session.admins.email,
  };
};

/**
 * Deletes a session (Logout).
 */
export const deleteSession = async (token: string) => {
  await supabaseAdmin.from('sessions').delete().eq('token', token);
};
