import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      bookingData // Full booking details to save
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay details' }, { status: 400 });
    }

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Signature is valid - Create/Update booking in Supabase
    // If bookingData is provided, we create a new entry
    if (bookingData) {
        const { 
            booking_type,
            reference_id,
            user_name, 
            user_email, 
            user_phone, 
            amount, 
            gst_amount, 
            total_amount, 
            metadata 
        } = bookingData;

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .insert({
                booking_type,
                reference_id,
                user_name,
                user_email,
                user_phone,
                amount,
                gst_amount,
                total_amount,
                payment_reference: razorpay_payment_id,
                payment_status: 'paid',
                booking_status: 'confirmed',
                metadata: {
                    ...metadata,
                    razorpay_order_id,
                    razorpay_payment_id
                }
            })
            .select()
            .single();

        if (error) {
            console.error('[Supabase Booking Error]:', error);
            // Even if DB update fails, the payment was successful. 
            // We should probably log this and return a partial success or retry.
            return NextResponse.json({ 
                error: 'Payment verified but failed to save booking', 
                details: error.message,
                payment_id: razorpay_payment_id 
            }, { status: 500 });
        }

        // Handle specific logic (e.g., yoga session booked_count update)
        if (booking_type === 'yoga') {
            const { data: session } = await supabaseAdmin
                .from('yoga_sessions')
                .select('booked_count')
                .eq('id', reference_id)
                .single();
            
            await supabaseAdmin
                .from('yoga_sessions')
                .update({ booked_count: (session?.booked_count || 0) + 1 })
                .eq('id', reference_id);
        }

        return NextResponse.json({ success: true, booking: data });
    }

    return NextResponse.json({ success: true, message: 'Payment verified' });

  } catch (error: any) {
    console.error('[Razorpay Verify Error]:', error);
    return NextResponse.json({ 
        error: 'Verification failed', 
        details: error.message 
    }, { status: 500 });
  }
}
