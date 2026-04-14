import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * PATCH /api/bookings/[id]
 * Updates booking or payment status.
 */
async function patchHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { payment_status, booking_status, is_legacy } = body;

    if (!id) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

    const updateData: any = {};
    if (payment_status) {
        updateData.payment_status = payment_status;
        if (payment_status === 'verified' || payment_status === 'paid') {
            updateData.booking_status = 'confirmed';
            updateData.payment_status = is_legacy ? 'paid' : 'verified'; 
        }
    }
    if (booking_status) updateData.booking_status = booking_status;

    let res;
    if (is_legacy) {
        res = await supabaseAdmin
            .from('yoga_bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
    } else {
        res = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
    }

    if (res.error) throw res.error;

    return NextResponse.json({ success: true, data: res.data });
  } catch (err: any) {
    console.error('[Booking Update Error]:', err);
    return NextResponse.json({ error: 'Failed to update booking', details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/bookings/[id]
 */
async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(req.url);
        const is_legacy = searchParams.get('is_legacy') === 'true';

        let res;
        if (is_legacy) {
            res = await supabaseAdmin.from('yoga_bookings').delete().eq('id', id);
        } else {
            res = await supabaseAdmin.from('bookings').delete().eq('id', id);
        }

        if (res.error) throw res.error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Deletion failed', details: err.message }, { status: 500 });
    }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
