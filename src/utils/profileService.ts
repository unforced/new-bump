import { supabase } from './supabaseClient';
import { withErrorHandling } from './errorHandling';
import { UserProfile } from '../types/auth';

/**
 * Fetches a user profile by ID
 */
export async function getProfile(userId: string) {
  return withErrorHandling(async () => {
    // Check if the profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data as UserProfile;
  });
}

/**
 * Creates a new user profile
 */
export async function createProfile(profile: Omit<UserProfile, 'created_at'>) {
  return withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        email: profile.email,
        username: profile.username,
        phone: profile.phone,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data as UserProfile;
  });
}

/**
 * Updates an existing user profile
 */
export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  return withErrorHandling(async () => {
    // Check if the profile exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (checkError) throw checkError;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as UserProfile;
  });
}

/**
 * Ensures a user profile exists, creating it if it doesn't
 */
export async function upsertProfile(profile: Omit<UserProfile, 'created_at'>) {
  return withErrorHandling(async () => {
    // Check if the profile exists
    const { error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single();
    
    if (error) {
      // If the profile doesn't exist, create it
      if (error.message.includes('No rows found')) {
        return createProfile(profile);
      }
      throw error;
    }
    
    // If the profile exists, update it
    return updateProfile(profile.id, profile);
  });
}

export async function getProfileByUsername(username: string) {
  return withErrorHandling(async () => {
    // Check if the profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    
    return data as UserProfile;
  });
} 