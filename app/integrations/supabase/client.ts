
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = "https://kvuwggbizihgwfyfullt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXdnZ2JpemloZ3dmeWZ1bGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODE5MDQsImV4cCI6MjA3NjU1NzkwNH0.ApXVOZ2gE04dA8W9KQC8k6Nd1frE-SUJZf7pzkacEMA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// For non-native platforms (web), we use the default storage (localStorage)
// For native platforms, this file should not be used - use client.native.ts instead
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Only use localStorage on web
    ...(Platform.OS === 'web' ? {} : { storage: undefined }),
  },
});
