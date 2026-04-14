import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth-helpers';

/**
 * POST /api/auth/logout
 * Protected: Deletes the current active session from the database.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Delete session from DB
    await deleteSession(token);

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
