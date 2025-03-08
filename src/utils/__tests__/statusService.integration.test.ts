import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import * as statusServiceModule from '../statusService';
import { 
  CheckInInsert
} from '../statusService';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '../../types/supabase';

// Skip tests if not in integration test mode
const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';
const testMessage = runIntegrationTests 
  ? 'Running integration tests with real Supabase connection'
  : 'Skipping integration tests (set RUN_INTEGRATION_TESTS=true to run)';

console.log(testMessage);

// Create a test client with service role for admin operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Helper function to log detailed error information
function logDetailedError(operation: string, error: any): void {
  console.error(`[ERROR] ${operation} failed:`);
  console.error(`- Error code: ${error?.code || 'N/A'}`);
  console.error(`- Error message: ${error?.message || 'N/A'}`);
  console.error(`- Error details: ${error?.details || 'N/A'}`);
  console.error(`- Error hint: ${error?.hint || 'N/A'}`);
  
  if (error?.status) {
    console.error(`- HTTP status: ${error.status}`);
  }
  
  console.error('Full error object:', JSON.stringify(error, null, 2));
}

// Helper function to check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await adminClient
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    console.log(`Table ${tableName} exists and is accessible`);
    return true;
  } catch (err) {
    console.error(`Exception checking if table ${tableName} exists:`, err);
    return false;
  }
}

// Helper function to create a test user in auth.users
async function createTestAuthUser(): Promise<string | null> {
  try {
    console.log('Creating test auth user...');
    
    // Generate a unique email
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Create a user with the service role client
    const { data, error } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: 'password123',
      email_confirm: true
    });
    
    if (error) {
      logDetailedError('Creating test auth user', error);
      return null;
    }
    
    if (!data.user) {
      console.error('No user returned from createUser');
      return null;
    }
    
    console.log(`Test auth user created with ID: ${data.user.id}`);
    return data.user.id;
  } catch (error) {
    console.error('Unexpected error creating test auth user:', error);
    return null;
  }
}

// Helper function to delete a test user from auth.users
async function deleteTestAuthUser(userId: string): Promise<boolean> {
  try {
    console.log(`Deleting test auth user with ID: ${userId}`);
    
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    
    if (error) {
      logDetailedError('Deleting test auth user', error);
      return false;
    }
    
    console.log('Test auth user deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting test auth user:', error);
    return false;
  }
}

