import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const securityKey = process.env.BUNNY_TOKEN_KEY;

  if (!libraryId || !securityKey) {
    console.error('Bunny Stream environment variables are missing (BUNNY_LIBRARY_ID or BUNNY_TOKEN_KEY).');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Token expires in 2 hours (7200 seconds)
  const expirationTime = Math.floor(Date.now() / 1000) + 7200;

  // Strict hashing logic for Bunny Stream: SecurityKey + VideoID + Expires
  // Do NOT include Library ID or slashes
  const hashString = `${securityKey}${videoId}${expirationTime}`;
  
  // Generate SHA256 hash
  const hash = crypto.createHash('sha256').update(hashString).digest('hex');

  // Construct the final iframe embed URL
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${hash}&expires=${expirationTime}`;

  return NextResponse.json({ url: embedUrl });
}
