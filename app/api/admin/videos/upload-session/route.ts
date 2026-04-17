import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createVideoPlaceholder, generateUploadSignature } from '@/lib/bunny-stream';

/**
 * POST /api/admin/videos/upload-session
 * 1. Creates a video placeholder in Bunny Stream.
 * 2. Generates a temporary signature for direct-from-client upload.
 */
async function uploadSessionHandler(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Video title is required' }, { status: 400 });
    }

    // 1. Create Placeholder in Bunny Stream
    const placeholder = await createVideoPlaceholder(title);
    const videoId = placeholder.guid;

    // 2. Generate TUS Signature
    const signatureData = generateUploadSignature(videoId);

    return NextResponse.json({
      success: true,
      data: {
        videoId: signatureData.videoId,
        libraryId: signatureData.libraryId,
        signature: signatureData.signature,
        expiration: signatureData.expires,
        title
      }
    });
  } catch (err: any) {
    console.error('[VIDEO_SESSION_ERROR]:', err);
    return NextResponse.json({ 
      error: 'Failed to create upload session', 
      details: err.response?.data || err.message 
    }, { status: 500 });
  }
}

export const POST = withAuth(uploadSessionHandler);
