import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPlaces, createPlace, updatePlace, deletePlace } from '../placeService';

// Mock the Supabase client
vi.mock('../supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      auth: {
        getUser: vi.fn(() => Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null
        }))
      }
    },
    logError: vi.fn()
  };
});

// Import the mocked module
import * as supabaseModule from '../supabaseClient';

describe('placeService', () => {
  const mockPlaces = [
    {
      id: 'place-1',
      name: 'Coffee Shop',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.0060,
      created_by: 'test-user-id',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      google_place_id: 'google-place-1'
    },
    {
      id: 'place-2',
      name: 'Park',
      address: '456 Park Ave',
      lat: 40.7580,
      lng: -73.9855,
      created_by: 'test-user-id',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      google_place_id: 'google-place-2'
    }
  ];

  const mockPlace = {
    id: 'new-place-id',
    name: 'New Place',
    address: '789 New St',
    lat: 40.7000,
    lng: -74.0000,
    created_by: 'test-user-id',
    created_at: '2025-03-08T00:00:00.000Z',
    updated_at: null,
    google_place_id: 'google-place-3'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getPlaces', () => {
    it('should fetch places for the current user', async () => {
      // Mock the Supabase response
      const mockResponse = { data: mockPlaces, error: null };
      
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(mockResponse)
        })
      });

      // Call the function
      const result = await getPlaces();

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('places');
      expect(result.data).toEqual(mockPlaces);
      expect(result.error).toBeNull();
    });

    it('should handle errors when fetching places', async () => {
      // Setup mock with error
      const mockError = 'An unexpected error occurred. Please try again.';
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({ data: null, error: 'Error fetching places' })
        })
      });

      // Call the function
      const result = await getPlaces();

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('createPlace', () => {
    it('should create a new place', async () => {
      // Setup mock
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(Promise.resolve({
              data: mockPlace,
              error: null
            }))
          })
        })
      });

      // Create place data
      const placeData = {
        name: 'New Place',
        address: '789 New St',
        lat: 40.7000,
        lng: -74.0000,
        google_place_id: 'google-place-3'
      };

      // Call the function
      const result = await createPlace(placeData);

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('places');
      expect(result.data).toEqual(mockPlace);
      expect(result.error).toBeNull();
    });

    it('should handle errors when creating a place', async () => {
      // Setup mock with error
      const mockError = { message: 'Error creating place' };
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(Promise.resolve({
              data: null,
              error: mockError
            }))
          })
        })
      });

      // Create place data
      const placeData = {
        name: 'New Place',
        address: '789 New St',
        lat: 40.7000,
        lng: -74.0000,
        google_place_id: 'google-place-3'
      };

      // Call the function
      const result = await createPlace(placeData);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('updatePlace', () => {
    it('should update an existing place', async () => {
      // Setup mock
      const updatedPlace = { ...mockPlace, name: 'Updated Place' };
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(Promise.resolve({
                data: updatedPlace,
                error: null
              }))
            })
          })
        })
      });

      // Update place data
      const placeId = 'new-place-id';
      const updateData = {
        name: 'Updated Place'
      };

      // Call the function
      const result = await updatePlace(placeId, updateData);

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('places');
      expect(result.data).toEqual(updatedPlace);
      expect(result.error).toBeNull();
    });

    it('should handle errors when updating a place', async () => {
      // Setup mock with error
      const mockError = { message: 'Error updating place' };
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(Promise.resolve({
                data: null,
                error: mockError
              }))
            })
          })
        })
      });

      // Update place data
      const placeId = 'new-place-id';
      const updateData = {
        name: 'Updated Place'
      };

      // Call the function
      const result = await updatePlace(placeId, updateData);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('deletePlace', () => {
    it('should delete a place', async () => {
      // Setup mock
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(Promise.resolve({
            data: { id: 'new-place-id' },
            error: null
          }))
        })
      });

      // Call the function
      const result = await deletePlace('new-place-id');

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('places');
      expect(result.data).toEqual({ id: 'new-place-id' });
      expect(result.error).toBeNull();
    });

    it('should handle errors when deleting a place', async () => {
      // Setup mock with error
      const mockError = 'An unexpected error occurred. Please try again.';
      const mockFrom = supabaseModule.supabase.from as any;
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(Promise.resolve({
            data: null,
            error: 'Error deleting place'
          }))
        })
      });

      // Call the function
      const result = await deletePlace('new-place-id');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });
}); 