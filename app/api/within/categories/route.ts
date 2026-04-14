import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/within/categories
 * Public: List all blog categories.
 */
export async function GET(req: Request) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('journal_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    console.error('Categories list error:', err);
    return NextResponse.json({ error: 'Failed to fetch categories', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/within/categories
 * Protected: Admin only to create a new category.
 */
async function postHandler(req: NextRequest, { admin }: any) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const { data: category, error } = await supabaseAdmin
      .from('journal_categories')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    console.error('Category creation error:', err);
    return NextResponse.json({ error: 'Failed to create category', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
