import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPlaces, createPlace, updatePlace, deletePlace, PlaceInput } from '../placeService';
import { supabase } from '../supabaseClient';

// Skip tests if not running integration tests
const itif = process.env.RUN_INTEGRATION_TESTS ? it : it.skip;

describe('placeService integration tests', () => {
  let testPlaceId: string | null = null;
  
  // Test place data
  const testPlace: PlaceInput = {
    name: 'Test Place',
    address: '123 Test St, Test City',
    lat: 40.7128,
    lng: -74.0060,
    google_place_id: 'test-google-place-id'
  };
  
  // Clean up any test places before starting
  beforeAll(async () => {
    // Ensure we're authenticated
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      throw new Error('Not authenticated. Please run tests with a valid session.');
    }
    
    // Clean up any existing test places
    const { data } = await supabase
      .from('places')
      .delete()
      .eq('name', 'Test Place')
      .select();
      
    console.log(`Cleaned up ${data?.length || 0} existing test places`);
  });
  
  // Clean up after all tests
  afterAll(async () => {
    if (testPlaceId) {
      await supabase
        .from('places')
        .delete()
        .eq('id', testPlaceId);
      
      console.log(`Cleaned up test place with ID: ${testPlaceId}`);
    }
  });
  
  itif('should create a new place', async () => {
    const { data, error } = await createPlace(testPlace);
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.name).toBe(testPlace.name);
    expect(data?.address).toBe(testPlace.address);
    expect(data?.lat).toBe(testPlace.lat);
    expect(data?.lng).toBe(testPlace.lng);
    expect(data?.google_place_id).toBe(testPlace.google_place_id);
    expect(data?.id).toBeDefined();
    
    // Save the ID for later tests
    if (data) {
      testPlaceId = data.id;
    }
  });
  
  itif('should fetch places including the test place', async () => {
    // Skip if we don't have a test place ID
    if (!testPlaceId) {
      console.warn('Skipping test because no test place was created');
      return;
    }
    
    const { data, error } = await getPlaces();
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
    
    // Find our test place
    const foundPlace = data?.find(place => place.id === testPlaceId);
    expect(foundPlace).toBeDefined();
    expect(foundPlace?.name).toBe(testPlace.name);
  });
  
  itif('should update an existing place', async () => {
    // Skip if we don't have a test place ID
    if (!testPlaceId) {
      console.warn('Skipping test because no test place was created');
      return;
    }
    
    const updates = {
      name: 'Updated Test Place',
      address: '456 Updated St, Test City'
    };
    
    const { data, error } = await updatePlace(testPlaceId, updates);
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.name).toBe(updates.name);
    expect(data?.address).toBe(updates.address);
    // These should remain unchanged
    expect(data?.lat).toBe(testPlace.lat);
    expect(data?.lng).toBe(testPlace.lng);
  });
  
  itif('should delete an existing place', async () => {
    // Skip if we don't have a test place ID
    if (!testPlaceId) {
      console.warn('Skipping test because no test place was created');
      return;
    }
    
    const { data, error } = await deletePlace(testPlaceId);
    
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.id).toBe(testPlaceId);
    
    // Verify it's gone
    const { data: places } = await getPlaces();
    const foundPlace = places?.find(place => place.id === testPlaceId);
    expect(foundPlace).toBeUndefined();
    
    // Clear the ID since we've deleted it
    testPlaceId = null;
  });
}); 