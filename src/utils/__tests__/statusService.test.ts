import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../supabaseClient';
import { 
  getActiveCheckIns, 
  getCheckInsByPlace, 
  createCheckIn, 
  updateCheckIn, 
  deleteCheckIn 
} from '../statusService';

// Mock the Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        is: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      }))
    })),
  },
  logError: vi.fn(),
  isDevelopment: vi.fn().mockReturnValue(false),
}));

// Mock data
const mockCheckIn = {
  id: '123',
  user_id: 'user123',
  place_id: 'place123',
  activity: 'Working',
  privacy_level: 'public',
  created_at: '2025-03-04T12:00:00Z',
  expires_at: null,
};

const mockPlace = {
  id: 'place123',
  name: 'Coffee Shop',
  address: '123 Main St',
  lat: 40.7128,
  lng: -74.0060,
  created_at: '2025-03-01T12:00:00Z',
  created_by: 'user123',
  updated_at: null,
  google_place_id: null,
};

const mockProfile = {
  id: 'user123',
  email: 'user@example.com',
  username: 'testuser',
  avatar_url: null,
  created_at: '2025-03-01T12:00:00Z',
  updated_at: null,
  phone: null,
  status: null,
  status_updated_at: null,
};

// This is what the actual Supabase response would look like
const mockSupabaseResponse = {
  id: '123',
  user_id: 'user123',
  place_id: 'place123',
  activity: 'Working',
  privacy_level: 'public',
  created_at: '2025-03-04T12:00:00Z',
  expires_at: null,
  places: mockPlace,
  profiles: mockProfile
};

// This is what our service should return after transformation
const mockCheckInWithDetails = {
  ...mockCheckIn,
  place: mockPlace,
  profile: mockProfile,
  places: mockPlace,
  profiles: mockProfile
};

describe('statusService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveCheckIns', () => {
    it('should fetch active check-ins with place and user details', async () => {
      // Mock the Supabase response with the actual structure
      const mockResponse = {
        data: [mockSupabaseResponse],
        error: null,
      };
      
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn((queryString) => {
          // Validate the query string format
          expect(queryString).toContain('places!place_id(*)');
          expect(queryString).toContain('profiles!user_id(*)');
          
          return {
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue(mockResponse),
            }),
          };
        }),
      } as any));

      const result = await getActiveCheckIns();

      expect(supabase.from).toHaveBeenCalledWith('check_ins');
      expect(result.data).toEqual([mockCheckInWithDetails]);
      expect(result.error).toBeNull();
    });

    it('should handle errors', async () => {
      // Mock the Supabase error response
      const mockResponse = {
        data: null,
        error: { message: 'Database error' },
      };
      
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn((queryString) => {
          // Validate the query string format
          expect(queryString).toContain('places!place_id(*)');
          expect(queryString).toContain('profiles!user_id(*)');
          
          return {
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue(mockResponse),
            }),
          };
        }),
      } as any));

      const result = await getActiveCheckIns();

      expect(supabase.from).toHaveBeenCalledWith('check_ins');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });
  });

  describe('getCheckInsByPlace', () => {
    it('should fetch and group check-ins by place', async () => {
      // Mock the Supabase response with the actual structure
      const mockResponse = {
        data: [mockSupabaseResponse],
        error: null,
      };
      
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn((queryString) => {
          // Validate the query string format
          expect(queryString).toContain('places!place_id(*)');
          expect(queryString).toContain('profiles!user_id(*)');
          
          return {
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue(mockResponse),
            }),
          };
        }),
      } as any));

      const result = await getCheckInsByPlace();

      expect(supabase.from).toHaveBeenCalledWith('check_ins');
      expect(result.data).toEqual([
        {
          place: mockPlace,
          checkIns: [mockCheckInWithDetails],
        },
      ]);
      expect(result.error).toBeNull();
    });
  });

  describe('createCheckIn', () => {
    it('should create a new check-in', async () => {
      // Mock the Supabase response with the actual structure
      const mockResponse = {
        data: mockSupabaseResponse,
        error: null,
      };
      
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnValue({
          select: vi.fn((queryString) => {
            // Validate the query string format
            expect(queryString).toContain('places!place_id(*)');
            expect(queryString).toContain('profiles!user_id(*)');
            
            return {
              single: vi.fn().mockReturnValue(mockResponse),
            };
          }),
        }),
      } as any));

      const newCheckIn = {
        user_id: 'user123',
        place_id: 'place123',
        activity: 'Working',
        privacy_level: 'public',
      };

      const result = await createCheckIn(newCheckIn);

      expect(supabase.from).toHaveBeenCalledWith('check_ins');
      expect(result.data).toEqual(mockCheckInWithDetails);
      expect(result.error).toBeNull();
    });
  });

  describe('updateCheckIn', () => {
    it('should update an existing check-in', async () => {
      // Mock the Supabase response with the actual structure
      const mockResponse = {
        data: mockSupabaseResponse,
        error: null,
      };
      
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn((queryString) => {
              // Validate the query string format
              expect(queryString).toContain('places!place_id(*)');
              expect(queryString).toContain('profiles!user_id(*)');
              
              return {
                single: vi.fn().mockReturnValue(mockResponse),
              };
            }),
          }),
        }),
      } as any));

      const updates = {
        activity: 'Reading',
      };

      const result = await updateCheckIn('123', updates);

      expect(supabase.from).toHaveBeenCalledWith('check_ins');
      expect(result.data).toEqual(mockCheckInWithDetails);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteCheckIn', () => {
    it('should mark a check-in as expired', async () => {
      // Mock the Supabase response
      const mockResponse = {
        data: mockCheckIn,
        error: null,
      };
      
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(mockResponse),
            }),
          }),
        }),
      } as any));

      const result = await deleteCheckIn('123');

      expect(supabase.from).toHaveBeenCalledWith('check_ins');
      expect(result.data).toEqual(mockCheckIn);
      expect(result.error).toBeNull();
    });
  });
}); 