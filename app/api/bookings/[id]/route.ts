import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';
import { calculateExpiryDate, calculateReminderDate, formatDateLocal } from '@/lib/utils';
import { sendBookingEmail, sendMembershipReminderEmail } from '@/lib/api/email';

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
    if (payment_status) updateData.payment_status = payment_status;
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

    const updatedBooking = res.data;

    // Trigger Notifications & Scheduling on Confirmation
    if (booking_status === 'confirmed' && updatedBooking) {
        // 1. Send Immediate Confirmation Email
        // For yoga_monthly, session info is virtual
        sendBookingEmail(updatedBooking.user_email, {
            userName: updatedBooking.user_name,
            offeringTitle: updatedBooking.metadata?.item_title || 'Yoga Practice',
            sessionDate: updatedBooking.booking_type === 'yoga_monthly' ? '30 Days Membership' : (updatedBooking.metadata?.session_date || ''),
            startTime: '',
            totalAmount: updatedBooking.total_amount,
            status: 'confirmed',
            type: 'receipt',
            referenceCode: updatedBooking.payment_reference
        }).catch(err => console.error('[CONFIRM_EMAIL_FAIL]:', err));

        // 2. If Monthly, set expires_at and schedule reminder
        if (updatedBooking.booking_type === 'yoga_monthly') {
            const expires_at = calculateExpiryDate().toISOString();
            const expiryObj = new Date(expires_at);
            const reminderDate = calculateReminderDate(expiryObj);

            // Update DB with expires_at
            await supabaseAdmin
                .from('bookings')
                .update({ expires_at })
                .eq('id', id);

            // Schedule future reminder
            sendMembershipReminderEmail(updatedBooking.user_email, {
                userName: updatedBooking.user_name,
                offeringTitle: updatedBooking.metadata?.item_title || 'Yoga Practice',
                expiryDate: formatDateLocal(expiryObj)
            }, reminderDate).catch(err => console.error('[REMINDER_SCHED_FAIL]:', err));
        }
    }

    return NextResponse.json({ success: true, data: updatedBooking });

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
