const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pkkfqjaqexjfndenjpfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2ZxamFxZXhqZm5kZW5qcGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAzNTc4NiwiZXhwIjoyMDkwNjExNzg2fQ.T3sWAnbiwiQKmxEgE566SfW9S6pjNdzlGY5EeuK-3Jw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPaymentCols() {
    const { data, error } = await supabase.from('yoga_payment_settings').select('*').limit(1).single();
    if (error) {
        console.log('ERROR:', error);
    } else {
        console.log('COLUMNS:', Object.keys(data));
    }
}

checkPaymentCols();
