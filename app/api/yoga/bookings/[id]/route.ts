import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { sendBookingEmail } from '@/lib/api/email';

/**
 * PATCH /api/yoga/bookings/[id]
 * Protected: Admin only to update booking status and verify payment.
 */
async function patchHandler(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('[PATCH_BOOKING_START]', { id: params.id });
  try {
    const id = params.id;
    const body = await req.json();
    console.log('[PATCH_BOOKING_BODY]', body);
    const { payment_status, booking_status } = body;

    // 1. Fetch current booking to get user details for email
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('yoga_bookings')
      .select('*, yoga_sessions(*, yoga_offerings(*))')
      .eq('id', id)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 2. Update the booking
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('yoga_bookings')
      .update({ 
        payment_status, 
        booking_status,
        confirmed_at: booking_status === 'confirmed' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Trigger Email Notification (Background-ish)
    if (booking_status === 'confirmed' || booking_status === 'rejected') {
        console.log('[PATCH_BOOKING_EMAIL_TRIGGER]', booking_status);
        const session = booking.yoga_sessions;
        const offering = session?.yoga_offerings;
        
        // We do not await this to prevent email failures from blocking the success response
        sendBookingEmail(booking.user_email, {
            userName: booking.user_name,
            offeringTitle: offering?.title || 'Yoga Practice',
            sessionDate: session?.session_date || '',
            startTime: session?.start_time || '',
            totalAmount: booking.total_amount,
            status: booking_status as any,
            type: 'receipt',
            referenceCode: booking.payment_reference
        }).catch(emailErr => {
            console.error('[EMAIL_LOG_FAILURE] Deferred email failed:', emailErr);
        });
    }

    console.log('[PATCH_BOOKING_SUCCESS]');
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Yoga booking update error:', err);
    return NextResponse.json({ 
        error: 'Failed to update booking', 
        details: err.message,
        supabaseError: err.details || err.hint || null
    }, { status: 500 });
  }
}

/**
 * DELETE /api/yoga/bookings/[id]
 * Protected: Admin only to delete a booking record.
 */
async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const id = params.id;
      const { error } = await supabaseAdmin
        .from('yoga_bookings')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error('Yoga booking delete error:', err);
      return NextResponse.json({ error: 'Failed to delete booking', details: err.message }, { status: 500 });
    }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
