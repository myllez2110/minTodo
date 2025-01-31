import { createClient } from '@supabase/supabase-js';
// for some reason, there aren't types for the database.types file but without this, the app won't work.
//@ts-expect-error
import type { Database } from './database.types';

// Fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);