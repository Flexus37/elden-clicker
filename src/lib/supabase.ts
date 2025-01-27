import { createClient } from '@supabase/supabase-js';

// Укажи свой URL и анонимный ключ из Supabase Dashboard
const supabaseUrl = 'https://tjdmlogwqosujktaijuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZG1sb2d3cW9zdWprdGFpanVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5ODU4ODgsImV4cCI6MjA1MzU2MTg4OH0.e-PI72ddtoa0jBZu3liVUO6DioxTSD_b58v-lU6aURs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
