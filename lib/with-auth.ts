import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './auth-helpers';

/**
 * Middleware wrapper for API routes that require authentication.
 */
export function withAuth(handler: Function) {
  return async (req: NextRequest, { params }: any) => {
    try {
      const awaitedParams = await params;
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const admin = await validateSession(token);

      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized: Session expired or invalid' }, { status: 401 });
      }

      // Pass the admin object to the handler
      return handler(req, { params: awaitedParams, admin });
    } catch (err: any) {
      console.error('Auth check error:', err);
      return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
  };
}
