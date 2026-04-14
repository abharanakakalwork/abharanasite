import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/with-auth';

/**
 * GET /api/enquiries
 * Protected: Admin only to list all enquiries.
 * Query Parameters: ?status=pending
 */
async function getHandler(req: NextRequest, { admin }: any) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: enquiries, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data: enquiries });
  } catch (err: any) {
    console.error('Enquiry list error:', err);
    return NextResponse.json({ error: 'Failed to fetch enquiries', details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/enquiries
 * Public: Anyone can submit an enquiry.
 * Body: { name, email, phone, message }
 */
export async function POST(req: Request) {
  try {
    const { name, email, phone, message, interest } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const { data: enquiry, error } = await supabaseAdmin
      .from('enquiries')
      .insert({ 
        name, 
        email, 
        phone, 
        message, 
        interest,
        status: 'pending' 
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Enquiry submitted successfully', data: enquiry });
  } catch (err: any) {
    console.error('Enquiry submission error:', err);
    return NextResponse.json({ error: 'Failed to submit enquiry', details: err.message }, { status: 500 });
  }
}

// Ensure the GET method is protected by the withAuth wrapper
export const GET = withAuth(getHandler);
