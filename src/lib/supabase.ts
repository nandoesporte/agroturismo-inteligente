
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jigeusdwsfwstggdngww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZ2V1c2R3c2Z3c3RnZ2RuZ3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzQwMjAsImV4cCI6MjA1NzA1MDAyMH0.2siRBuB_rN3rKCRVgb8A3ChwSnKipRFafuGW2Cb5ZT0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
