import { supabase, logError } from './supabaseClient';
import { withErrorHandling } from './errorHandling';
import { v4 as uuidv4 } from 'uuid';
import { RealtimeChannel } from '@supabase/supabase-js';

// Define the Friend interface
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string | null;
  hope_to_bump: boolean;
  // Join with profiles to get friend's information
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | {
    username: string;
    full_name: string;
    avatar_url: string | null;
  }[];
}

// Define the FriendInput interface for creating/updating friends
export interface FriendInput {
  friend_id: string;
}

/**
 * Fetches all friends for the current user
 * @returns A promise with the friends data or an error
 */
export async function getFriends() {
  return withErrorHandling(async () => {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    const userId = userData.user.id;
    
    // Fetch friends where the current user is either the user or the friend
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        hope_to_bump,
        profiles:friend_id(username, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    if (error) throw error;
    
    // Fetch pending friend requests sent to the current user
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        hope_to_bump,
        profiles:user_id(username, full_name, avatar_url)
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending');
    
    if (pendingError) throw pendingError;
    
    // Fetch pending friend requests sent by the current user
    const { data: sentRequests, error: sentError } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        hope_to_bump,
        profiles:friend_id(username, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending');
    
    if (sentError) throw sentError;
    
    // Combine all friend data
    const allFriends = [
      ...(data || []),
      ...(pendingRequests || []),
      ...(sentRequests || [])
    ];
    
    return allFriends as unknown as Friend[];
  });
}

/**
 * Adds a new friend (sends a friend request)
 * @param friendInput The friend data to create
 * @returns A promise with the created friend data or an error
 */
export const addFriend = async (friendInput: FriendInput) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logError('Error getting user', userError);
      return { data: null, error: userError };
    }
    
    const userId = userData.user.id;
    
    // Check if the friend request already exists
    const { data: existingFriend, error: checkError } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .or(`user_id.eq.${friendInput.friend_id},friend_id.eq.${friendInput.friend_id}`);
    
    if (checkError) {
      logError('Error checking existing friend', checkError);
      return { data: null, error: checkError };
    }
    
    if (existingFriend && existingFriend.length > 0) {
      const error = new Error('Friend request already exists or users are already friends');
      logError('Friend request already exists', error);
      return { data: null, error };
    }
    
    // Create the friend request
    const { data, error } = await supabase
      .from('friends')
      .insert({
        id: uuidv4(),
        user_id: userId,
        friend_id: friendInput.friend_id,
        status: 'pending',
        hope_to_bump: false
      })
      .select()
      .single();
    
    if (error) {
      logError('Error adding friend', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    logError('Unexpected error in addFriend', error);
    return { data: null, error };
  }
};

/**
 * Accepts a friend request
 * @param friendId The ID of the friend request to accept
 * @returns A promise with the updated friend data or an error
 */
export const acceptFriend = async (friendId: string) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logError('Error getting user', userError);
      return { data: null, error: userError };
    }
    
    const userId = userData.user.id;
    
    // Update the friend request status to accepted
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', friendId)
      .eq('friend_id', userId) // Ensure the current user is the recipient of the request
      .select()
      .single();
    
    if (error) {
      logError('Error accepting friend request', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    logError('Unexpected error in acceptFriend', error);
    return { data: null, error };
  }
};

/**
 * Rejects a friend request or removes a friend
 * @param friendId The ID of the friend request to reject or friend to remove
 * @returns A promise with the result or an error
 */
export const removeFriend = async (friendId: string) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logError('Error getting user', userError);
      return { data: null, error: userError };
    }
    
    const userId = userData.user.id;
    
    // Delete the friend record
    const { data, error } = await supabase
      .from('friends')
      .delete()
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('id', friendId)
      .select()
      .single();
    
    if (error) {
      logError('Error removing friend', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    logError('Unexpected error in removeFriend', error);
    return { data: null, error };
  }
};

/**
 * Updates the "Hope to Bump" status for a friend
 * @param friendId The ID of the friend to update
 * @param hopeToBump The new "Hope to Bump" status
 * @returns A promise with the updated friend data or an error
 */
export const updateHopeToBump = async (friendId: string, hopeToBump: boolean) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logError('Error getting user', userError);
      return { data: null, error: userError };
    }
    
    const userId = userData.user.id;
    
    // Update the "Hope to Bump" status
    const { data, error } = await supabase
      .from('friends')
      .update({ hope_to_bump: hopeToBump, updated_at: new Date().toISOString() })
      .eq('id', friendId)
      .eq('user_id', userId) // Ensure the current user is the owner of the friend record
      .select()
      .single();
    
    if (error) {
      logError('Error updating hope to bump status', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    logError('Unexpected error in updateHopeToBump', error);
    return { data: null, error };
  }
};

/**
 * Searches for users by username or email
 * @param query The search query
 * @returns A promise with the search results or an error
 */
export const searchUsers = async (query: string) => {
  return withErrorHandling(async () => {
    if (!query || query.trim().length < 3) {
      return [];
    }
    
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    const userId = userData.user.id;
    
    // Search for users by username or email
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', userId) // Exclude the current user
      .limit(10);
    
    if (error) throw error;
    
    return data;
  });
};

/**
 * Subscribes to real-time updates for friends
 * @param callback The callback function to call when a friend is updated
 * @returns A promise with the subscription channel or an error
 */
export const subscribeFriends = async (
  callback: (payload: { new: Friend; old: Friend | null }) => void
): Promise<{ data: RealtimeChannel | null; error: Error | null }> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logError('Error getting user', userError);
      return { data: null, error: userError };
    }
    
    const userId = userData.user.id;
    
    // Subscribe to changes in the friends table
    const channel = supabase
      .channel('friends-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload as any);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${userId}`
        },
        (payload) => {
          callback(payload as any);
        }
      )
      .subscribe();
    
    return { data: channel, error: null };
  } catch (error) {
    logError('Unexpected error in subscribeFriends', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Unsubscribes from real-time updates for friends
 * @param channel The subscription channel to unsubscribe from
 */
export const unsubscribeFriends = async (channel: RealtimeChannel) => {
  try {
    await supabase.removeChannel(channel);
  } catch (error) {
    logError('Error unsubscribing from friends', error);
  }
}; 