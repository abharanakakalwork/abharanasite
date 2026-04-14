import { supabaseAdmin } from './lib/supabase-admin.js';

async function checkSchema() {
  const { data, error } = await supabaseAdmin.from('retreats').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log('Columns:', Object.keys(data[0] || {}));
  }
}

checkSchema();
