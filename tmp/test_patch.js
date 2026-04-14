const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkkfqjaqexjfndenjpfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2ZxamFxZXhqZm5kZW5qcGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAzNTc4NiwiZXhwIjoyMDkwNjExNzg2fQ.T3sWAnbiwiQKmxEgE566SfW9S6pjNdzlGY5EeuK-3Jw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPatch() {
    const id = '3c968e64-d0ea-49d3-b64a-44632707cfa4';
    const payload = { 
        payment_status: 'paid', 
        booking_status: 'confirmed',
        confirmed_at: new Date().toISOString()
    };
    
    console.log('Testing update for ID:', id);
    const { data, error } = await supabase
        .from('yoga_bookings')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        console.log('UPDATE_ERROR:', error.message, '| CODE:', error.code, '| DETAILS:', error.details, '| HINT:', error.hint);
    } else {
        console.log('UPDATE_SUCCESS:', data);
    }
}

testPatch();
