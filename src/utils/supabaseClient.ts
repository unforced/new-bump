import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'bump_auth',
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Helper function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

// Helper function to check if we're in test mode
export const isTest = (): boolean => {
  return import.meta.env.MODE === 'test';
};

// Helper function to log errors in development
export const logError = (message: string, error: unknown): void => {
  if (isDevelopment() || isTest()) {
    console.error(`[Supabase Error] ${message}:`, error);
  }
}; 