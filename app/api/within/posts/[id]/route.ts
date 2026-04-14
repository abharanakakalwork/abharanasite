import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { uploadToBunny } from '@/lib/bunny';

/**
 * PATCH /api/within/posts/[id]
 * Protected: Admin only to update blog post details or images.
 */
async function patchHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = params;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const updates: any = {};

      // Explicitly pick allowed fields from FormData
      const allowedFields = ['title', 'content', 'category_id', 'image_url'];
      for (const field of allowedFields) {
        const value = formData.get(field);
        if (value !== null) {
          updates[field] = value;
          if (field === 'category_id' && value === '') updates[field] = null;
        }
      }

      const imageFile = formData.get('image') as File;
      if (imageFile && typeof imageFile !== 'string') {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        updates.image_url = await uploadToBunny(buffer, `${Date.now()}-${imageFile.name}`, 'blogs');
      }

      const { data: post, error } = await supabaseAdmin
        .from('journal_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, data: post });
    } else {
      // Standard JSON update - explicitly pick allowed fields
      const { title, content, category_id, image_url } = await req.json();
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (category_id !== undefined) updates.category_id = category_id || null;
      if (image_url !== undefined) updates.image_url = image_url;

      const { data: post, error } = await supabaseAdmin
        .from('journal_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data: post });
    }
  } catch (err: any) {
    console.error('Post update error:', err);
    return NextResponse.json({ error: 'Failed to update post', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/within/posts/[id]
 * Protected: Admin only to remove a blog post.
 */
async function deleteHandler(req: NextRequest, { params, admin }: any) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('journal_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: any) {
    console.error('Post deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete post', details: err.message }, { status: 500 });
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
