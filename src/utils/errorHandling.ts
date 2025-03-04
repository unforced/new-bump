import { logError } from './supabaseClient';

/**
 * Formats a Supabase error for user-friendly display
 */
export const formatSupabaseError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    // Handle Supabase error object
    if ('message' in error && typeof error.message === 'string') {
      // Common error messages that need better formatting
      if (error.message.includes('Email not confirmed')) {
        return 'Please check your email for the verification code.';
      }
      if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or verification code.';
      }
      if (error.message.includes('Rate limit exceeded')) {
        return 'Too many attempts. Please try again later.';
      }
      if (error.message.includes('JWT expired')) {
        return 'Your session has expired. Please log in again.';
      }
      
      // Return the error message directly if it's user-friendly
      return error.message;
    }
    
    // Handle error code if available
    if ('code' in error && typeof error.code === 'string') {
      switch (error.code) {
        case '42501':
          return 'You don\'t have permission to perform this action.';
        case '23505':
          return 'This record already exists.';
        case '23503':
          return 'This operation references a record that doesn\'t exist.';
        default:
          return `Database error: ${error.code}`;
      }
    }
  }
  
  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Wraps a database operation with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation();
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = formatSupabaseError(error);
    logError('Database operation failed', error);
    return { data: null, error: errorMessage };
  }
} 