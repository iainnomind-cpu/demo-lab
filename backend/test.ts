import 'dotenv/config';
import { supabase } from './src/services/supabase';

async function run() {
  console.log('Testing Supabase query...');
  const { data, error } = await supabase.from('sucursales').select('*');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Data:', data);
  }
}

run();
