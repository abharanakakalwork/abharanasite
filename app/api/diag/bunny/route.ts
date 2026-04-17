import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Diagnostic tool to verify Bunny Stream signatures.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY;

    if (!videoId || !tokenKey || !libraryId) {
        return NextResponse.json({ error: 'Missing videoId, tokenKey or libraryId in env' });
    }

    const expires = Math.floor(Date.now() / 1000) + 3600;
    
    // Attempt 1: Standard token v2
    const hash1 = crypto.createHash('sha256').update(tokenKey + videoId + expires.toString()).digest('hex');
    const url1 = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${hash1}&expires=${expires}`;

    // Attempt 2: Advanced Security (including LibraryID in hash)
    const hash2 = crypto.createHash('sha256').update(tokenKey + videoId + expires.toString() + libraryId).digest('hex');
    const url2 = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${hash2}&expires=${expires}`;

    return NextResponse.json({
        videoId,
        libraryId,
        expires,
        attempt1: { hash: hash1, url: url1 },
        attempt2: { hash: hash2, url: url2 },
        note: "If Attempt 1 fails with 403, try Attempt 2. Ensure your allowed domains includes localhost:3000"
    });
}
