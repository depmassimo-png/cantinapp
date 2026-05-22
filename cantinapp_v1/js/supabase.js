// ============================================================
// CantinApp — Supabase client
// ============================================================

const SUPABASE_URL = 'https://cihnssnqlqydnckwispb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaG5zc25xbHF5ZG5ja3dpc3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDM3NjksImV4cCI6MjA5NTAxOTc2OX0.ptxM667Y1d8fOqpVwD4HhX87zsHzo-oAh45M8MP2Bwc';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
