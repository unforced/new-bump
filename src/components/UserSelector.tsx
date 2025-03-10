import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { searchUsers, addFriend } from '../utils/friendService';
import Button from './Button';
import { FaSearch, FaUserPlus, FaTimes } from 'react-icons/fa';
import { debounce } from 'lodash';

interface UserSelectorProps {
  onClose: () => void;
  onFriendAdded?: () => void;
}

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 16px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textLight};
`;

const UserList = styled.div`
  margin-top: 20px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  margin-bottom: 10px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    opacity: 0.9;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Username = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 14px;
`;

const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 5px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 10px 15px;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.success};
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
 * UserSelector component for searching and selecting users to add as friends
 */
const UserSelector: React.FC<UserSelectorProps> = ({ onClose, onFriendAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addingFriend, setAddingFriend] = useState<string | null>(null);
  
  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setUsers([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await searchUsers(query);
        
        if (error) {
          setError(String(error));
        } else {
          setUsers(data || []);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );
  
  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // Cleanup function to cancel debounced search
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle adding a friend
  const handleAddFriend = async (userId: string) => {
    setAddingFriend(userId);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await addFriend({ friend_id: userId });
      
      if (error) {
        setError(String(error));
      } else {
        setSuccess('Friend request sent successfully');
        
        // Call the onFriendAdded callback if provided
        if (onFriendAdded) {
          onFriendAdded();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setAddingFriend(null);
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
  
  return (
    <ModalOverlay data-testid="user-selector">
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add Friend</ModalTitle>
          <CloseButton onClick={onClose} data-testid="close-button">
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        {error && <ErrorMessage data-testid="error-message">{error}</ErrorMessage>}
        {success && <SuccessMessage data-testid="success-message">{success}</SuccessMessage>}
        
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            data-testid="search-input"
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </SearchContainer>
        
        {loading ? (
          <LoadingIndicator>Searching...</LoadingIndicator>
        ) : (
          <UserList>
            {users.length === 0 ? (
              searchQuery.length >= 3 ? (
                <EmptyState>No users found</EmptyState>
              ) : (
                <EmptyState>Enter at least 3 characters to search</EmptyState>
              )
            ) : (
              users.map(user => (
                <UserCard key={user.id} data-testid={`user-card-${user.id}`}>
                  <UserInfo>
                    <Avatar>{getInitials(user.full_name)}</Avatar>
                    <UserDetails>
                      <UserName>{user.full_name}</UserName>
                      <Username>@{user.username}</Username>
                    </UserDetails>
                  </UserInfo>
                  <AddButton
                    onClick={() => handleAddFriend(user.id)}
                    disabled={addingFriend === user.id}
                    data-testid={`add-friend-${user.id}`}
                  >
                    <FaUserPlus />
                    {addingFriend === user.id ? 'Adding...' : 'Add Friend'}
                  </AddButton>
                </UserCard>
              ))
            )}
          </UserList>
        )}
        
        <Button
          variant="secondary"
          onClick={onClose}
          fullWidth
          style={{ marginTop: '20px' }}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserSelector; 