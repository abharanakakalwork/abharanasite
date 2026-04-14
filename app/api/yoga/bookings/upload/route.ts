import { NextRequest, NextResponse } from 'next/server';
import { uploadToBunny } from '@/lib/bunny';

/**
 * POST /api/yoga/bookings/upload
 * Public: Allows users to upload a payment screenshot for verification.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = 'payment-proofs';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Limit file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `pay-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    console.log(`[PAYMENT_UPLOAD] Uploading: ${fileName} to /${folder}`);
    const url = await uploadToBunny(buffer, fileName, folder);

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    console.error('Payment upload error:', err);
    return NextResponse.json({ 
      error: 'Failed to upload payment proof', 
      details: err.message 
    }, { status: 500 });
  }
}
