import { describe, it, expect, vi } from 'vitest';
import { formatSupabaseError, withErrorHandling } from '../errorHandling';

// Mock the logError function
vi.mock('../supabaseClient', () => ({
  logError: vi.fn(),
}));

describe('errorHandling', () => {
  describe('formatSupabaseError', () => {
    it('should format error objects with message property', () => {
      const error = { message: 'Something went wrong' };
      expect(formatSupabaseError(error)).toBe('Something went wrong');
    });

    it('should format common Supabase error messages', () => {
      expect(formatSupabaseError({ message: 'Email not confirmed' }))
        .toBe('Please check your email for the verification code.');
      
      expect(formatSupabaseError({ message: 'Invalid login credentials' }))
        .toBe('Invalid email or verification code.');
      
      expect(formatSupabaseError({ message: 'Rate limit exceeded' }))
        .toBe('Too many attempts. Please try again later.');
      
      expect(formatSupabaseError({ message: 'JWT expired' }))
        .toBe('Your session has expired. Please log in again.');
    });

    it('should format error objects with code property', () => {
      expect(formatSupabaseError({ code: '42501' }))
        .toBe('You don\'t have permission to perform this action.');
      
      expect(formatSupabaseError({ code: '23505' }))
        .toBe('This record already exists.');
      
      expect(formatSupabaseError({ code: '23503' }))
        .toBe('This operation references a record that doesn\'t exist.');
      
      expect(formatSupabaseError({ code: 'unknown' }))
        .toBe('Database error: unknown');
    });

    it('should handle non-object errors', () => {
      expect(formatSupabaseError('string error'))
        .toBe('An unexpected error occurred. Please try again.');
      
      expect(formatSupabaseError(null))
        .toBe('An unexpected error occurred. Please try again.');
      
      expect(formatSupabaseError(undefined))
        .toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('withErrorHandling', () => {
    it('should return data on successful operation', async () => {
      const operation = vi.fn().mockResolvedValue({ id: '123', name: 'Test' });
      
      const result = await withErrorHandling(operation);
      
      expect(result).toEqual({
        data: { id: '123', name: 'Test' },
        error: null,
      });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and return formatted error message', async () => {
      // Create a database error with a specific message
      const dbError = { code: 'unknown' };
      const operation = vi.fn().mockRejectedValue(dbError);
      
      const result = await withErrorHandling(operation);
      
      expect(result).toEqual({
        data: null,
        error: 'Database error: unknown',
      });
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
}); 