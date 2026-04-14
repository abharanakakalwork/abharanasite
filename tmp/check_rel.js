const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkkfqjaqexjfndenjpfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2ZxamFxZXhqZm5kZW5qcGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAzNTc4NiwiZXhwIjoyMDkwNjExNzg2fQ.T3sWAnbiwiQKmxEgE566SfW9S6pjNdzlGY5EeuK-3Jw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRelationships() {
    const id = '3c968e64-d0ea-49d3-b64a-44632707cfa4';
    // Test with singular and plural
    const test1 = await supabase.from('yoga_bookings').select('*, yoga_sessions(*)').eq('id', id).single();
    console.log('Singular sessions:', !!test1.data, test1.error?.message);
    
    const test2 = await supabase.from('yoga_bookings').select('*, yoga_session(*)').eq('id', id).single();
    console.log('Plural session:', !!test2.data, test2.error?.message);
}

checkRelationships();
