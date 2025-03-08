import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from 'styled-components';
import CheckInForm from '../CheckInForm';
import { useAuth } from '../../context/AuthContext';
import * as statusServiceModule from '../../utils/statusService';
import * as placeServiceModule from '../../utils/placeService';
import theme from '../../styles/theme';
import { UserProfile } from '../../types/auth';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the statusService
vi.mock('../../utils/statusService', () => ({
  createCheckIn: vi.fn(),
}));

describe('CheckInForm', () => {
  const mockUser: UserProfile = {
    id: 'user123',
    email: 'user@example.com',
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockPlaces: placeServiceModule.Place[] = [
    { 
      id: 'place1', 
      name: 'Coffee Shop',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.0060,
      created_by: 'user123',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
      google_place_id: null
    },
    { 
      id: 'place2', 
      name: 'Library',
      address: '456 Park Ave',
      lat: 40.7580,
      lng: -73.9855,
      created_by: 'user123',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
      google_place_id: null
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    // Mock the useAuth hook
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      devLogin: vi.fn(),
    });

    const onCloseMock = vi.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <CheckInForm onClose={onCloseMock} places={mockPlaces} />
      </ThemeProvider>
    );
    
    // Check that the form title is rendered
    expect(screen.getAllByText('Check In')[0]).toBeInTheDocument();
    
    // Check that the places dropdown is rendered with options
    const placeSelect = screen.getByLabelText(/where are you/i);
    expect(placeSelect).toBeInTheDocument();
    expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    
    // Check that the activity input is rendered
    expect(screen.getByLabelText(/what are you doing/i)).toBeInTheDocument();
    
    // Check that the privacy dropdown is rendered
    expect(screen.getByLabelText(/who can see this/i)).toBeInTheDocument();
    
    // Check that the buttons are rendered
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument();
  });

  it('displays the provided places in the dropdown', () => {
    // Mock the useAuth hook
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      devLogin: vi.fn(),
    });

    render(
      <ThemeProvider theme={theme}>
        <CheckInForm onClose={vi.fn()} places={mockPlaces} />
      </ThemeProvider>
    );
    
    // Get all options in the place select dropdown
    const placeSelect = screen.getByLabelText(/where are you/i);
    const options = Array.from(placeSelect.querySelectorAll('option'));
    
    // Check that there are 3 options (including the default "Select a place" option)
    expect(options).toHaveLength(3);
    
    // Check that the place names are in the options
    expect(options[1].textContent).toBe('Coffee Shop');
    expect(options[2].textContent).toBe('Library');
  });

  it('submits the form with correct data', async () => {
    // Mock the useAuth hook
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      devLogin: vi.fn(),
    });
    
    // Mock successful response from createCheckIn
    vi.mocked(statusServiceModule.createCheckIn).mockResolvedValue({
      data: {
        id: 'check-in-123',
        user_id: 'user123',
        place_id: 'place1',
        activity: 'Working',
        privacy_level: 'public',
        created_at: '2023-01-01T00:00:00Z',
        expires_at: null,
        place: mockPlaces[0],
        profile: {
          id: 'user123',
          email: 'user@example.com',
          username: 'testuser',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: null,
          phone: null,
          avatar_url: null,
          status: null,
          status_updated_at: null
        },
      },
      error: null
    });
    
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    
    // Render the component
    render(
      <ThemeProvider theme={theme}>
        <CheckInForm 
          onClose={onCloseMock} 
          onSuccess={onSuccessMock} 
          places={mockPlaces} 
        />
      </ThemeProvider>
    );
    
    // Fill out the form
    const placeSelect = screen.getByLabelText(/where are you/i);
    fireEvent.change(placeSelect, { target: { value: 'place1' } });
    
    const activityInput = screen.getByLabelText(/what are you doing/i);
    fireEvent.change(activityInput, { target: { value: 'Working' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /check in/i }));
    
    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText(/check-in successful/i)).toBeInTheDocument();
    });
    
    // Check that createCheckIn was called with the correct data
    expect(statusServiceModule.createCheckIn).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user123',
      place_id: 'place1',
      activity: 'Working',
      privacy_level: 'public',
    }));
    
    // Check that onSuccess is called after the timeout
    await new Promise(resolve => setTimeout(resolve, 1600));
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it('shows an error message when the form submission fails', async () => {
    // Mock the useAuth hook
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      devLogin: vi.fn(),
    });
    
    // Mock an error response
    vi.mocked(statusServiceModule.createCheckIn).mockResolvedValue({
      data: null,
      error: 'Failed to check in'
    });
    
    // Render the component
    render(
      <ThemeProvider theme={theme}>
        <CheckInForm onClose={vi.fn()} places={mockPlaces} />
      </ThemeProvider>
    );
    
    // Fill out the form
    const placeSelect = screen.getByLabelText(/where are you/i);
    fireEvent.change(placeSelect, { target: { value: 'place1' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /check in/i }));
    
    // Check that an error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to check in/i)).toBeInTheDocument();
    });
  });

  it('validates that a place is selected', async () => {
    // Mock the useAuth hook
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      devLogin: vi.fn(),
    });
    
    // Render the component
    render(
      <ThemeProvider theme={theme}>
        <CheckInForm onClose={vi.fn()} places={mockPlaces} />
      </ThemeProvider>
    );
    
    // Submit the form without selecting a place
    fireEvent.click(screen.getByRole('button', { name: /check in/i }));
    
    // Check that createCheckIn was not called
    expect(statusServiceModule.createCheckIn).not.toHaveBeenCalled();
  });

  it('handles the case when user is not logged in', async () => {
    // Mock the useAuth hook to return no user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      devLogin: vi.fn(),
    });
    
    // Render the component
    render(
      <ThemeProvider theme={theme}>
        <CheckInForm onClose={vi.fn()} places={mockPlaces} />
      </ThemeProvider>
    );
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /check in/i }));
    
    // Check that createCheckIn was not called
    expect(statusServiceModule.createCheckIn).not.toHaveBeenCalled();
  });
}); 