import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase, isDevelopment, isTest, logError } from '../supabaseClient';

// Mock the import.meta.env
vi.mock('import.meta.env', () => ({
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-key',
  DEV: true,
  MODE: 'test',
}));

// Mock the createClient function
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}));

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a Supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should detect development environment', () => {
    expect(isDevelopment()).toBe(true);
  });

  it('should detect test environment', () => {
    expect(isTest()).toBe(true);
  });

  it('should log errors in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    
    logError('Test message', error);
    
    expect(consoleSpy).toHaveBeenCalledWith('[Supabase Error] Test message:', error);
    consoleSpy.mockRestore();
  });
}); 