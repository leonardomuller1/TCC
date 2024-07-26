import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://fkupbryphsdgwgnvbomt.supabase.co';
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdXBicnlwaHNkZ3dnbnZib210Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTc4MzI3NSwiZXhwIjoyMDM3MzU5Mjc1fQ.SDOTqbj42VCBp-IqWSn1nAAgiBPUQG6r1WkyDGf6bjc';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
