import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import theme from '../../styles/theme';
import ProfileForm from '../ProfileForm';
import { AuthProvider } from '../../context/AuthContext';
import * as AuthContext from '../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('ProfileForm', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    phone: '1234567890',
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockUpdateProfile = vi.fn();
  const mockOnProfileUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders the profile form with user data', () => {
    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
    expect(screen.getByLabelText(/username/i)).toHaveValue(mockUser.username);
    expect(screen.getByLabelText(/phone/i)).toHaveValue(mockUser.phone);
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
  });

  it('calls updateProfile when form is submitted', async () => {
    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileForm onProfileUpdate={mockOnProfileUpdate} />
        </AuthProvider>
      </ThemeProvider>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const submitButton = screen.getByRole('button', { name: /save profile/i });

    // Change input values
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        username: 'newusername',
        phone: '9876543210',
      });
    });

    // Check if onProfileUpdate callback was called
    await waitFor(() => {
      expect(mockOnProfileUpdate).toHaveBeenCalled();
    });
  });

  it('displays an error message when update fails', async () => {
    const mockError = 'Failed to update profile';
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      updateProfile: vi.fn().mockRejectedValue(new Error(mockError)),
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      </ThemeProvider>
    );

    const submitButton = screen.getByRole('button', { name: /save profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    });
  });

  it('displays a message when user is not logged in', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      updateProfile: mockUpdateProfile,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileForm />
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/please log in to manage your profile/i)).toBeInTheDocument();
  });
}); 