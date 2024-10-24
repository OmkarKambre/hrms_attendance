// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drgxkyeeuudkvspgbypx.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZ3hreWVldXVka3ZzcGdieXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTQwMTEsImV4cCI6MjA0NDU5MDAxMX0.f2fyiN8bWV2puaiHjAPXac3VWAqC-x-7sdlRavmW08Q'; // Replace with your Supabase Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
