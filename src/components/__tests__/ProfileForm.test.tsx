import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from 'styled-components';
import ProfileForm from '../ProfileForm';
import * as AuthContext from '../../context/AuthContext';
import { AuthProvider } from '../../context/AuthContext';
import theme from '../../styles/theme';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ProfileForm', () => {
  const mockUser = {
    id: 'user123',
    email: 'user@example.com',
    username: 'testuser',
    phone: '123-456-7890',
    created_at: '2025-03-01T12:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile form with user data', () => {
    // Mock the useAuth hook to return a user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      updateProfile: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      devLogin: vi.fn(),
    });

    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      </ThemeProvider>
    );

    // Check that the form fields are populated with user data
    expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
    expect(screen.getByLabelText(/email/i)).toHaveValue('user@example.com');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('123-456-7890');
  });

  it('displays an error message when update fails', async () => {
    // Mock the updateProfile function to return an error
    const mockUpdateProfile = vi.fn().mockRejectedValue(new Error('Failed to update profile'));

    // Mock the useAuth hook to return a user and the mock updateProfile function
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      devLogin: vi.fn(),
    });

    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      </ThemeProvider>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newusername' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check that updateProfile was called with the correct data
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      username: 'newusername',
      phone: '123-456-7890',
    });
    
    // Check that an error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    });
  });

  it('displays a message when user is not logged in', () => {
    // Mock the useAuth hook to return no user
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      updateProfile: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      devLogin: vi.fn(),
    });

    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      </ThemeProvider>
    );

    // Check that a message is displayed
    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });
}); 