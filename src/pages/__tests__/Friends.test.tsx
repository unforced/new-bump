import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Friends from '../Friends';
import * as friendServiceModule from '../../utils/friendService';
import { ThemeProvider } from 'styled-components';
import theme from '../../styles/theme';

// Mock the friend service
vi.mock('../../utils/friendService', () => ({
  getFriends: vi.fn(),
  acceptFriend: vi.fn(),
  removeFriend: vi.fn(),
  updateHopeToBump: vi.fn(),
  subscribeFriends: vi.fn(),
  unsubscribeFriends: vi.fn(),
}));

// Mock the UserSelector component
vi.mock('../../components/UserSelector', () => ({
  default: vi.fn(({ onClose }) => (
    <div data-testid="user-selector">
      User Selector
      <button onClick={onClose} data-testid="mock-close-button">Close</button>
    </div>
  )),
}));

// Mock window.confirm
const originalConfirm = window.confirm;

describe('Friends Page', () => {
  const mockFriends = [
    {
      id: 'friend-1',
      user_id: 'current-user-id',
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
      user_id: 'current-user-id',
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
    },
    {
      id: 'friend-3',
      user_id: 'friend-user-id-3',
      friend_id: 'current-user-id',
      status: 'pending',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      hope_to_bump: false,
      profiles: {
        username: 'friend3',
        full_name: 'Friend Three',
        avatar_url: null
      }
    },
    {
      id: 'friend-4',
      user_id: 'current-user-id',
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
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful getFriends
    vi.mocked(friendServiceModule.getFriends).mockResolvedValue({
      data: mockFriends,
      error: null
    });
    
    // Mock successful acceptFriend
    vi.mocked(friendServiceModule.acceptFriend).mockResolvedValue({
      data: {
        ...mockFriends[2],
        status: 'accepted',
        updated_at: '2025-03-08T01:00:00.000Z'
      },
      error: null
    });
    
    // Mock successful removeFriend
    vi.mocked(friendServiceModule.removeFriend).mockResolvedValue({
      data: { id: 'friend-1' },
      error: null
    });
    
    // Mock successful updateHopeToBump
    vi.mocked(friendServiceModule.updateHopeToBump).mockResolvedValue({
      data: {
        ...mockFriends[0],
        hope_to_bump: true,
        updated_at: '2025-03-08T01:00:00.000Z'
      },
      error: null
    });
    
    // Mock successful subscribeFriends
    vi.mocked(friendServiceModule.subscribeFriends).mockResolvedValue({
      data: {} as any,
      error: null
    });
    
    // Mock window.confirm to return true
    window.confirm = vi.fn(() => true);
  });
  
  afterEach(() => {
    // Restore window.confirm
    window.confirm = originalConfirm;
  });
  
  it('renders the component correctly', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Check that getFriends was called
    expect(friendServiceModule.getFriends).toHaveBeenCalled();
    
    // Check that subscribeFriends was called
    expect(friendServiceModule.subscribeFriends).toHaveBeenCalled();
    
    // Check that the page title is rendered
    expect(screen.getByText('Friends')).toBeInTheDocument();
    
    // Check that the add friend button is rendered
    expect(screen.getByText('Add Friend')).toBeInTheDocument();
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('Friend Requests')).toBeInTheDocument();
      expect(screen.getByText('Sent Requests')).toBeInTheDocument();
      expect(screen.getByText('Friends')).toBeInTheDocument();
    });
    
    // Check that the friends are rendered
    expect(screen.getByText('Friend One')).toBeInTheDocument();
    expect(screen.getByText('@friend1')).toBeInTheDocument();
    expect(screen.getByText('Friend Two')).toBeInTheDocument();
    expect(screen.getByText('@friend2')).toBeInTheDocument();
    
    // Check that the pending requests are rendered
    expect(screen.getByText('Friend Three')).toBeInTheDocument();
    expect(screen.getByText('@friend3')).toBeInTheDocument();
    
    // Check that the sent requests are rendered
    expect(screen.getByText('Friend Four')).toBeInTheDocument();
    expect(screen.getByText('@friend4')).toBeInTheDocument();
  });
  
  it('shows the UserSelector when add friend button is clicked', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('Friends')).toBeInTheDocument();
    });
    
    // Click the add friend button
    fireEvent.click(screen.getByText('Add Friend'));
    
    // Check that the UserSelector is rendered
    expect(screen.getByTestId('user-selector')).toBeInTheDocument();
    
    // Close the UserSelector
    fireEvent.click(screen.getByTestId('mock-close-button'));
    
    // Check that the UserSelector is no longer rendered
    expect(screen.queryByTestId('user-selector')).not.toBeInTheDocument();
  });
  
  it('accepts a friend request', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('Friend Requests')).toBeInTheDocument();
    });
    
    // Click the accept button for the pending request
    const acceptButton = screen.getByTestId('accept-friend-friend-3');
    fireEvent.click(acceptButton);
    
    // Check that acceptFriend was called with the correct ID
    expect(friendServiceModule.acceptFriend).toHaveBeenCalledWith('friend-3');
    
    // Check that getFriends was called again to refresh the list
    expect(friendServiceModule.getFriends).toHaveBeenCalledTimes(2);
  });
  
  it('removes a friend', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('Friends')).toBeInTheDocument();
    });
    
    // Click the remove button for a friend
    const removeButton = screen.getByTestId('remove-friend-friend-1');
    fireEvent.click(removeButton);
    
    // Check that window.confirm was called
    expect(window.confirm).toHaveBeenCalled();
    
    // Check that removeFriend was called with the correct ID
    expect(friendServiceModule.removeFriend).toHaveBeenCalledWith('friend-1');
    
    // Check that getFriends was called again to refresh the list
    expect(friendServiceModule.getFriends).toHaveBeenCalledTimes(2);
  });
  
  it('does not remove a friend if confirmation is cancelled', async () => {
    // Mock window.confirm to return false
    window.confirm = vi.fn(() => false);
    
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('Friends')).toBeInTheDocument();
    });
    
    // Click the remove button for a friend
    const removeButton = screen.getByTestId('remove-friend-friend-1');
    fireEvent.click(removeButton);
    
    // Check that window.confirm was called
    expect(window.confirm).toHaveBeenCalled();
    
    // Check that removeFriend was not called
    expect(friendServiceModule.removeFriend).not.toHaveBeenCalled();
    
    // Check that getFriends was not called again
    expect(friendServiceModule.getFriends).toHaveBeenCalledTimes(1);
  });
  
  it('toggles hope to bump status', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Wait for friends to load
    await waitFor(() => {
      expect(screen.getByText('Friends')).toBeInTheDocument();
    });
    
    // Click the hope to bump button for a friend
    const hopeToBumpButton = screen.getByTestId('hope-to-bump-friend-1');
    fireEvent.click(hopeToBumpButton);
    
    // Check that updateHopeToBump was called with the correct ID and status
    expect(friendServiceModule.updateHopeToBump).toHaveBeenCalledWith('friend-1', true);
    
    // Check that getFriends was called again to refresh the list
    expect(friendServiceModule.getFriends).toHaveBeenCalledTimes(2);
  });
  
  it('shows an error message when getFriends fails', async () => {
    // Mock getFriends to return an error
    vi.mocked(friendServiceModule.getFriends).mockResolvedValueOnce({
      data: null,
      error: 'Error fetching friends'
    });
    
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Check that the error message is rendered
    await waitFor(() => {
      expect(screen.getByText('Error fetching friends')).toBeInTheDocument();
    });
  });
  
  it('shows an empty state when there are no friends', async () => {
    // Mock getFriends to return an empty array
    vi.mocked(friendServiceModule.getFriends).mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    render(
      <ThemeProvider theme={theme}>
        <Friends />
      </ThemeProvider>
    );
    
    // Check that the empty state is rendered
    await waitFor(() => {
      expect(screen.getByText('No friends yet')).toBeInTheDocument();
    });
  });
}); 