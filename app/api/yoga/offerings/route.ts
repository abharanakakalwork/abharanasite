import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/yoga/offerings
 * Public: List all yoga offering types.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('yoga_offerings')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Yoga offerings fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch offerings', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/yoga/offerings
 * Protected: Admin only to create a new offering type.
 */
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, duration, single_price, package_5_price, package_10_price, package_15_price, image_url } = body;

    const { data, error } = await supabaseAdmin
      .from('yoga_offerings')
      .insert({ title, description, duration, single_price, package_5_price, package_10_price, package_15_price, image_url })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Yoga offering creation error:', err);
    return NextResponse.json({ error: 'Failed to create offering', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
