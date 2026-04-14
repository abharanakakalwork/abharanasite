import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { uploadToBunny, purgeImages } from '@/lib/bunny';

/**
 * PATCH /api/retreats/[id]
 * Protected: Admin only to update retreat details or images.
 */
async function patchHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = params;
    const contentType = req.headers.get('content-type') || '';
    
    // 1. Fetch current retreat for image cleanup comparison
    const { data: oldRetreat } = await supabaseAdmin.from('retreats').select('image_urls, gallery').eq('id', id).single();
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const keys = Array.from(formData.keys());
      console.log(`[DEBUG_PATCH] Incoming FormData keys: ${keys.join(', ')}`);
      
      const updates: any = {};

      // Handle simple text fields
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string' && key !== 'images' && key !== 'existing_images' && key !== 'gallery') {
          updates[key] = value;
          if (key === 'price') updates[key] = parseFloat(value) || 0;
        }
      }

      // Handle the "image_urls" logic
      const existingImages = formData.get('existing_images') as string;
      let imageUrls: string[] = existingImages ? JSON.parse(existingImages) : [];
      
      const newImageFiles = formData.getAll('images') as File[];
      console.log(`[DEBUG_PATCH] Processing ${newImageFiles.length} new images`);
      
      for (const file of newImageFiles) {
        console.log(`[FILE_DEBUG] name=${file.name} size=${file.size} type=${file.type}`);
        if (typeof file !== 'string') {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = file.name || `image-${Date.now()}`;
          console.log(`[DEBUG_PATCH] Buffer length for ${fileName}: ${buffer.length}`);
          const url = await uploadToBunny(buffer, `${Date.now()}-${fileName}`, 'images');
          imageUrls.push(url);
        }
      }
      console.log(`[DEBUG_PATCH] Final imageUrls after uploads: ${JSON.stringify(imageUrls)}`);
      
      updates.image_urls = imageUrls;

      // Handle the "gallery" logic
      const galleryData = formData.get('gallery') as string;
      updates.gallery = galleryData ? JSON.parse(galleryData) : [];

      const { data: retreat, error } = await supabaseAdmin
        .from('retreats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 2. Performance image cleanup (find removed images)
      const oldImages = [...(oldRetreat?.image_urls || []), ...(oldRetreat?.gallery || [])];
      const newImages = [...(updates.image_urls || []), ...(updates.gallery || [])];
      
      if (oldImages.length > 0) {
        const removedImages = oldImages.filter((url: string) => !newImages.includes(url));
        console.log(`[DEBUG_PATCH] Images to purge: ${JSON.stringify(removedImages)}`);
        try {
          await purgeImages(removedImages);
        } catch (e: any) {
          console.error(`[DEBUG_PATCH] Purge failed (non-critical): ${e.message}`);
        }
      }

      return NextResponse.json({ success: true, data: retreat });
    } else {
      // Standard JSON update
      const jsonBody = await req.json();
      const { existing_images, images, gallery, ...body } = jsonBody;

      // Handle the "image_urls" logic if provided in JSON
      if (existing_images) {
        body.image_urls = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
      }

      if (gallery) {
        body.gallery = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
      }

      // Ensure price is numeric if provided
      if (body.price !== undefined) {
        body.price = parseFloat(body.price) || 0;
      }

      const { data: retreat, error } = await supabaseAdmin
        .from('retreats')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 2. Performance image cleanup (find removed images)
      const oldImages = [...(oldRetreat?.image_urls || []), ...(oldRetreat?.gallery || [])];
      const newImages = [...(body.image_urls || []), ...(body.gallery || [])];
      
      if (oldImages.length > 0) {
        const removedImages = oldImages.filter((url: string) => !newImages.includes(url));
        await purgeImages(removedImages);
      }

      return NextResponse.json({ success: true, data: retreat });
    }
  } catch (err: any) {
    console.error('Retreat update error:', err);
    return NextResponse.json({ error: 'Failed to update retreat', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/retreats/[id]
 * Protected: Admin only to remove a retreat.
 */
async function deleteHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = params;

    // 1. Fetch retreat to find images to purge
    const { data: retreat } = await supabaseAdmin.from('retreats').select('image_urls').eq('id', id).single();

    if (retreat?.image_urls) {
      await purgeImages(retreat.image_urls);
    }

    const { error } = await supabaseAdmin
      .from('retreats')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Retreat deleted successfully' });
  } catch (err: any) {
    console.error('Retreat deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete retreat', details: err.message }, { status: 500 });
  }
}

/**
 * GET /api/retreats/[id]
 * Public: Fetch a single retreat's details.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if id is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      const { data: retreat, error } = await supabaseAdmin
        .from('retreats')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Retreat not found', details: error.message }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: retreat });
    } else {
      // Treat as slug: fetch all and match in JS for maximum reliability with special characters
      const { data: retreats, error } = await supabaseAdmin
        .from('retreats')
        .select('*');

      if (error) throw error;

      const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
          .replace(/--+/g, "-");
      };

      const retreat = retreats.find(r => slugify(r.title) === id);

      if (!retreat) {
        return NextResponse.json({ error: 'Retreat not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: retreat });
    }
  } catch (err: any) {
    console.error('Retreat fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch retreat', details: err.message }, { status: 500 });
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