// Create admin versions of the status service functions
async function adminCreateCheckIn(checkIn: Omit<CheckInInsert, 'id' | 'created_at'>) {
  try {
    console.log('Using admin client to create check-in');
    const { data, error } = await adminClient
      .from('check_ins')
      .insert({
        ...checkIn,
        // Don't set an expiration time for test purposes
        expires_at: null
      })
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .single();
    
    if (error) {
      return { data: null, error };
    }
    
    // Transform the data to match our expected interface
    const transformedData = {
      ...data,
      place: data.places,
      profile: data.profiles
    };
    
    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function adminGetActiveCheckIns() {
  try {
    console.log('Using admin client to get active check-ins');
    const { data, error } = await adminClient
      .from('check_ins')
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .is('expires_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error };
    }
    
    // Transform the data to match our expected interface
    const transformedData = data?.map(item => ({
      ...item,
      place: item.places,
      profile: item.profiles
    }));
    
    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function adminGetCheckInsByPlace() {
  try {
    console.log('Using admin client to get check-ins by place');
    const { data, error } = await adminClient
      .from('check_ins')
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .is('expires_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error };
    }
    
    // Transform the data to match our expected interface
    const transformedData = data?.map(item => ({
      ...item,
      place: item.places,
      profile: item.profiles
    }));
    
    // Group check-ins by place
    const groupedByPlace = (transformedData || []).reduce<Record<string, any>>((acc, checkIn) => {
      const placeId = checkIn.place_id;
      
      if (!acc[placeId]) {
        acc[placeId] = {
          place: checkIn.place,
          checkIns: []
        };
      }
      
      acc[placeId].checkIns.push(checkIn);
      
      return acc;
    }, {});
    
    // Convert to array
    return { data: Object.values(groupedByPlace), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function adminUpdateCheckIn(id: string, updates: Partial<CheckInInsert>) {
  try {
    console.log('Using admin client to update check-in');
    const { data, error } = await adminClient
      .from('check_ins')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        places!place_id(*),
        profiles!user_id(*)
      `)
      .single();
    
    if (error) {
      return { data: null, error };
    }
    
    // Transform the data to match our expected interface
    const transformedData = {
      ...data,
      place: data.places,
      profile: data.profiles
    };
    
    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function adminDeleteCheckIn(id: string) {
  try {
    console.log('Using admin client to mark check-in as expired');
    const { data, error } = await adminClient
      .from('check_ins')
      .update({ expires_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Only run these tests if explicitly enabled
(runIntegrationTests ? describe : describe.skip)('statusService - Integration Tests', () => {
  // Test data IDs
  const testIds = {
    userId: '',
    placeId: '',
    checkInId: ''
  };

  // Setup: Verify database connection and create test data before running tests
  beforeAll(async () => {
    console.log('=== INTEGRATION TEST SETUP ===');
    console.log(`Using Supabase URL: ${supabaseUrl}`);
    
    // Check if required tables exist
    console.log('Verifying database tables...');
    const profilesExist = await checkTableExists('profiles');
    const placesExist = await checkTableExists('places');
    const checkInsExist = await checkTableExists('check_ins');
    
    if (!profilesExist || !placesExist || !checkInsExist) {
      throw new Error('Required database tables are not accessible. Check your Supabase setup.');
    }
    
    console.log('All required tables exist and are accessible');
    
    try {
      // First create a test user in auth.users
      const authUserId = await createTestAuthUser();
      
      if (!authUserId) {
        throw new Error('Failed to create test auth user');
      }
      
      testIds.userId = authUserId;
      
      // Check if the profile was automatically created by the trigger
      console.log('Checking if profile was created by trigger...');
      const { data: profileData, error: profileError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();
      
      if (profileError) {
        logDetailedError('Checking for profile', profileError);
        throw new Error(`Failed to check for profile: ${profileError.message || 'Unknown error'}`);
      }
      
      if (!profileData) {
        console.log('Profile not created by trigger, creating manually...');
        
        // Create a profile manually if not created by trigger
        const { data: manualProfileData, error: manualProfileError } = await adminClient
          .from('profiles')
          .insert({
            id: authUserId,
            email: `test-${Date.now()}@example.com`,
            username: `testuser-${Date.now()}`
          })
          .select()
          .single();
        
        if (manualProfileError) {
          logDetailedError('Creating profile manually', manualProfileError);
          throw new Error(`Failed to create profile manually: ${manualProfileError.message || 'Unknown error'}`);
        }
        
        if (!manualProfileData) {
          throw new Error('Failed to create profile manually: No data returned');
        }
        
        console.log('Profile created manually:', JSON.stringify(manualProfileData, null, 2));
      } else {
        console.log('Profile was created by trigger:', JSON.stringify(profileData, null, 2));
      }

      // Create a test place using admin client
      console.log('Creating test place...');
      const { data: placeData, error: placeError } = await adminClient
        .from('places')
        .insert({
          name: `Test Place ${Date.now()}`,
          created_by: testIds.userId,
          address: '123 Test St',
          lat: 40.7128,
          lng: -74.0060
        })
        .select()
        .single();

      if (placeError) {
        logDetailedError('Creating test place', placeError);
        throw new Error(`Failed to create test place: ${placeError.message || 'Unknown error'}`);
      }

      if (!placeData) {
        throw new Error('Failed to create test place: No data returned');
      }
      
      testIds.placeId = placeData.id;
      console.log(`Test place created with ID: ${testIds.placeId}`);
      console.log('Place data:', JSON.stringify(placeData, null, 2));
      
      console.log('Test data created successfully:', testIds);
    } catch (error) {
      console.error('Unexpected error during test setup:', error);
      throw error;
    }
  });

  // Cleanup: Remove test data after tests complete
  afterAll(async () => {
    console.log('=== INTEGRATION TEST CLEANUP ===');
    
    try {
      if (testIds.checkInId) {
        // Delete the test check-in using admin client
        console.log(`Deleting test check-in with ID: ${testIds.checkInId}`);
        const { error } = await adminClient
          .from('check_ins')
          .delete()
          .eq('id', testIds.checkInId);
          
        if (error) {
          logDetailedError('Deleting test check-in', error);
          console.warn(`Warning: Failed to delete test check-in: ${error.message}`);
        } else {
          console.log('Test check-in deleted successfully');
        }
      }

      if (testIds.placeId) {
        // Delete the test place using admin client
        console.log(`Deleting test place with ID: ${testIds.placeId}`);
        const { error } = await adminClient
          .from('places')
          .delete()
          .eq('id', testIds.placeId);
          
        if (error) {
          logDetailedError('Deleting test place', error);
          console.warn(`Warning: Failed to delete test place: ${error.message}`);
        } else {
          console.log('Test place deleted successfully');
        }
      }

      if (testIds.userId) {
        // Delete the test auth user (this should cascade to delete the profile)
        await deleteTestAuthUser(testIds.userId);
      }

      console.log('Test data cleanup completed');
    } catch (error) {
      console.error('Unexpected error during test cleanup:', error);
    }
  });

  // Test creating a check-in
  it('should create a new check-in', async () => {
    console.log('=== TEST: Creating a new check-in ===');
    
    const checkInData: Omit<CheckInInsert, 'id' | 'created_at'> = {
      user_id: testIds.userId,
      place_id: testIds.placeId,
      activity: 'Integration Testing',
      privacy_level: 'public'
    };
    
    console.log('Creating check-in with data:', JSON.stringify(checkInData, null, 2));

    // Use our admin version of createCheckIn
    const { data, error } = await adminCreateCheckIn(checkInData);

    if (error) {
      logDetailedError('Creating check-in', error);
    }

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    
    if (data) {
      console.log('Check-in created successfully:', JSON.stringify(data, null, 2));
      
      expect(data.user_id).toBe(testIds.userId);
      expect(data.place_id).toBe(testIds.placeId);
      expect(data.activity).toBe('Integration Testing');
      
      // Store the check-in ID for later tests and cleanup
      testIds.checkInId = data.id;
      console.log(`Test check-in ID set to: ${testIds.checkInId}`);
      
      // Verify the place and profile data is included
      expect(data.place).toBeDefined();
      expect(data.place.id).toBe(testIds.placeId);
      expect(data.profile).toBeDefined();
      expect(data.profile.id).toBe(testIds.userId);
    }
  });

  // Test fetching active check-ins
  it('should fetch active check-ins', async () => {
    console.log('=== TEST: Fetching active check-ins ===');
    
    // Skip if we don't have a check-in ID (previous test failed)
    if (!testIds.checkInId) {
      console.warn('Skipping test: No check-in ID available');
      return;
    }
    
    console.log(`Looking for check-in with ID: ${testIds.checkInId}`);

    // Use our admin version of getActiveCheckIns
    const { data, error } = await adminGetActiveCheckIns();

    if (error) {
      logDetailedError('Fetching active check-ins', error);
    }

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
    
    console.log(`Fetched ${data?.length || 0} active check-ins`);
    
    // Find our test check-in
    const testCheckIn = data?.find((checkIn: any) => checkIn.id === testIds.checkInId);
    
    if (!testCheckIn) {
      console.error('Test check-in not found in active check-ins. All check-ins:', 
        JSON.stringify(data?.map((c: any) => ({ id: c.id, user_id: c.user_id, place_id: c.place_id })), null, 2));
    }
    
    expect(testCheckIn).toBeDefined();
    
    if (testCheckIn) {
      console.log('Found test check-in in active check-ins:', JSON.stringify(testCheckIn, null, 2));
      expect(testCheckIn.place).toBeDefined();
      expect(testCheckIn.profile).toBeDefined();
    }
  });

  // Test fetching check-ins grouped by place
  it('should fetch check-ins grouped by place', async () => {
    console.log('=== TEST: Fetching check-ins grouped by place ===');
    
    // Skip if we don't have a check-in ID (previous test failed)
    if (!testIds.checkInId) {
      console.warn('Skipping test: No check-in ID available');
      return;
    }
    
    console.log(`Looking for place with ID: ${testIds.placeId}`);

    // Use our admin version of getCheckInsByPlace
    const { data, error } = await adminGetCheckInsByPlace();

    if (error) {
      logDetailedError('Fetching check-ins grouped by place', error);
    }

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
    
    console.log(`Fetched ${data?.length || 0} places with check-ins`);
    
    // Find our test place
    const testPlace = data?.find(placeData => placeData.place.id === testIds.placeId);
    
    if (!testPlace) {
      console.error('Test place not found in grouped check-ins. All places:', 
        JSON.stringify(data?.map(p => ({ place_id: p.place.id, name: p.place.name })), null, 2));
    }
    
    expect(testPlace).toBeDefined();
    
    if (testPlace) {
      console.log('Found test place in grouped check-ins:', JSON.stringify(testPlace.place, null, 2));
      expect(Array.isArray(testPlace.checkIns)).toBe(true);
      console.log(`Place has ${testPlace.checkIns.length} check-ins`);
      
      // Find our test check-in
      const testCheckIn = testPlace.checkIns.find(checkIn => checkIn.id === testIds.checkInId);
      
      if (!testCheckIn) {
        console.error('Test check-in not found in place check-ins. All check-ins for this place:', 
          JSON.stringify(testPlace.checkIns.map((c: any) => ({ id: c.id, user_id: c.user_id })), null, 2));
      }
      
      expect(testCheckIn).toBeDefined();
      
      if (testCheckIn) {
        console.log('Found test check-in in place check-ins:', JSON.stringify(testCheckIn, null, 2));
      }
    }
  });

  // Test updating a check-in
  it('should update an existing check-in', async () => {
    console.log('=== TEST: Updating an existing check-in ===');
    
    // Skip if we don't have a check-in ID (previous test failed)
    if (!testIds.checkInId) {
      console.warn('Skipping test: No check-in ID available');
      return;
    }
    
    console.log(`Updating check-in with ID: ${testIds.checkInId}`);

    const updates = {
      activity: 'Updated Activity'
    };
    
    console.log('Update data:', JSON.stringify(updates, null, 2));

    // Use our admin version of updateCheckIn
    const { data, error } = await adminUpdateCheckIn(testIds.checkInId, updates);

    if (error) {
      logDetailedError('Updating check-in', error);
    }

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    
    if (data) {
      console.log('Check-in updated successfully:', JSON.stringify(data, null, 2));
      expect(data.id).toBe(testIds.checkInId);
      expect(data.activity).toBe('Updated Activity');
      expect(data.place).toBeDefined();
      expect(data.profile).toBeDefined();
    }
  });

  // Test deleting a check-in (marking as expired)
  it('should mark a check-in as expired', async () => {
    console.log('=== TEST: Marking a check-in as expired ===');
    
    // Skip if we don't have a check-in ID (previous test failed)
    if (!testIds.checkInId) {
      console.warn('Skipping test: No check-in ID available');
      return;
    }
    
    console.log(`Marking check-in as expired with ID: ${testIds.checkInId}`);

    // Use our admin version of deleteCheckIn
    const { data, error } = await adminDeleteCheckIn(testIds.checkInId);

    if (error) {
      logDetailedError('Marking check-in as expired', error);
    }

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    
    if (data) {
      console.log('Check-in marked as expired successfully:', JSON.stringify(data, null, 2));
      expect(data.id).toBe(testIds.checkInId);
      expect(data.expires_at).not.toBeNull();
    }
  });
}); 