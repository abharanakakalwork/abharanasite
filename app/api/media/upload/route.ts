import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { uploadToBunny } from '@/lib/bunny';

/**
 * POST /api/media/upload
 * Protected: Admin only to upload a single file to Bunny Storage.
 */
async function uploadHandler(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'images';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || `upload-${Date.now()}`;
    
    console.log(`[MEDIA_UPLOAD] Uploading: ${fileName} to /${folder}`);
    const url = await uploadToBunny(buffer, fileName, folder); // uploadToBunny already handles serialization and timestamping if configured, but I added it in lib/bunny correctly.

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    console.error('Media upload error:', err);
    return NextResponse.json({ 
      error: 'Failed to upload media', 
      details: err.message.replace(/"/g, "'") 
    }, { status: 500 });
  }
}

export const POST = withAuth(uploadHandler);
