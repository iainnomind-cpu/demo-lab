import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Solo para Supabase Auth (login/logout). Los datos van por la API Express.
export const supabase = createClient(url, key);
