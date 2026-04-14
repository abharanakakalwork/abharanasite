import { supabaseAdmin } from '../lib/supabase-admin';

async function checkOfferings() {
  try {
    const { data, error } = await supabaseAdmin.from('yoga_offerings').select('*').limit(1);
    if (error) {
      console.error('Error fetching yoga_offerings:', error);
    } else {
      console.log('yoga_offerings columns:', Object.keys(data[0] || {}));
    }
  } catch (err) {
    console.error('Check failed:', err);
  }
}

checkOfferings();
