import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Sanitizes the Supabase Project URL.
 * Automatically strips accidental `/rest/v1`, `/auth/v1`, and trailing slashes.
 */
export const cleanSupabaseUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // Strip /rest/v1 or /auth/v1 or /v1 accidentally pasted from REST endpoint docs
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/auth\/v1\/?$/i, '');
  return url.replace(/\/+$/, '');
};

// Default / fallback keys - configurable via .env or in-app Settings
const DEFAULT_SUPABASE_URL = cleanSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || 'https://uzndcajxgiotvkefuqkx.supabase.co');
const DEFAULT_SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Br6TrjMqZJiqrMKRq4bR2g_2bi-odnw').trim();

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  try {
    const savedUrl = localStorage.getItem('krunchy_supabase_url');
    const savedKey = localStorage.getItem('krunchy_supabase_anon_key');
    const url = cleanSupabaseUrl(savedUrl || DEFAULT_SUPABASE_URL);
    const anonKey = (savedKey || DEFAULT_SUPABASE_ANON_KEY).trim();

    // Self-heal localStorage if it was previously saved with /rest/v1
    if (savedUrl && savedUrl !== url) {
      localStorage.setItem('krunchy_supabase_url', url);
    }

    return {
      url,
      anonKey
    };
  } catch (e) {
    return {
      url: cleanSupabaseUrl(DEFAULT_SUPABASE_URL),
      anonKey: DEFAULT_SUPABASE_ANON_KEY.trim()
    };
  }
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  try {
    const cleanedUrl = cleanSupabaseUrl(url);
    localStorage.setItem('krunchy_supabase_url', cleanedUrl);
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
      ? createClient(cleanSupabaseUrl(url), key.trim()) 
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

