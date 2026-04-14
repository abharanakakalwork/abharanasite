import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { deleteFromBunny, extractBunnyPath } from '@/lib/bunny';

/**
 * DELETE /api/media/purge
 * Protected: Admin only to delete a single file from Bunny Storage.
 */
async function purgeHandler(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    const { fileName, folder } = extractBunnyPath(url);
    
    if (!fileName || !folder) {
      return NextResponse.json({ error: 'Invalid Bunny URL format' }, { status: 400 });
    }

    console.log(`[MEDIA_PURGE] Removing: ${fileName} from /${folder}`);
    const success = await deleteFromBunny(fileName, folder);

    if (success) {
      return NextResponse.json({ success: true, message: 'Media purged' });
    } else {
      return NextResponse.json({ error: 'Failed to purge media' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Media purge error:', err);
    return NextResponse.json({ 
      error: 'Failed to process purge request', 
      details: err.message 
    }, { status: 500 });
  }
}

export const DELETE = withAuth(purgeHandler);
