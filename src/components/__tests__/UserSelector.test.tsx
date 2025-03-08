import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserSelector from '../UserSelector';
import * as friendServiceModule from '../../utils/friendService';
import { ThemeProvider } from 'styled-components';
import theme from '../../styles/theme';

// Mock the friend service
vi.mock('../../utils/friendService', () => ({
  searchUsers: vi.fn(),
  addFriend: vi.fn(),
}));

describe('UserSelector', () => {
  const mockOnClose = vi.fn();
  const mockOnFriendAdded = vi.fn();
  
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
    
    // Mock successful search
    vi.mocked(friendServiceModule.searchUsers).mockResolvedValue({
      data: mockUsers,
      error: null
    });
    
    // Mock successful friend request
    vi.mocked(friendServiceModule.addFriend).mockResolvedValue({
      data: {
        id: 'friend-1',
        user_id: 'current-user-id',
        friend_id: 'user-1',
        status: 'pending',
        created_at: '2025-03-08T00:00:00.000Z',
        updated_at: null,
        hope_to_bump: false
      },
      error: null
    });
  });
  
  it('renders the component correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Check that the title is rendered
    expect(screen.getByText('Add Friend')).toBeInTheDocument();
    
    // Check that the search input is rendered
    expect(screen.getByPlaceholderText('Search by username or email...')).toBeInTheDocument();
    
    // Check that the cancel button is rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  it('searches for users when typing in the search input', async () => {
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search by username or email...');
    fireEvent.change(searchInput, { target: { value: 'user' } });
    
    // Wait for the debounced search to be called
    await waitFor(() => {
      expect(friendServiceModule.searchUsers).toHaveBeenCalledWith('user');
    });
    
    // Check that the users are rendered
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('@user1')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
      expect(screen.getByText('@user2')).toBeInTheDocument();
    });
  });
  
  it('shows an empty state when no users are found', async () => {
    // Mock empty search results
    vi.mocked(friendServiceModule.searchUsers).mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search by username or email...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Wait for the debounced search to be called
    await waitFor(() => {
      expect(friendServiceModule.searchUsers).toHaveBeenCalledWith('nonexistent');
    });
    
    // Check that the empty state is rendered
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });
  
  it('shows an error message when search fails', async () => {
    // Mock search error
    vi.mocked(friendServiceModule.searchUsers).mockResolvedValueOnce({
      data: null,
      error: 'Error searching for users'
    });
    
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search by username or email...');
    fireEvent.change(searchInput, { target: { value: 'user' } });
    
    // Wait for the debounced search to be called
    await waitFor(() => {
      expect(friendServiceModule.searchUsers).toHaveBeenCalledWith('user');
    });
    
    // Check that the error message is rendered
    await waitFor(() => {
      expect(screen.getByText('Error searching for users')).toBeInTheDocument();
    });
  });
  
  it('adds a friend when the add button is clicked', async () => {
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Type in the search input to trigger search
    const searchInput = screen.getByPlaceholderText('Search by username or email...');
    fireEvent.change(searchInput, { target: { value: 'user' } });
    
    // Wait for the users to be rendered
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });
    
    // Click the add button for the first user
    const addButton = screen.getAllByText('Add Friend')[0];
    fireEvent.click(addButton);
    
    // Check that addFriend was called with the correct user ID
    expect(friendServiceModule.addFriend).toHaveBeenCalledWith({ friend_id: 'user-1' });
    
    // Check that the success message is rendered
    await waitFor(() => {
      expect(screen.getByText('Friend request sent successfully')).toBeInTheDocument();
    });
    
    // Check that onFriendAdded was called
    expect(mockOnFriendAdded).toHaveBeenCalled();
  });
  
  it('shows an error message when adding a friend fails', async () => {
    // Mock add friend error
    vi.mocked(friendServiceModule.addFriend).mockResolvedValueOnce({
      data: null,
      error: 'Error adding friend'
    });
    
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Type in the search input to trigger search
    const searchInput = screen.getByPlaceholderText('Search by username or email...');
    fireEvent.change(searchInput, { target: { value: 'user' } });
    
    // Wait for the users to be rendered
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });
    
    // Click the add button for the first user
    const addButton = screen.getAllByText('Add Friend')[0];
    fireEvent.click(addButton);
    
    // Check that the error message is rendered
    await waitFor(() => {
      expect(screen.getByText('Error adding friend')).toBeInTheDocument();
    });
    
    // Check that onFriendAdded was not called
    expect(mockOnFriendAdded).not.toHaveBeenCalled();
  });
  
  it('closes the modal when the close button is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Click the close button
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('closes the modal when the cancel button is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <UserSelector onClose={mockOnClose} onFriendAdded={mockOnFriendAdded} />
      </ThemeProvider>
    );
    
    // Click the cancel button
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 