import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { uploadToBunny } from '@/lib/bunny';

/**
 * GET /api/within/posts
 * Public: List all blog posts.
 * Query Parameters: ?category_id=...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');

    let query = supabaseAdmin
      .from('journal_posts')
      .select('*, journal_categories(name)')
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data: posts });
  } catch (err: any) {
    console.error('Posts list error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/within/posts
 * Protected: Admin only to create a new blog post.
 */
async function postHandler(req: NextRequest, { admin }: any) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const category_id = formData.get('category_id') as string;
      const imageFile = formData.get('image') as File;

      let imageUrl = formData.get('image_url') as string;

      if (imageFile && typeof imageFile !== 'string') {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        imageUrl = await uploadToBunny(buffer, `${Date.now()}-${imageFile.name}`, 'blogs');
      }

      const { data: post, error } = await supabaseAdmin
        .from('journal_posts')
        .insert({
          title: formData.get('title') as string,
          content: formData.get('content') as string,
          category_id: (formData.get('category_id') as string) || null,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, data: post });
    } else {
      // Standard JSON insert - explicitly pick allowed fields
      const { title, content, category_id, image_url } = await req.json();
      const { data: post, error } = await supabaseAdmin
        .from('journal_posts')
        .insert({ title, content, category_id, image_url })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data: post });
    }
  } catch (err: any) {
    console.error('Post creation error:', err);
    return NextResponse.json({ error: 'Failed to create post', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
