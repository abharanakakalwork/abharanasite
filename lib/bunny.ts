import axios from 'axios';

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY!;
const PULL_ZONE = process.env.BUNNY_PULL_ZONE!;

if (!STORAGE_ZONE || !ACCESS_KEY || !PULL_ZONE) {
  throw new Error('Missing Bunny Storage environment variables');
}

/**
 * Uploads a file to Bunny Storage.
 * @param fileBuffer Buffer of the file to upload
 * @param fileName Name of the file with extension
 * @param folder Target folder (e.g., 'audio', 'images', 'blogs')
 * @returns The public URL of the uploaded file
 */
export async function uploadToBunny(fileBuffer: Buffer, fileName: string, folder: string = 'images'): Promise<string> {
  const sanitizedFileName = fileName.replace(/\s+/g, '-');
  const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${folder}/${sanitizedFileName}`;
  
  console.log(`[BUNNY_DEBUG] Processing: ${sanitizedFileName} (${fileBuffer?.length || 0} bytes)`);
  console.log(`[BUNNY_DEBUG] URL: ${url}`);
  console.log(`[BUNNY_DEBUG] AccessKey Length: ${ACCESS_KEY?.length || 0}`);
  
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Upload failed: Empty file buffer provided');
  }

  try {
    const response = await axios.put(url, fileBuffer, {
      headers: {
        AccessKey: ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
      timeout: 30000, // 30s timeout
    });

    if (response.status === 201 || response.status === 200) {
      const publicUrl = `https://${PULL_ZONE}/${folder}/${sanitizedFileName}`;
      console.log(`[BUNNY_UPLOAD] Success: ${publicUrl}`);
      return publicUrl;
    } else {
      throw new Error(`Bunny storage upload failed with status ${response.status}`);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.Message || error.response?.data || error.message;
    const statusCode = error.response?.status || 'network_error';
    const errorTrace = `BUNNY_UPLOAD_FAIL: status=${statusCode} msg=${JSON.stringify(errorMsg)} url=${url}`;
    console.error(`[BUNNY_ERROR] ${errorTrace}`);
    throw new Error(errorTrace);
  }
}

/**
 * Deletes a file from Bunny Storage.
 */
export async function deleteFromBunny(fileName: string, folder: string = 'images'): Promise<boolean> {
  const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${folder}/${fileName}`;
  console.log(`[BUNNY_DELETE] Attempting to delete: ${url}`);

  try {
    await axios.delete(url, {
      headers: {
        AccessKey: ACCESS_KEY,
      },
    });
    console.log(`[BUNNY_DELETE] Success: ${fileName}`);
    return true;
  } catch (error: any) {
    const errorMsg = error.response?.data?.Message || error.response?.data || error.message;
    console.error(`[BUNNY_DELETE_ERROR] msg=${JSON.stringify(errorMsg)}`);
    return false;
  }
}

/**
 * Extracts folder and fileName from a Bunny Pull Zone URL.
 * Example URL: https://pullzone.b-cdn.net/folder/filename.jpg
 */
export function extractBunnyPath(url: string) {
  try {
    const parts = url.split('/');
    const fileName = parts.pop() || '';
    const folder = parts.pop() || 'images';
    return { fileName, folder };
  } catch (e) {
    return { fileName: null, folder: null };
  }
}

/**
 * Purges multiple images from Bunny Storage.
 */
export async function purgeImages(urls: string[]) {
  if (!urls || urls.length === 0) return;
  
  // Only process URLs that actually look like our Bunny Pull Zone
  const bunnyUrls = urls.filter(url => url.includes(PULL_ZONE));
  
  for (const url of bunnyUrls) {
    const { fileName, folder } = extractBunnyPath(url);
    if (fileName && folder) {
      console.log(`Purging ${folder}/${fileName} from Bunny Storage`);
      await deleteFromBunny(fileName, folder);
    }
  }
}
