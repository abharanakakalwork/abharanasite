import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { uploadToBunny } from '@/lib/bunny';

/**
 * GET /api/retreats
 * Public: List all upcoming retreats.
 */
export async function GET(req: Request) {
  try {
    const { data: retreats, error } = await supabaseAdmin
      .from('retreats')
      .select('*')
      .order('date', { ascending: true }); // Order by event date

    if (error) throw error;

    return NextResponse.json({ success: true, data: retreats });
  } catch (err: any) {
    console.error('Retreats list error:', err);
    return NextResponse.json({ error: 'Failed to fetch retreats', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/retreats
 * Protected: Admin only to create a new retreat.
 * Supports multiple image uploads for the image_urls array.
 */
async function postHandler(req: NextRequest, { admin }: any) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const price = formData.get('price') as string;
      const date = formData.get('date') as string;
      
      const imageFiles = formData.getAll('images') as File[];
      let imageUrls: string[] = [];

      // Handle multiple image uploads
      console.log(`Processing ${imageFiles.length} images for new retreat`);
      for (const file of imageFiles) {
        if (typeof file !== 'string') {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = file.name || `image-${Date.now()}`;
          const url = await uploadToBunny(buffer, `${Date.now()}-${fileName}`, 'images');
          imageUrls.push(url);
        }
      }
      console.log('Final imageUrls:', imageUrls);

      const { data: retreat, error } = await supabaseAdmin
        .from('retreats')
        .insert({
          title,
          description,
          price: parseFloat(price) || 0,
          date,
          image_urls: imageUrls,
          gallery: formData.get('gallery') ? JSON.parse(formData.get('gallery') as string) : [],
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, data: retreat });
    } else {
      // Standard JSON insert
      const jsonBody = await req.json();
      const { existing_images, images, gallery, ...body } = jsonBody;

      // Map image_urls if provided in JSON
      if (existing_images) {
        body.image_urls = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
      }
      
      if (gallery) {
        body.gallery = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
      }

      // Ensure price is numeric
      if (body.price !== undefined) {
        body.price = parseFloat(body.price) || 0;
      }

      const { data: retreat, error } = await supabaseAdmin
        .from('retreats')
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data: retreat });
    }
  } catch (err: any) {
    console.error('Retreat creation error:', err);
    return NextResponse.json({ error: 'Failed to create retreat', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
