import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateStudentSession } from '@/lib/student-auth';
import crypto from 'crypto';

/**
 * POST /api/courses/enroll
 * Body: { courseId, paymentId, orderId, signature, amount }
 * 1. Validates student session via JWT.
 * 2. Verifies Razorpay signature.
 * 3. Records enrollment in DB.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    
    // 1. Validate session
    const student = await validateStudentSession(token);
    if (!student) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const body = await req.json();
    const { courseId, paymentId, orderId, signature, amount } = body;

    // 2. Verify Razorpay Signature
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    if (rzpSecret) {
      const generated_signature = crypto
        .createHmac('sha256', rzpSecret)
        .update(orderId + "|" + paymentId)
        .digest('hex');

      if (generated_signature !== signature) {
        return NextResponse.json({ error: 'Payment signature mismatch' }, { status: 400 });
      }
    } else {
      console.warn('RAZORPAY_KEY_SECRET missing. Skipping verification (dev mode?).');
    }

    // 2.5 Fetch Course Details for metadata
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    const courseTitle = course?.title || 'Unknown Course';

    // 3. Create Enrollment record
    const { data: enrollment, error } = await supabaseAdmin
      .from('course_enrollments')
      .upsert({
        student_id: student.studentId,
        course_id: courseId,
        payment_id: paymentId,
        amount: amount,
        status: 'paid'
      }, { onConflict: 'student_id, course_id' })
      .select()
      .single();

    if (error) {
      console.error('[Enrollment Error]:', error);
      throw error;
    }

    // 4. Mirror in Unified Bookings Table for Admin Dashboard
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_type: 'course',
        reference_id: courseId,
        user_name: student.name,
        user_email: student.email,
        amount: amount,
        total_amount: amount, // Assuming inclusive or handle separately if needed
        payment_reference: paymentId,
        payment_status: 'paid',
        booking_status: 'confirmed',
        metadata: {
          item_title: courseTitle,
          course_id: courseId,
          order_id: orderId,
          type_label: 'Course Enrollment'
        }
      });

    if (bookingError) {
      console.error('[Booking Mirror Error]:', bookingError);
      // We don't throw here to avoid failing enrollment if mirror fails, but ideal for logs
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome to the sanctuary!', 
      data: enrollment 
    });

  } catch (err: any) {
    console.error('[Enroll API Error]:', err);
    return NextResponse.json({ 
      error: 'Failed to complete enrollment', 
      details: err.message || 'Unknown error',
      supabase_error: err.code || err.details
    }, { status: 500 });
  }
}
