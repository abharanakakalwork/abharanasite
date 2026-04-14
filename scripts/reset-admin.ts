import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdmin(email: string, password: string) {
  try {
    console.log(`Setting password for ${email}...`);
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Update or Insert the admin
    const { data, error } = await supabase
      .from('admins')
      .upsert({ 
        email, 
        password_hash: hash 
      }, { onConflict: 'email' })
      .select();

    if (error) {
      console.error('Error updating admin:', error);
      return;
    }

    console.log('Admin password updated successfully!');
    console.log('Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Default values
const adminEmail = process.argv[2] || 'admin@abharanakakal.com';
const newPassword = process.argv[3] || 'admin123';

resetAdmin(adminEmail, newPassword);
