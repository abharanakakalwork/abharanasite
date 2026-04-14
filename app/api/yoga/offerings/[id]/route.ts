import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * PATCH /api/yoga/offerings/[id]
 * Protected: Admin only to update an offering type.
 */
async function patchHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    
    // Whitelist fields to update
    const { title, description, duration, single_price, package_5_price, package_10_price, package_15_price, image_url } = body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (single_price !== undefined) updateData.single_price = single_price;
    if (package_5_price !== undefined) updateData.package_5_price = package_5_price;
    if (package_10_price !== undefined) updateData.package_10_price = package_10_price;
    if (package_15_price !== undefined) updateData.package_15_price = package_15_price;
    if (image_url !== undefined) updateData.image_url = image_url;

    const { data, error } = await supabaseAdmin
      .from('yoga_offerings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Yoga offering update error:', err);
    return NextResponse.json({ error: 'Failed to update offering', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/yoga/offerings/[id]
 * Protected: Admin only to delete an offering type.
 */
async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('yoga_offerings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Yoga offering deletion error:', err);
    return NextResponse.json({ error: 'Failed to delete offering', details: err.message }, { status: 500 });
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
