import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getFriends, acceptFriend, removeFriend, updateHopeToBump, subscribeFriends, unsubscribeFriends } from '../utils/friendService';
import { Friend } from '../utils/friendService';
import Button from '../components/Button';
import UserSelector from '../components/UserSelector';
import { FaUserPlus, FaCheck, FaTimes, FaHeart } from 'react-icons/fa';
import { RealtimeChannel } from '@supabase/supabase-js';

// Styled components
const PageContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const FriendsContainer = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin: 20px 0 10px;
  font-size: 1.2rem;
`;

const FriendCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 10px;
`;

const FriendInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
`;

const FriendDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const FriendName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Username = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 14px;
`;

const FriendActions = styled.div`
  display: flex;
  gap: 10px;
`;

interface HopeToBumpButtonProps {
  $active: boolean;
}

const HopeToBumpButton = styled.button<HopeToBumpButtonProps>`
  background-color: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? 'white' : theme.colors.textLight};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textLight};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.backgroundAlt};
    opacity: ${({ $active }) => $active ? 0.9 : 1};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 5px;
  }
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 10px 15px;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 20px;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.colors.textLight};
`;

/**
 * Friends page component
 * Displays a list of friends and allows adding new friends
 */
const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [updatingFriend, setUpdatingFriend] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
  
  // Fetch friends on component mount
  useEffect(() => {
    fetchFriends();
    
    // Subscribe to friend updates
    const setupSubscription = async () => {
      const { data: channel, error } = await subscribeFriends(handleFriendUpdate);
      
      if (error) {
        console.error('Error subscribing to friends:', error);
      } else {
        setSubscription(channel);
      }
    };
    
    setupSubscription();
    
    // Cleanup subscription on component unmount
    return () => {
      if (subscription) {
        unsubscribeFriends(subscription);
      }
    };
  }, []);
  
  // Handle friend update from subscription
  const handleFriendUpdate = (payload: { new: Friend; old: Friend | null }) => {
    // Refresh friends list when a friend is updated
    fetchFriends();
  };
  
  // Fetch friends from the API
  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getFriends();
      
      if (error) {
        setError(String(error));
      } else {
        setFriends(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle accepting a friend request
  const handleAcceptFriend = async (friendId: string) => {
    setUpdatingFriend(friendId);
    setError(null);
    
    try {
      const { error } = await acceptFriend(friendId);
      
      if (error) {
        setError(String(error));
      } else {
        // Refresh friends list
        fetchFriends();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setUpdatingFriend(null);
    }
  };
  
  // Handle removing a friend
  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }
    
    setUpdatingFriend(friendId);
    setError(null);
    
    try {
      const { error } = await removeFriend(friendId);
      
      if (error) {
        setError(String(error));
      } else {
        // Refresh friends list
        fetchFriends();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setUpdatingFriend(null);
    }
  };
  
  // Handle toggling hope to bump status
  const handleToggleHopeToBump = async (friendId: string, currentStatus: boolean) => {
    setUpdatingFriend(friendId);
    setError(null);
    
    try {
      const { error } = await updateHopeToBump(friendId, !currentStatus);
      
      if (error) {
        setError(String(error));
      } else {
        // Refresh friends list
        fetchFriends();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setUpdatingFriend(null);
    }
  };
  
  // Get initials from name for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Filter friends by status
  const acceptedFriends = friends.filter(friend => friend.status === 'accepted' && friend.user_id === friend.user_id);
  const pendingRequests = friends.filter(friend => friend.status === 'pending' && friend.friend_id === friend.user_id);
  const sentRequests = friends.filter(friend => friend.status === 'pending' && friend.user_id === friend.user_id);
  
  return (
    <PageContainer data-testid="friends-page">
      <PageHeader>
        <PageTitle>Friends</PageTitle>
        <Button onClick={() => setShowUserSelector(true)} data-testid="add-friend-button">
          <FaUserPlus /> Add Friend
        </Button>
      </PageHeader>
      
      {error && <ErrorMessage data-testid="error-message">{error}</ErrorMessage>}
      
      {loading ? (
        <LoadingIndicator>Loading friends...</LoadingIndicator>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <FriendsContainer data-testid="pending-requests">
              <SectionTitle>Friend Requests</SectionTitle>
              {pendingRequests.map(friend => (
                <FriendCard key={friend.id} data-testid={`friend-card-${friend.id}`}>
                  <FriendInfo>
                    <Avatar>{getInitials(friend.profiles?.full_name || '')}</Avatar>
                    <FriendDetails>
                      <FriendName>{friend.profiles?.full_name}</FriendName>
                      <Username>@{friend.profiles?.username}</Username>
                    </FriendDetails>
                  </FriendInfo>
                  <FriendActions>
                    <ActionButton
                      onClick={() => handleAcceptFriend(friend.id)}
                      disabled={updatingFriend === friend.id}
                      title="Accept"
                      data-testid={`accept-friend-${friend.id}`}
                    >
                      <FaCheck />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleRemoveFriend(friend.id)}
                      disabled={updatingFriend === friend.id}
                      title="Decline"
                      data-testid={`remove-friend-${friend.id}`}
                    >
                      <FaTimes />
                    </ActionButton>
                  </FriendActions>
                </FriendCard>
              ))}
            </FriendsContainer>
          )}
          
          {sentRequests.length > 0 && (
            <FriendsContainer data-testid="sent-requests">
              <SectionTitle>Sent Requests</SectionTitle>
              {sentRequests.map(friend => (
                <FriendCard key={friend.id} data-testid={`friend-card-${friend.id}`}>
                  <FriendInfo>
                    <Avatar>{getInitials(friend.profiles?.full_name || '')}</Avatar>
                    <FriendDetails>
                      <FriendName>{friend.profiles?.full_name}</FriendName>
                      <Username>@{friend.profiles?.username}</Username>
                    </FriendDetails>
                  </FriendInfo>
                  <FriendActions>
                    <ActionButton
                      onClick={() => handleRemoveFriend(friend.id)}
                      disabled={updatingFriend === friend.id}
                      title="Cancel Request"
                      data-testid={`remove-friend-${friend.id}`}
                    >
                      <FaTimes />
                    </ActionButton>
                  </FriendActions>
                </FriendCard>
              ))}
            </FriendsContainer>
          )}
          
          <FriendsContainer data-testid="friends-list">
            <SectionTitle>Friends</SectionTitle>
            {acceptedFriends.length === 0 ? (
              <EmptyState>No friends yet</EmptyState>
            ) : (
              acceptedFriends.map(friend => (
                <FriendCard key={friend.id} data-testid={`friend-card-${friend.id}`}>
                  <FriendInfo>
                    <Avatar>{getInitials(friend.profiles?.full_name || '')}</Avatar>
                    <FriendDetails>
                      <FriendName>{friend.profiles?.full_name}</FriendName>
                      <Username>@{friend.profiles?.username}</Username>
                    </FriendDetails>
                  </FriendInfo>
                  <FriendActions>
                    <HopeToBumpButton
                      $active={friend.hope_to_bump}
                      onClick={() => handleToggleHopeToBump(friend.id, friend.hope_to_bump)}
                      disabled={updatingFriend === friend.id}
                      data-testid={`hope-to-bump-${friend.id}`}
                    >
                      <FaHeart /> Hope to Bump
                    </HopeToBumpButton>
                    <ActionButton
                      onClick={() => handleRemoveFriend(friend.id)}
                      disabled={updatingFriend === friend.id}
                      title="Remove Friend"
                      data-testid={`remove-friend-${friend.id}`}
                    >
                      <FaTimes />
                    </ActionButton>
                  </FriendActions>
                </FriendCard>
              ))
            )}
          </FriendsContainer>
        </>
      )}
      
      {showUserSelector && (
        <UserSelector
          onClose={() => setShowUserSelector(false)}
          onFriendAdded={() => {
            setShowUserSelector(false);
            fetchFriends();
          }}
        />
      )}
    </PageContainer>
  );
};

export default Friends; 