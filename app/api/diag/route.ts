import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Attempt to describe the table by trying a query that likely fails but gives info
    // or just checking if we can select from it.
    const { data, error } = await supabaseAdmin
      .from('course_enrollments')
      .select('*')
      .limit(1);

    if (error) {
       return NextResponse.json({ 
         error: error.message, 
         code: error.code,
         hint: error.hint,
         details: error.details 
       }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      columns: data && data.length > 0 ? Object.keys(data[0]) : "No data to check columns",
      data 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
