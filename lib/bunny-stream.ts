import axios from 'axios';
import crypto from 'crypto';

const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const API_KEY = process.env.BUNNY_STREAM_API_KEY!;
const HOSTNAME = process.env.BUNNY_STREAM_HOSTNAME!;
const TOKEN_KEY = process.env.BUNNY_STREAM_TOKEN_KEY!;

if (!LIBRARY_ID || !API_KEY || !HOSTNAME || !TOKEN_KEY) {
  console.warn('Missing Bunny Stream environment variables');
}

/**
 * Generates a signed URL/token for Bunny Stream playback.
 * This prevents users from sharing direct video links.
 * @param videoId The ID of the video in Bunny Stream
 * @param expirationMinutes How long the token is valid (default 120m)
 */
export function generatePlaybackToken(videoId: string, expirationMinutes: number = 120) {
  const expires = Math.floor(Date.now() / 1000) + expirationMinutes * 60;
  
  // Standard Signature: sha256(tokenKey + videoId + expires)
  const standardToken = crypto
    .createHash('sha256')
    .update(TOKEN_KEY + videoId + expires.toString())
    .digest('hex');

  // Advanced Signature: sha256(tokenKey + videoId + expires + libraryId)
  const advancedToken = crypto
    .createHash('sha256')
    .update(TOKEN_KEY + videoId + expires.toString() + LIBRARY_ID)
    .digest('hex');

  return {
    token: standardToken,
    advancedToken: advancedToken,
    expires,
    libraryId: LIBRARY_ID
  };
}

/**
 * Returns the embed URL for a video with security tokens.
 */
export function getVideoEmbedUrl(videoId: string) {
  const { token, expires } = generatePlaybackToken(videoId);
  return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?token=${token}&expires=${expires}`;
}

/**
 * Fetches video details from Bunny Stream API.
 */
export async function getVideoDetails(videoId: string) {
  try {
    const response = await axios.get(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          AccessKey: API_KEY,
          accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('[BUNNY_STREAM_ERROR] Failed to fetch video:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Uploads a video to Bunny Stream.
 * @param title Title for the video
 */
export async function createVideoPlaceholder(title: string) {
  const response = await axios.post(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    { title },
    {
      headers: {
        AccessKey: API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data; // { guid: '...' }
}

export async function uploadVideoFile(videoId: string, fileBuffer: Buffer) {
  const response = await axios.put(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    fileBuffer,
    {
      headers: {
        AccessKey: API_KEY,
        'Content-Type': 'application/octet-stream',
      },
    }
  );
  return response.data;
}

/**
 * Generates a signature for TUS Resumable Uploads.
 * Securely allows client-side uploads without exposing the main API Key.
 * Formula: SHA256(LibraryID + APIKey + Expire + VideoID)
 */
export function generateUploadSignature(videoId: string, expirationMinutes: number = 60) {
  const expires = Math.floor(Date.now() / 1000) + expirationMinutes * 60;
  const data = LIBRARY_ID + API_KEY + expires + videoId;
  const signature = crypto.createHash('sha256').update(data).digest('hex');

  return {
    signature,
    expires,
    libraryId: LIBRARY_ID,
    videoId
  };
}
