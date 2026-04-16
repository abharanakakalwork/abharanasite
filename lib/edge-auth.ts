import { jwtVerify } from 'jose';
import { supabaseAdmin } from './supabase-admin';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Validates a session in the Edge Runtime.
 * Next.js Edge doesn't support jsonwebtoken, so we use jose.
 */
export async function validateSessionEdge(token: string) {
  try {
    // 1. Verify the JWT signature using jose
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (!payload || !payload.adminId) {
      return null;
    }

    // 2. Check the session in Supabase (supabase-js is Edge compatible)
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('admin_id, admins(email)')
      .eq('token', token)
      .single();

    if (error || !session) {
      return null;
    }

    return {
      adminId: session.admin_id,
      //@ts-ignore
      email: session.admins.email,
    };
  } catch (err) {
    console.error('[EDGE_AUTH_ERROR]:', err);
    return null;
  }
}
