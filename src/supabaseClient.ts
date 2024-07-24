import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://fkupbryphsdgwgnvbomt.supabase.co';
const supabaseKey: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdXBicnlwaHNkZ3dnbnZib210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE3ODMyNzUsImV4cCI6MjAzNzM1OTI3NX0.CN802CSNw0ROsuMzYxSKh8iHFppjzwBxP-YD9af9UrE';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
