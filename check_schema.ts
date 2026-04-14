import { supabaseAdmin } from './lib/supabase-admin';

async function checkSchema() {
  try {
    console.log('--- CHECKING BOOKINGS TABLE ---');
    const { data: bookings, error: bErr } = await supabaseAdmin.from('bookings').select('*').limit(1);
    if (bErr) console.error('Bookings Fetch Error:', bErr);
    else console.log('Bookings Sample:', bookings);

    console.log('--- CHECKING YOGA_BOOKINGS TABLE ---');
    const { data: yoga, error: yErr } = await supabaseAdmin.from('yoga_bookings').select('*').limit(1);
    if (yErr) console.error('Yoga Bookings Fetch Error:', yErr);
    else console.log('Yoga Bookings Sample:', yoga);

  } catch (err) {
    console.error('Schema check failed:', err);
  }
}

checkSchema();
