const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkkfqjaqexjfndenjpfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2ZxamFxZXhqZm5kZW5qcGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAzNTc4NiwiZXhwIjoyMDkwNjExNzg2fQ.T3sWAnbiwiQKmxEgE566SfW9S6pjNdzlGY5EeuK-3Jw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulatePatch() {
    const id = '3c968e64-d0ea-49d3-b64a-44632707cfa4';
    const payment_status = 'paid';
    const booking_status = 'confirmed';
    
    try {
        // 1. Fetch
        console.log('Fetching booking...');
        const { data: booking, error: fetchErr } = await supabase
          .from('yoga_bookings')
          .select('*, yoga_sessions(*, yoga_offerings(*))')
          .eq('id', id)
          .single();
        
        if (fetchErr) {
            console.log('FETCH_ERROR:', fetchErr);
            return;
        }
        console.log('Fetch Success. Session exists:', !!booking.yoga_sessions);

        // 2. Update
        console.log('Updating booking...');
        const { data: updated, error: updateErr } = await supabase
          .from('yoga_bookings')
          .update({ 
            payment_status, 
            booking_status,
            confirmed_at: booking_status === 'confirmed' ? new Date().toISOString() : null
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateErr) {
            console.log('UPDATE_ERROR:', updateErr);
            return;
        }
        console.log('Update Success.');

    } catch (err) {
        console.error('SYNTAX/RUNTIME_ERROR:', err);
    }
}

simulatePatch();
