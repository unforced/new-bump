import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Input from './Input';
import Card from './Card';

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin: 0.5rem 0;
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.success};
  margin: 0.5rem 0;
`;

interface ProfileFormProps {
  onProfileUpdate?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileUpdate }) => {
  const { user, updateProfile, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await updateProfile({
        username,
        phone,
      });
      setSuccessMessage('Profile updated successfully!');
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <p>Please log in to manage your profile.</p>
      </Card>
    );
  }

  return (
    <FormContainer>
      <Card>
        <h2>Edit Profile</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={user.email}
            disabled
            placeholder="Your email"
          />
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number (optional)"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </Form>
        
        {(error || authError) && <ErrorMessage>{error || authError}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      </Card>
    </FormContainer>
  );
};

export default ProfileForm; 