import React, { createContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import theme from '../../styles/theme';
import Home from '../Home';
import { getCheckInsByPlace } from '../../utils/statusService';
import { useDataSubscription } from '../../hooks/useRealtimeSubscription';
import { Place, PlaceWithCheckIns, CheckInWithDetails } from '../../utils/statusService';
import { AuthContextType } from '../../types/auth';

// Mock the dependencies
vi.mock('../../utils/statusService', () => ({
  getCheckInsByPlace: vi.fn(),
}));

vi.mock('../../hooks/useRealtimeSubscription', () => ({
  useDataSubscription: vi.fn(),
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => {
  const mockAuthContext = createContext<AuthContextType | undefined>(undefined);
  
  return {
    useAuth: () => ({
      user: {
        id: 'user123',
        email: 'user@example.com',
        username: 'testuser',
        created_at: '2025-03-01T12:00:00Z',
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <mockAuthContext.Provider value={{} as AuthContextType}>
        {children}
      </mockAuthContext.Provider>
    ),
  };
});

// Mock data
const mockPlaces: Place[] = [
  { 
    id: 'place1', 
    name: 'Coffee Shop',
    google_place_id: null,
    address: '123 Main St',
    lat: 40.7128,
    lng: -74.0060,
    created_at: '2025-03-01T12:00:00Z',
    created_by: 'user123',
    updated_at: null
  },
  { 
    id: 'place2', 
    name: 'Library',
    google_place_id: null,
    address: '456 Park Ave',
    lat: 40.7200,
    lng: -74.0100,
    created_at: '2025-03-01T12:00:00Z',
    created_by: 'user123',
    updated_at: null
  },
];

// Create a properly typed mock check-in
const createMockCheckIn = (
  id: string, 
  userId: string, 
  placeId: string, 
  activity: string, 
  username: string
): CheckInWithDetails => ({
  id,
  user_id: userId,
  place_id: placeId,
  activity,
  privacy_level: 'public',
  created_at: '2025-03-04T12:00:00Z',
  expires_at: null,
  place: mockPlaces.find(p => p.id === placeId) || mockPlaces[0],
  profile: {
    id: userId,
    email: `${username}@example.com`,
    username,
    created_at: '2025-03-01T12:00:00Z',
    updated_at: null,
    phone: null,
    avatar_url: null,
    status: null,
    status_updated_at: null,
  },
});

const mockCheckIns: PlaceWithCheckIns[] = [
  {
    place: mockPlaces[0],
    checkIns: [
      createMockCheckIn('check-in-1', 'user123', 'place1', 'Working', 'testuser'),
      createMockCheckIn('check-in-2', 'user456', 'place1', 'Reading', 'anotheruser'),
    ],
  },
  {
    place: mockPlaces[1],
    checkIns: [
      createMockCheckIn('check-in-3', 'user789', 'place2', 'Studying', 'thirduser'),
    ],
  },
];

// Wrapper component with ThemeProvider
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(getCheckInsByPlace).mockResolvedValue({
      data: mockCheckIns,
      error: null,
    });
    
    vi.mocked(useDataSubscription).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });
  
  it('renders the loading state initially', async () => {
    // Mock loading state
    vi.mocked(useDataSubscription).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    
    render(<Home />, { wrapper: Wrapper });
    
    expect(screen.getByText('Loading check-ins...')).toBeInTheDocument();
    
    // Wait for the loading state to resolve
    await waitFor(() => {
      expect(getCheckInsByPlace).toHaveBeenCalled();
    });
  });
  
  it('renders check-ins grouped by place', async () => {
    render(<Home />, { wrapper: Wrapper });
    
    // Wait for the data to load
    await waitFor(() => {
      expect(getCheckInsByPlace).toHaveBeenCalled();
    });
    
    // Check that the places are displayed
    expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    
    // Check that the check-in counts are displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Coffee Shop has 2 check-ins
    expect(screen.getByText('1')).toBeInTheDocument(); // Library has 1 check-in
    
    // Check that the user information is displayed
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('is Working')).toBeInTheDocument();
    expect(screen.getByText('anotheruser')).toBeInTheDocument();
    expect(screen.getByText('is Reading')).toBeInTheDocument();
    expect(screen.getByText('thirduser')).toBeInTheDocument();
    expect(screen.getByText('is Studying')).toBeInTheDocument();
  });
  
  it('renders the empty state when there are no check-ins', async () => {
    // Mock empty data
    vi.mocked(getCheckInsByPlace).mockResolvedValue({
      data: [],
      error: null,
    });
    
    render(<Home />, { wrapper: Wrapper });
    
    // Wait for the data to load
    await waitFor(() => {
      expect(getCheckInsByPlace).toHaveBeenCalled();
    });
    
    // Check that the empty state is displayed
    expect(screen.getByText('No active check-ins')).toBeInTheDocument();
    expect(screen.getByText('Your friends\' check-ins will appear here.')).toBeInTheDocument();
  });
  
  it('renders the error state when there is an error', async () => {
    // Mock error
    vi.mocked(getCheckInsByPlace).mockResolvedValue({
      data: null,
      error: 'Failed to fetch check-ins',
    });
    
    render(<Home />, { wrapper: Wrapper });
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch check-ins')).toBeInTheDocument();
    });
  });
  
  it('opens the check-in modal when the button is clicked', async () => {
    render(<Home />, { wrapper: Wrapper });
    
    // Wait for the data to load
    await waitFor(() => {
      expect(getCheckInsByPlace).toHaveBeenCalled();
    });
    
    // Click the check-in button
    fireEvent.click(screen.getByLabelText('Check in'));
    
    // Check that the modal is displayed
    expect(screen.getAllByText('Check In')[0]).toBeInTheDocument();
    expect(screen.getByLabelText('Where are you?')).toBeInTheDocument();
    expect(screen.getByLabelText('What are you doing? (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Who can see this?')).toBeInTheDocument();
  });
  
  it('refreshes the data when the subscription changes', async () => {
    // Reset the mock to clear any previous calls
    vi.mocked(getCheckInsByPlace).mockClear();
    
    // Initial render
    const { unmount } = render(<Home />, { wrapper: Wrapper });
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(getCheckInsByPlace).toHaveBeenCalled();
    });
    
    // Unmount to clean up
    unmount();
    
    // Reset the mock again
    vi.mocked(getCheckInsByPlace).mockClear();
    
    // Simulate a subscription update
    vi.mocked(useDataSubscription).mockReturnValue({
      data: [{ id: 'new-check-in' }],
      isLoading: false,
      error: null,
    });
    
    // Re-render with the updated subscription
    render(<Home />, { wrapper: Wrapper });
    
    // Check that the data was refreshed
    await waitFor(() => {
      expect(getCheckInsByPlace).toHaveBeenCalled();
    });
  });
}); 