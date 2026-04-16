import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/media/credentials
 * Provides Bunny Storage credentials to authenticated admins for direct client-side upload.
 */
async function credentialsHandler(req: NextRequest) {
  try {
    const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
    const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;
    const PULL_ZONE = process.env.BUNNY_PULL_ZONE;

    if (!STORAGE_ZONE || !ACCESS_KEY || !PULL_ZONE) {
      return NextResponse.json({ error: 'Bunny configuration missing' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      credentials: {
        storageZone: STORAGE_ZONE,
        accessKey: ACCESS_KEY,
        pullZone: PULL_ZONE
      }
    });
  } catch (err: any) {
    console.error('[CREDENTIALS_ERROR]:', err);
    return NextResponse.json({ error: 'Failed to fetch upload credentials' }, { status: 500 });
  }
}

export const GET = withAuth(credentialsHandler);
