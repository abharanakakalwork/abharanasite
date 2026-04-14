import { supabaseAdmin } from './lib/supabase-admin';

async function check() {
  try {
    const { data, error } = await supabaseAdmin.from('pages').select('*');
    console.log('Pages:', data, error);
    
    const { data: dl, error: dlErr } = await supabaseAdmin.from('downloads').select('*');
    console.log('Downloads:', dl, dlErr);
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
