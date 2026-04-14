import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventType, payload } = event;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        
        // Find the booking with this order_id in metadata and update status
        // Note: This assumes the booking was already created as 'pending' 
        // OR we are using a robust identifying system.
        
        const { data: booking, error: findError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .contains('metadata', { razorpay_order_id: orderId })
            .maybeSingle();

        if (booking && booking.payment_status !== 'paid') {
            await supabaseAdmin
                .from('bookings')
                .update({ 
                    payment_status: 'paid',
                    booking_status: 'confirmed',
                    payment_reference: payment.id 
                })
                .eq('id', booking.id);
            
            console.log(`[Razorpay Webhook] Updated booking ${booking.id} to paid`);
        }
    }

    if (eventType === 'payment.failed') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        const { data: booking } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .contains('metadata', { razorpay_order_id: orderId })
            .maybeSingle();

        if (booking) {
            await supabaseAdmin
                .from('bookings')
                .update({ payment_status: 'failed' })
                .eq('id', booking.id);
            
            console.log(`[Razorpay Webhook] Marked booking ${booking.id} as failed`);
        }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
