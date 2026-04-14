import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/admin/payment-settings
 * Returns the global payment configuration (UPI ID, etc).
 */
async function getHandler(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[Payment Settings Get Error]:', err);
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/payment-settings
 * Updates global payment details.
 */
async function patchHandler(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if record exists
    const { data: existing } = await supabaseAdmin
      .from('payment_settings')
      .select('id')
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from('payment_settings')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('payment_settings')
        .insert(body)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error('[Payment Settings Update Error]:', err);
    return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
