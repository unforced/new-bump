import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { createCheckIn } from '../utils/statusService';
import Button from './Button';
import Input from './Input';
import Card from './Card';

const FormContainer = styled(Card)`
  padding: ${({ theme }) => theme.space[4]}px;
  max-width: 500px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.space[3]}px;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.space[3]}px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.space[4]}px;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.space[2]}px;
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.success};
  margin-top: ${({ theme }) => theme.space[2]}px;
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.space[2]}px;
  border: 1px solid ${({ theme }) => theme.colors.textLight};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 16px;
  background-color: white;
`;

interface Place {
  id: string;
  name: string;
}

interface CheckInFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  places?: Place[];
}

const CheckInForm: React.FC<CheckInFormProps> = ({ 
  onClose, 
  onSuccess,
  places = [] 
}) => {
  const { user } = useAuth();
  const [activity, setActivity] = useState<string>('');
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('public');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>(places);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // If no places are provided, we could fetch them here
  useEffect(() => {
    if (places.length > 0) {
      setAvailablePlaces(places);
    }
    // We could add a fetch here if needed
  }, [places]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to check in');
      }
      
      if (!selectedPlace) {
        throw new Error('Please select a place');
      }
      
      const checkInData = {
        user_id: user.id,
        place_id: selectedPlace.id,
        activity: activity || 'Hanging out',
        privacy_level: privacyLevel,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };
      
      const { error } = await createCheckIn(checkInData);
      
      if (error) {
        throw new Error(error);
      }
      
      // Set success state
      setSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setActivity('');
        setPrivacyLevel('public');
        setExpiresAt('');
        setSelectedPlace(null);
        setSuccess(false);
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>Check In</FormTitle>
      
      {success ? (
        <SuccessMessage>Check-in successful!</SuccessMessage>
      ) : (
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="place">Where are you?</label>
            <Select 
              id="place"
              value={selectedPlace?.id || ''}
              onChange={(e) => {
                const placeId = e.target.value;
                const place = availablePlaces.find(p => p.id === placeId);
                setSelectedPlace(place || null);
              }}
              required
            >
              <option value="">Select a place</option>
              {availablePlaces.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Input
              id="activity"
              label="What are you doing? (optional)"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g., Working, Reading, Coffee"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="privacy">Who can see this?</label>
            <Select
              id="privacy"
              value={privacyLevel}
              onChange={(e) => setPrivacyLevel(e.target.value as 'public' | 'friends' | 'private')}
            >
              <option value="public">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="private">Just Me</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="expiresAt">Expires At (optional)</label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Checking in...' : 'Check In'}
            </Button>
          </ButtonGroup>
        </form>
      )}
    </FormContainer>
  );
};

export default CheckInForm; 