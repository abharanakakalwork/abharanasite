
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Attempting to add slug column to retreats table...');
  // We can't run arbitrary SQL via the client unless there's an RPC or we use a hack.
  // But we can check if it exists or try to update a record with a new field.
  
  const { data, error } = await supabase.from('retreats').select('*').limit(1);
  if (error) {
    console.error('Error fetching retreats:', error);
    return;
  }
  
  console.log('Sample retreat:', data[0]);
  
  // Try to update with a 'slug' field to see if it exists
  const testSlug = 'test-slug-' + Date.now();
  const { error: updateError } = await supabase
    .from('retreats')
    .update({ slug: testSlug })
    .eq('id', data[0].id);
    
  if (updateError) {
    console.log('Slug column likely does not exist yet:', updateError.message);
  } else {
    console.log('Slug column already exists!');
  }
}

run();
