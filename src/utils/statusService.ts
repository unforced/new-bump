import { supabase } from './supabaseClient';
import { withErrorHandling } from './errorHandling';
import { Database } from '../types/supabase';

export type CheckIn = Database['public']['Tables']['check_ins']['Row'];
export type CheckInInsert = Database['public']['Tables']['check_ins']['Insert'];
export type Place = Database['public']['Tables']['places']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface CheckInWithDetails extends CheckIn {
  place: Place;
  profile: Profile;
}

export interface PlaceWithCheckIns {
  place: Place;
  checkIns: CheckInWithDetails[];
}

/**
 * Fetches active check-ins with place and user details
 */
export async function getActiveCheckIns() {
  return withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .is('expires_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our expected interface
    const transformedData = data?.map(item => ({
      ...item,
      place: item.places,
      profile: item.profiles
    }));
    
    return transformedData as CheckInWithDetails[];
  });
}

/**
 * Fetches active check-ins grouped by place
 */
export async function getCheckInsByPlace() {
  return withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .is('expires_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our expected interface
    const transformedData = data?.map(item => ({
      ...item,
      place: item.places,
      profile: item.profiles
    }));
    
    // Group check-ins by place
    const groupedByPlace = (transformedData || []).reduce<Record<string, PlaceWithCheckIns>>((acc, checkIn) => {
      const placeId = checkIn.place_id;
      
      if (!acc[placeId]) {
        acc[placeId] = {
          place: checkIn.place,
          checkIns: []
        };
      }
      
      acc[placeId].checkIns.push(checkIn as CheckInWithDetails);
      
      return acc;
    }, {});
    
    // Convert to array
    return Object.values(groupedByPlace);
  });
}

/**
 * Creates a new check-in
 */
export async function createCheckIn(checkIn: Omit<CheckInInsert, 'id' | 'created_at'>) {
  return withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        ...checkIn,
        // Set expiration to 2 hours from now if not provided
        expires_at: checkIn.expires_at || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      })
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match our expected interface
    const transformedData = {
      ...data,
      place: data.places,
      profile: data.profiles
    };
    
    return transformedData as CheckInWithDetails;
  });
}

/**
 * Updates an existing check-in
 */
export async function updateCheckIn(id: string, updates: Partial<CheckInInsert>) {
  return withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('check_ins')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match our expected interface
    const transformedData = {
      ...data,
      place: data.places,
      profile: data.profiles
    };
    
    return transformedData as CheckInWithDetails;
  });
}

/**
 * Deletes a check-in (or marks it as expired)
 */
export async function deleteCheckIn(id: string) {
  return withErrorHandling(async () => {
    // Instead of deleting, we'll mark it as expired
    const { data, error } = await supabase
      .from('check_ins')
      .update({ expires_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as CheckIn;
  });
} 