import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / fallback keys - configurable via .env or in-app Settings
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ehjnqotimozfudnfzwom.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  try {
    const savedUrl = localStorage.getItem('krunchy_supabase_url');
    const savedKey = localStorage.getItem('krunchy_supabase_anon_key');
    return {
      url: savedUrl || DEFAULT_SUPABASE_URL,
      anonKey: savedKey || DEFAULT_SUPABASE_ANON_KEY
    };
  } catch (e) {
    return {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY
    };
  }
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  try {
    localStorage.setItem('krunchy_supabase_url', url.trim());
    localStorage.setItem('krunchy_supabase_anon_key', anonKey.trim());
    initSupabaseClient();
  } catch (e) {
    console.error('Failed to save Supabase config in localStorage', e);
  }
};

let currentClient: SupabaseClient | null = null;

export const initSupabaseClient = (): SupabaseClient => {
  const config = getStoredSupabaseConfig();
  
  try {
    currentClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  } catch (error) {
    console.warn('Failed to initialize Supabase client with current credentials:', error);
    // Create minimal client to avoid crashing UI
    currentClient = createClient('https://placeholder.supabase.co', 'placeholder');
  }

  return currentClient;
};

// Initial instance
export const supabase = initSupabaseClient();

export const testSupabaseConnection = async (url?: string, key?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const client = (url && key) 
      ? createClient(url, key) 
      : (currentClient || initSupabaseClient());

    // Simple test query to check health
    const { error } = await client.from('restaurant_settings').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, check basic auth endpoint
      const { error: authError } = await client.auth.getSession();
      if (authError) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }
      return { success: true, message: 'Connected to Supabase project! (Tables not yet initialized)' };
    }

    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Could not connect to Supabase.' };
  }
};

