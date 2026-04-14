import { supabaseAdmin } from '../lib/supabase-admin';

async function check() {
  const { data, error } = await supabaseAdmin.from('pages').select('*');
  console.log('Pages:', data, error);
  
  const { data: dl, error: dlErr } = await supabaseAdmin.from('downloads').select('*');
  console.log('Downloads:', dl, dlErr);
}

check();
