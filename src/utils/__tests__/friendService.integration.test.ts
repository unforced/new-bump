import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../supabaseClient';
import { getFriends, addFriend, removeFriend, updateHopeToBump, searchUsers } from '../friendService';
import { v4 as uuidv4 } from 'uuid';

// Skip tests if not running integration tests
const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

// Test users
const testUser1 = {
  id: uuidv4(),
  email: `test-user-1-${Date.now()}@example.com`,
  username: `test-user-1-${Date.now()}`,
  full_name: 'Test User 1'
};

const testUser2 = {
  id: uuidv4(),
  email: `test-user-2-${Date.now()}@example.com`,
  username: `test-user-2-${Date.now()}`,
  full_name: 'Test User 2'
};

// Test friend
let testFriendId: string | null = null;

describe('friendService Integration Tests', () => {
  // Skip all tests if not running integration tests
  if (!runIntegrationTests) {
    console.log('Skipping integration tests (set RUN_INTEGRATION_TESTS=true to run)');
    return;
  }

  // Setup test data before running tests
  beforeAll(async () => {
    // Create test users
    await supabase.from('profiles').insert([
      {
        id: testUser1.id,
        email: testUser1.email,
        username: testUser1.username,
        full_name: testUser1.full_name
      },
      {
        id: testUser2.id,
        email: testUser2.email,
        username: testUser2.username,
        full_name: testUser2.full_name
      }
    ]);

    // Authenticate as test user 1
    await supabase.auth.signInWithPassword({
      email: testUser1.email,
      password: 'password123'
    });
  });

  // Clean up test data after running tests
  afterAll(async () => {
    // Delete test friend if it exists
    if (testFriendId) {
      await supabase.from('friends').delete().eq('id', testFriendId);
    }

    // Delete test users
    await supabase.from('profiles').delete().eq('id', testUser1.id);
    await supabase.from('profiles').delete().eq('id', testUser2.id);

    // Sign out
    await supabase.auth.signOut();
  });

  it('should add a friend', async () => {
    // Add a friend
    const { data, error } = await addFriend({ friend_id: testUser2.id });

    // Save the friend ID for cleanup
    if (data) {
      testFriendId = data.id;
    }

    // Assertions
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.user_id).toBe(testUser1.id);
    expect(data?.friend_id).toBe(testUser2.id);
    expect(data?.status).toBe('pending');
    expect(data?.hope_to_bump).toBe(false);
  });

  it('should get friends', async () => {
    // Get friends
    const { data, error } = await getFriends();

    // Assertions
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
    
    // Find the test friend
    const testFriend = data?.find(friend => friend.id === testFriendId);
    expect(testFriend).not.toBeUndefined();
    expect(testFriend?.user_id).toBe(testUser1.id);
    expect(testFriend?.friend_id).toBe(testUser2.id);
    expect(testFriend?.status).toBe('pending');
  });

  it('should update hope to bump status', async () => {
    // Skip if no test friend
    if (!testFriendId) {
      console.log('Skipping test: No test friend ID');
      return;
    }

    // Update hope to bump status
    const { data, error } = await updateHopeToBump(testFriendId, true);

    // Assertions
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.id).toBe(testFriendId);
    expect(data?.hope_to_bump).toBe(true);
  });

  it('should search for users', async () => {
    // Search for users
    const { data, error } = await searchUsers(testUser2.username);

    // Assertions
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
    
    // Find the test user
    const foundUser = data?.find(user => user.id === testUser2.id);
    expect(foundUser).not.toBeUndefined();
    expect(foundUser?.username).toBe(testUser2.username);
    expect(foundUser?.full_name).toBe(testUser2.full_name);
  });

  it('should remove a friend', async () => {
    // Skip if no test friend
    if (!testFriendId) {
      console.log('Skipping test: No test friend ID');
      return;
    }

    // Remove the friend
    const { data, error } = await removeFriend(testFriendId);

    // Assertions
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.id).toBe(testFriendId);

    // Clear the test friend ID since it's been deleted
    testFriendId = null;
  });
}); 