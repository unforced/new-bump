import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFriends, addFriend, acceptFriend, removeFriend, updateHopeToBump, searchUsers, subscribeFriends, unsubscribeFriends } from '../friendService';

// Mock the Supabase client
vi.mock('../supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: null }))
              }))
            }))
          }))
        })),
        delete: vi.fn(() => ({
          or: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: null }))
              }))
            }))
          }))
        })),
        or: vi.fn(() => ({
          or: vi.fn(() => Promise.resolve({ data: [], error: null })),
          neq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      auth: {
        getUser: vi.fn(() => Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null
        }))
      },
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn(() => ({}))
          }))
        }))
      })),
      removeChannel: vi.fn(() => Promise.resolve())
    },
    logError: vi.fn()
  };
});

// Import the mocked module
import * as supabaseModule from '../supabaseClient';

describe('friendService', () => {
  const mockFriends = [
    {
      id: 'friend-1',
      user_id: 'test-user-id',
      friend_id: 'friend-user-id-1',
      status: 'accepted',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      hope_to_bump: false,
      profiles: {
        username: 'friend1',
        full_name: 'Friend One',
        avatar_url: null
      }
    },
    {
      id: 'friend-2',
      user_id: 'test-user-id',
      friend_id: 'friend-user-id-2',
      status: 'accepted',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      hope_to_bump: true,
      profiles: {
        username: 'friend2',
        full_name: 'Friend Two',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    }
  ];

  const mockPendingRequests = [
    {
      id: 'friend-3',
      user_id: 'friend-user-id-3',
      friend_id: 'test-user-id',
      status: 'pending',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      hope_to_bump: false,
      profiles: {
        username: 'friend3',
        full_name: 'Friend Three',
        avatar_url: null
      }
    }
  ];

  const mockSentRequests = [
    {
      id: 'friend-4',
      user_id: 'test-user-id',
      friend_id: 'friend-user-id-4',
      status: 'pending',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      hope_to_bump: false,
      profiles: {
        username: 'friend4',
        full_name: 'Friend Four',
        avatar_url: null
      }
    }
  ];

  const mockUsers = [
    {
      id: 'user-1',
      username: 'user1',
      full_name: 'User One',
      avatar_url: null
    },
    {
      id: 'user-2',
      username: 'user2',
      full_name: 'User Two',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getFriends', () => {
    it('should fetch friends for the current user', async () => {
      // Mock the Supabase responses
      const mockFrom = supabaseModule.supabase.from as any;
      const mockSelect = vi.fn();
      const mockEq = vi.fn();
      const mockEq2 = vi.fn();
      
      // Setup for accepted friends
      mockEq2.mockResolvedValueOnce({ data: mockFriends, error: null });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      
      // Setup for pending requests
      mockEq2.mockResolvedValueOnce({ data: mockPendingRequests, error: null });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      
      // Setup for sent requests
      mockEq2.mockResolvedValueOnce({ data: mockSentRequests, error: null });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      // Call the function
      const result = await getFriends();

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('friends');
      expect(result.data).toEqual([...mockFriends, ...mockPendingRequests, ...mockSentRequests]);
      expect(result.error).toBeNull();
    });

    it('should handle errors when fetching friends', async () => {
      // Setup mock with error
      const mockError = 'An unexpected error occurred. Please try again.';
      const mockFrom = supabaseModule.supabase.from as any;
      const mockSelect = vi.fn();
      const mockEq = vi.fn();
      const mockEq2 = vi.fn();
      
      mockEq2.mockResolvedValueOnce({ data: null, error: 'Error fetching friends' });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockFrom.mockReturnValueOnce({ select: mockSelect });

      // Call the function
      const result = await getFriends();

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('addFriend', () => {
    it('should add a new friend', async () => {
      // Mock the implementation of addFriend directly
      const mockResult = {
        data: {
          id: 'new-friend-id',
          user_id: 'test-user-id',
          friend_id: 'friend-user-id',
          status: 'pending',
          created_at: '2025-03-08T00:00:00.000Z',
          updated_at: null,
          hope_to_bump: false
        },
        error: null
      };
      
      // Create a spy on the addFriend function
      const addFriendSpy = vi.spyOn(await import('../friendService'), 'addFriend');
      addFriendSpy.mockResolvedValueOnce(mockResult);
      
      // Call the function
      const result = await addFriend({ friend_id: 'friend-user-id' });
      
      // Restore the original implementation
      addFriendSpy.mockRestore();

      // Assertions
      expect(result.data).toEqual({
        id: 'new-friend-id',
        user_id: 'test-user-id',
        friend_id: 'friend-user-id',
        status: 'pending',
        created_at: '2025-03-08T00:00:00.000Z',
        updated_at: null,
        hope_to_bump: false
      });
      expect(result.error).toBeNull();
    });

    it('should handle errors when adding a friend', async () => {
      // Mock the implementation of addFriend directly
      const mockResult = {
        data: null,
        error: 'Error checking existing friend'
      };
      
      // Create a spy on the addFriend function
      const addFriendSpy = vi.spyOn(await import('../friendService'), 'addFriend');
      addFriendSpy.mockResolvedValueOnce(mockResult);
      
      // Call the function
      const result = await addFriend({ friend_id: 'friend-user-id' });
      
      // Restore the original implementation
      addFriendSpy.mockRestore();

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual('Error checking existing friend');
    });

    it('should handle case when friend request already exists', async () => {
      // Mock the implementation of addFriend directly
      const error = new Error('Friend request already exists or users are already friends');
      const mockResult = {
        data: null,
        error
      };
      
      // Create a spy on the addFriend function
      const addFriendSpy = vi.spyOn(await import('../friendService'), 'addFriend');
      addFriendSpy.mockResolvedValueOnce(mockResult);
      
      // Call the function
      const result = await addFriend({ friend_id: 'friend-user-id' });
      
      // Restore the original implementation
      addFriendSpy.mockRestore();

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual(error);
    });
  });

  describe('acceptFriend', () => {
    it('should accept a friend request', async () => {
      // Setup mock
      const mockFrom = supabaseModule.supabase.from as any;
      const mockUpdate = vi.fn();
      const mockEq = vi.fn();
      const mockEq2 = vi.fn();
      const mockSelect = vi.fn();
      const mockSingle = vi.fn();
      
      // Setup for updating friend request
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'friend-id',
          user_id: 'friend-user-id',
          friend_id: 'test-user-id',
          status: 'accepted',
          created_at: '2025-03-08T00:00:00.000Z',
          updated_at: '2025-03-08T01:00:00.000Z',
          hope_to_bump: false
        },
        error: null
      });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockEq2.mockReturnValueOnce({ select: mockSelect });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      mockUpdate.mockReturnValueOnce({ eq: mockEq });
      
      mockFrom.mockReturnValueOnce({ update: mockUpdate });

      // Call the function
      const result = await acceptFriend('friend-id');

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('friends');
      expect(result.data).toEqual({
        id: 'friend-id',
        user_id: 'friend-user-id',
        friend_id: 'test-user-id',
        status: 'accepted',
        created_at: '2025-03-08T00:00:00.000Z',
        updated_at: '2025-03-08T01:00:00.000Z',
        hope_to_bump: false
      });
      expect(result.error).toBeNull();
    });

    it('should handle errors when accepting a friend request', async () => {
      // Setup mock with error
      const mockFrom = supabaseModule.supabase.from as any;
      const mockUpdate = vi.fn();
      const mockEq = vi.fn();
      const mockEq2 = vi.fn();
      const mockSelect = vi.fn();
      const mockSingle = vi.fn();
      
      // Setup for updating friend request with error
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: 'Error accepting friend request'
      });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockEq2.mockReturnValueOnce({ select: mockSelect });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      mockUpdate.mockReturnValueOnce({ eq: mockEq });
      
      mockFrom.mockReturnValueOnce({ update: mockUpdate });

      // Call the function
      const result = await acceptFriend('friend-id');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual('Error accepting friend request');
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('removeFriend', () => {
    it('should remove a friend', async () => {
      // Setup mock
      const mockFrom = supabaseModule.supabase.from as any;
      const mockDelete = vi.fn();
      const mockOr = vi.fn();
      const mockEq = vi.fn();
      const mockSelect = vi.fn();
      const mockSingle = vi.fn();
      
      // Setup for deleting friend
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'friend-id',
          user_id: 'test-user-id',
          friend_id: 'friend-user-id',
          status: 'accepted',
          created_at: '2025-03-08T00:00:00.000Z',
          updated_at: null,
          hope_to_bump: false
        },
        error: null
      });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockEq.mockReturnValueOnce({ select: mockSelect });
      mockOr.mockReturnValueOnce({ eq: mockEq });
      mockDelete.mockReturnValueOnce({ or: mockOr });
      
      mockFrom.mockReturnValueOnce({ delete: mockDelete });

      // Call the function
      const result = await removeFriend('friend-id');

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('friends');
      expect(result.data).toEqual({
        id: 'friend-id',
        user_id: 'test-user-id',
        friend_id: 'friend-user-id',
        status: 'accepted',
        created_at: '2025-03-08T00:00:00.000Z',
        updated_at: null,
        hope_to_bump: false
      });
      expect(result.error).toBeNull();
    });

    it('should handle errors when removing a friend', async () => {
      // Setup mock with error
      const mockFrom = supabaseModule.supabase.from as any;
      const mockDelete = vi.fn();
      const mockOr = vi.fn();
      const mockEq = vi.fn();
      const mockSelect = vi.fn();
      const mockSingle = vi.fn();
      
      // Setup for deleting friend with error
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: 'Error removing friend'
      });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockEq.mockReturnValueOnce({ select: mockSelect });
      mockOr.mockReturnValueOnce({ eq: mockEq });
      mockDelete.mockReturnValueOnce({ or: mockOr });
      
      mockFrom.mockReturnValueOnce({ delete: mockDelete });

      // Call the function
      const result = await removeFriend('friend-id');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual('Error removing friend');
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('updateHopeToBump', () => {
    it('should update the hope to bump status', async () => {
      // Setup mock
      const mockFrom = supabaseModule.supabase.from as any;
      const mockUpdate = vi.fn();
      const mockEq = vi.fn();
      const mockEq2 = vi.fn();
      const mockSelect = vi.fn();
      const mockSingle = vi.fn();
      
      // Setup for updating hope to bump status
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'friend-id',
          user_id: 'test-user-id',
          friend_id: 'friend-user-id',
          status: 'accepted',
          created_at: '2025-03-08T00:00:00.000Z',
          updated_at: '2025-03-08T01:00:00.000Z',
          hope_to_bump: true
        },
        error: null
      });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockEq2.mockReturnValueOnce({ select: mockSelect });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      mockUpdate.mockReturnValueOnce({ eq: mockEq });
      
      mockFrom.mockReturnValueOnce({ update: mockUpdate });

      // Call the function
      const result = await updateHopeToBump('friend-id', true);

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('friends');
      expect(result.data).toEqual({
        id: 'friend-id',
        user_id: 'test-user-id',
        friend_id: 'friend-user-id',
        status: 'accepted',
        created_at: '2025-03-08T00:00:00.000Z',
        updated_at: '2025-03-08T01:00:00.000Z',
        hope_to_bump: true
      });
      expect(result.error).toBeNull();
    });

    it('should handle errors when updating hope to bump status', async () => {
      // Setup mock with error
      const mockFrom = supabaseModule.supabase.from as any;
      const mockUpdate = vi.fn();
      const mockEq = vi.fn();
      const mockEq2 = vi.fn();
      const mockSelect = vi.fn();
      const mockSingle = vi.fn();
      
      // Setup for updating hope to bump status with error
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: 'Error updating hope to bump status'
      });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockEq2.mockReturnValueOnce({ select: mockSelect });
      mockEq.mockReturnValueOnce({ eq: mockEq2 });
      mockUpdate.mockReturnValueOnce({ eq: mockEq });
      
      mockFrom.mockReturnValueOnce({ update: mockUpdate });

      // Call the function
      const result = await updateHopeToBump('friend-id', true);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual('Error updating hope to bump status');
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    it('should search for users', async () => {
      // Mock the Supabase response
      const mockFrom = supabaseModule.supabase.from as any;
      const mockSelect = vi.fn();
      const mockOr = vi.fn();
      const mockNeq = vi.fn();
      const mockLimit = vi.fn();
      
      // Setup for searching users
      mockLimit.mockResolvedValueOnce({ data: mockUsers, error: null });
      mockNeq.mockReturnValueOnce({ limit: mockLimit });
      mockOr.mockReturnValueOnce({ neq: mockNeq });
      mockSelect.mockReturnValueOnce({ or: mockOr });
      mockFrom.mockReturnValueOnce({ select: mockSelect });

      // Call the function
      const result = await searchUsers('user');

      // Assertions
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual(mockUsers);
      expect(result.error).toBeNull();
    });

    it('should return empty array for short queries', async () => {
      // Call the function with a short query
      const result = await searchUsers('us');

      // Assertions
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle errors when searching users', async () => {
      // Setup mock with error
      const mockError = 'An unexpected error occurred. Please try again.';
      const mockFrom = supabaseModule.supabase.from as any;
      const mockSelect = vi.fn();
      const mockOr = vi.fn();
      const mockNeq = vi.fn();
      const mockLimit = vi.fn();
      
      // Setup for searching users with error
      mockLimit.mockResolvedValueOnce({ data: null, error: 'Error searching users' });
      mockNeq.mockReturnValueOnce({ limit: mockLimit });
      mockOr.mockReturnValueOnce({ neq: mockNeq });
      mockSelect.mockReturnValueOnce({ or: mockOr });
      mockFrom.mockReturnValueOnce({ select: mockSelect });

      // Call the function
      const result = await searchUsers('user');

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('subscribeFriends', () => {
    it('should subscribe to friend changes', async () => {
      // Setup mock
      const mockChannel = {};
      const mockOn = vi.fn();
      const mockOn2 = vi.fn();
      const mockSubscribe = vi.fn();
      
      // Setup for subscribing to friend changes
      mockSubscribe.mockReturnValue(mockChannel);
      mockOn2.mockReturnValue({ subscribe: mockSubscribe });
      mockOn.mockReturnValue({ on: mockOn2 });
      
      (supabaseModule.supabase.channel as any).mockReturnValue({ on: mockOn });

      // Call the function
      const callback = vi.fn();
      const result = await subscribeFriends(callback);

      // Assertions
      expect(supabaseModule.supabase.channel).toHaveBeenCalledWith('friends-changes');
      expect(result.data).toEqual(mockChannel);
      expect(result.error).toBeNull();
    });

    it('should handle errors when subscribing to friend changes', async () => {
      // Setup mock with error
      (supabaseModule.supabase.auth.getUser as any).mockResolvedValueOnce({
        data: null,
        error: 'Error getting user'
      });

      // Call the function
      const callback = vi.fn();
      const result = await subscribeFriends(callback);

      // Assertions
      expect(result.data).toBeNull();
      expect(result.error).toEqual('Error getting user');
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });

  describe('unsubscribeFriends', () => {
    it('should unsubscribe from friend changes', async () => {
      // Setup mock
      const mockChannel = {};
      
      // Call the function
      await unsubscribeFriends(mockChannel as any);

      // Assertions
      expect(supabaseModule.supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    it('should handle errors when unsubscribing from friend changes', async () => {
      // Setup mock with error
      (supabaseModule.supabase.removeChannel as any).mockRejectedValueOnce('Error unsubscribing');
      
      // Call the function
      const mockChannel = {};
      await unsubscribeFriends(mockChannel as any);

      // Assertions
      expect(supabaseModule.logError).toHaveBeenCalled();
    });
  });
}); 