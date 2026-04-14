import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
    });
  } catch (error: any) {
    console.error('[Razorpay Order Error]:', error);
    return NextResponse.json({ 
        error: 'Failed to create order', 
        details: error.message 
    }, { status: 500 });
  }
}
