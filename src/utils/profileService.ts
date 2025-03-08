import { supabase } from './supabaseClient';
import { withErrorHandling } from './errorHandling';
import { UserProfile } from '../types/auth';

/**
 * Fetches a user profile by ID
 */
export async function getProfile(userId: string) {
  return withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    
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
export async function updateProfile(userId: string, profile: Partial<UserProfile>) {
  return withErrorHandling(async () => {
    // Check if profile exists
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as UserProfile;
    }
    
    // Otherwise, update the existing profile
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return data as UserProfile;
  });
}

/**
 * Ensures a user profile exists, creating it if it doesn't
 */
export async function upsertProfile(profile: Omit<UserProfile, 'created_at'>) {
  return withErrorHandling(async () => {
    // First try to get the profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single();
    
    // If profile exists, update it
    if (existingProfile) {
      return updateProfile(profile.id, profile);
    }
    
    // Otherwise, create a new profile
    return createProfile(profile);
  });
}

/**
 * Gets a user profile by ID
 */
export async function getProfileById(userId: string) {
  return withErrorHandling(async () => {
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
 * Gets a user profile by email
 */
export async function getProfileByEmail(email: string) {
  return withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    
    return data as UserProfile;
  });
} 