import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/admin/courses
 * List all courses.
 */
async function getHandler(req: NextRequest) {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*, instructor:admins(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: courses });
  } catch (err: any) {
    console.error('[Admin Courses List Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch courses', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/courses
 * Create a new course.
 */
async function postHandler(req: NextRequest, { admin }: any) {
  try {
    const body = await req.json();
    console.log('[Admin Course Create Body]:', body);

    // Filter only allowed fields to prevent schema mismatch errors
    const { title, slug, description, thumbnail_url, price, category, is_published } = body;
    
    // Auto-generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug && title) {
        finalSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    }

    const payload = {
        title,
        slug: finalSlug,
        description,
        thumbnail_url,
        price: Number(price) || 0,
        category,
        is_published: !!is_published,
        instructor_id: admin.adminId
    };

    console.log('[Admin Course Create Sanitized]:', payload);

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert(payload)
      .select()
      .single();

    if (error) {
        console.error('[Supabase Course Insert Error]:', error);
        throw error;
    }

    return NextResponse.json({ success: true, data: course });
  } catch (err: any) {
    console.error('[Admin Course Create Error]:', err);
    return NextResponse.json({ error: 'Failed to create course', details: err.message }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
