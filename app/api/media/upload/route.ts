import { NextRequest, NextResponse } from 'next/server';
import { validateSessionEdge } from '@/lib/edge-auth';

// IMPORTANT: Set runtime to 'edge' to bypass Vercel's 4.5MB payload limit.
// Edge Runtime supports unlimited streaming (typically up to 100MB).
export const runtime = 'edge';

/**
 * POST /api/media/upload
 * Optimized for Edge: Pipes binary stream directly to Bunny Storage.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate using Edge-compatible logic
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const admin = await validateSessionEdge(token);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    // 2. Extract metadata from custom headers
    const folder = req.headers.get('X-Folder') || 'general';
    const rawFileName = req.headers.get('X-FileName') || `upload-${Date.now()}`;
    const fileName = decodeURIComponent(rawFileName).replace(/\s+/g, '-');

    // 3. Prepare Bunny Storage details
    const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
    const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;
    const PULL_ZONE = process.env.BUNNY_PULL_ZONE;

    if (!STORAGE_ZONE || !ACCESS_KEY || !PULL_ZONE) {
      console.error('[MEDIA_UPLOAD] Missing Bunny environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const bunnyUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${folder}/${fileName}`;

    console.log(`[EDGE_UPLOAD] Piping stream for: ${fileName} to /${folder}`);

    // 4. Pipe the request body directly to Bunny Storage via fetch
    // req.body is a ReadableStream which fetch accepts in the Edge Runtime.
    const bunnyResponse = await fetch(bunnyUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: req.body, // Direct streaming pipe
      //@ts-ignore - duplex is required for streaming bodies in some versions of fetch
      duplex: 'half', 
    });

    if (!bunnyResponse.ok) {
      const errorText = await bunnyResponse.text();
      console.error(`[EDGE_UPLOAD_ERROR] Bunny responded with ${bunnyResponse.status}: ${errorText}`);
      throw new Error(`Bunny storage upload failed: ${bunnyResponse.statusText}`);
    }

    const publicUrl = `https://${PULL_ZONE}/${folder}/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (err: any) {
    console.error('[EDGE_UPLOAD_FATAL]:', err);
    return NextResponse.json({ 
      error: 'Failed to upload media', 
      details: err.message 
    }, { status: 500 });
  }
}
