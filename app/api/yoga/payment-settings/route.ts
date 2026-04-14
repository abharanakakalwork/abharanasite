import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/yoga/payment-settings
 * Public: Get active payment settings (for client checkout).
 * Admin: Get any payment settings (for dashboard).
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    let query = supabaseAdmin.from('yoga_payment_settings').select('*').limit(1);

    // If not admin, only get active settings
    if (!authHeader) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || null });
  } catch (err: any) {
    console.error('Payment settings fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/yoga/payment-settings
 * Protected: Admin only to update payment configuration.
 */
async function patchHandler(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Since we only have one active setting row, we either update by ID or just use upsert/update logic
    // We'll fetch the first one and update it
    const { data: current } = await supabaseAdmin
      .from('yoga_payment_settings')
      .select('id')
      .limit(1)
      .single();

    if (!current) {
        // Create if missing
        const { data, error } = await supabaseAdmin
            .from('yoga_payment_settings')
            .insert({ ...body, is_active: true })
            .select()
            .single();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabaseAdmin
      .from('yoga_payment_settings')
      .update(body)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Payment settings update error:', err);
    return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 });
  }
}

export const PATCH = withAuth(patchHandler);
