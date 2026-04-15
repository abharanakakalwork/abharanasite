import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { uploadToBunny } from '@/lib/bunny';

/**
 * GET /api/sound-healing
 * Public: List all sound healing sessions.
 */
export async function GET(req: Request) {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('sound_healing')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: sessions });
  } catch (err: any) {
    console.error('Sound healing list error:', err);
    return NextResponse.json({ error: 'Failed to fetch sound healing sessions', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/sound-healing
 * Protected: Admin only to create a new session.
 * Handled via JSON for content and optionally file uploading separate logic,
 * or via FormData for everything.
 */
async function postHandler(req: NextRequest, { admin }: any) {
  try {
    // Check if it's FormData (for file uploads) or JSON
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const audioFile = formData.get('audio') as File;
      const imageFile = formData.get('image') as File;
      const intent = formData.get('intent') as string;
      const frequency = formData.get('frequency') as string;
      const duration = formData.get('duration') as string;
      const color = formData.get('color') as string;
      const category = (formData.get('category') as string)?.toUpperCase();

      let audioUrl = formData.get('audio_url') as string;
      let imageUrl = formData.get('image_url') as string;

      // Upload files if provided
      if (audioFile && typeof audioFile !== 'string') {
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        audioUrl = await uploadToBunny(buffer, `${Date.now()}-${audioFile.name}`, 'audio');
      }

      if (imageFile && typeof imageFile !== 'string') {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        imageUrl = await uploadToBunny(buffer, `${Date.now()}-${imageFile.name}`, 'images');
      }

      const { data: session, error } = await supabaseAdmin
        .from('sound_healing')
        .insert({
          title,
          description,
          audio_url: audioUrl,
          image_url: imageUrl,
          intent,
          frequency,
          duration,
          color,
          category
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, data: session });
    } else {
      // Standard JSON insert
      const body = await req.json();
      if (body.category) body.category = body.category.toUpperCase();
      const { data: session, error } = await supabaseAdmin
        .from('sound_healing')
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data: session });
    }
  } catch (err: any) {
    console.error('Sound healing creation error:', err);
    return NextResponse.json({ error: 'Failed to create sound healing session', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
