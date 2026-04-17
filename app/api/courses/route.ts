import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/courses
 * Public: List all published courses.
 */
export async function GET(req: Request) {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, slug, description, thumbnail_url, price, category, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: courses });
  } catch (err: any) {
    console.error('[Public Courses List Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch courses', details: err.message }, { status: 500 });
  }
}
