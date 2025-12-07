
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kvuwggbizihgwfyfullt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXdnZ2JpemloZ3dmeWZ1bGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODE5MDQsImV4cCI6MjA3NjU1NzkwNH0.ApXVOZ2gE04dA8W9KQC8k6Nd1frE-SUJZf7pzkacEMA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
