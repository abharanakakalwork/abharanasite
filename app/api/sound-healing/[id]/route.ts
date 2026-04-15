import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { uploadToBunny, purgeImages } from '@/lib/bunny';

/**
 * PATCH /api/sound-healing/[id]
 * Protected: Admin only to update session details or files.
 */
async function patchHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';
    
    // Fetch current session for media replacement
    const { data: currentSession } = await supabaseAdmin
      .from('sound_healing')
      .select('*')
      .eq('id', id)
      .single();

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const updates: any = {};

      // Explicitly pick allowed fields to avoid schema errors (like 'image' column missing)
      const fields = ['title', 'description', 'intent', 'frequency', 'duration', 'color', 'category', 'audio_url', 'image_url'];
      
      fields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) {
          updates[field] = field === 'category' ? (value as string).toUpperCase() : value as string;
        }
      });

      // Handle file uploads
      const audioFile = formData.get('audio') as File;
      const imageFile = formData.get('image') as File;

      if (audioFile && typeof audioFile !== 'string') {
        // Purge old audio if it exists
        if (currentSession?.audio_url) await purgeImages([currentSession.audio_url]);
        
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        updates.audio_url = await uploadToBunny(buffer, `${Date.now()}-${audioFile.name}`, 'audio');
      }

      if (imageFile && typeof imageFile !== 'string') {
        // Purge old image if it exists
        if (currentSession?.image_url) await purgeImages([currentSession.image_url]);
        
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        updates.image_url = await uploadToBunny(buffer, `${Date.now()}-${imageFile.name}`, 'images');
      }

      const { data: session, error } = await supabaseAdmin
        .from('sound_healing')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, data: session });
    } else {
      // Standard JSON update
      const body = await req.json();
      if (body.category) body.category = body.category.toUpperCase();
      const { data: session, error } = await supabaseAdmin
        .from('sound_healing')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data: session });
    }
  } catch (err: any) {
    console.error('Sound healing update error:', err);
    return NextResponse.json({ error: 'Failed to update sound healing session', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/sound-healing/[id]
 * Protected: Admin only to remove a session.
 */
async function deleteHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = await params;

    // Fetch current session for media purge
    const { data: session } = await supabaseAdmin
      .from('sound_healing')
      .select('audio_url, image_url')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin
      .from('sound_healing')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Purge from Bunny
    if (session) {
      const urlsToPurge = [];
      if (session.audio_url) urlsToPurge.push(session.audio_url);
      if (session.image_url) urlsToPurge.push(session.image_url);
      
      if (urlsToPurge.length > 0) {
        console.log(`[BUNNY_PURGE] Removing media for session ${id}`);
        await purgeImages(urlsToPurge);
      }
    }

    return NextResponse.json({ success: true, message: 'Sound healing session deleted successfully' });
  } catch (err: any) {
    console.error('Sound healing deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete sound healing session', details: err.message }, { status: 500 });
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
