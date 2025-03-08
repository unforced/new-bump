import { supabase, logError } from './supabaseClient';
import { withErrorHandling } from './errorHandling';
import { v4 as uuidv4 } from 'uuid';

// Define the Place interface
export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  created_by: string;
  created_at: string;
  updated_at: string | null;
  google_place_id: string | null;
}

// Define the PlaceInput interface for creating/updating places
export interface PlaceInput {
  name: string;
  address: string;
  lat: number;
  lng: number;
  google_place_id?: string | null;
}

/**
 * Fetches all places for the current user
 * @returns A promise with the places data or an error
 */
export async function getPlaces() {
  return withErrorHandling(async () => {
    // Get the current user
    const { error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    // Fetch places
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data as Place[];
  });
}

/**
 * Creates a new place
 * @param place The place data to create
 * @returns A promise with the created place data or an error
 */
export const createPlace = async (place: PlaceInput) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logError('Error getting user', userError);
      return { data: null, error: userError };
    }
    
    const userId = userData.user.id;
    
    const { data, error } = await supabase
      .from('places')
      .insert({
        ...place,
        id: uuidv4(),
        created_by: userId
      })
      .select()
      .single();
    
    if (error) {
      logError('Error creating place', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    logError('Unexpected error in createPlace', error);
    return { data: null, error };
  }
};

/**
 * Updates an existing place
 * @param id The ID of the place to update
 * @param updates The place data to update
 * @returns A promise with the updated place data or an error
 */
export const updatePlace = async (id: string, updates: Partial<PlaceInput>) => {
  try {
    const { data, error } = await supabase
      .from('places')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logError('Error updating place', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    logError('Unexpected error in updatePlace', error);
    return { data: null, error };
  }
};

/**
 * Deletes a place
 * @param id The ID of the place to delete
 * @returns A promise with the deleted place ID or an error
 */
export async function deletePlace(id: string) {
  return withErrorHandling(async () => {
    // Check if the place exists and the user has permission to delete it
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { id };
  });
} 