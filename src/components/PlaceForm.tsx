import React, { useState } from 'react';
import styled from 'styled-components';
import { Place, PlaceInput, createPlace, updatePlace } from '../utils/placeService';
import Button from './Button';

interface PlaceFormProps {
  place?: Place;
  onClose: () => void;
  onSave: () => void;
}

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const FormTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 20px;
`;

const FormField = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-top: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

/**
 * Form component for adding or editing a place
 * This is a placeholder implementation that will be enhanced with Google Places API integration
 */
const PlaceForm: React.FC<PlaceFormProps> = ({ place, onClose, onSave }) => {
  const [name, setName] = useState(place?.name || '');
  const [address, setAddress] = useState(place?.address || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!place;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !address.trim()) {
      setError('Name and address are required');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // In a real implementation, we would get lat/lng from Google Places API
      // For now, we'll use placeholder values
      const placeData: PlaceInput = {
        name,
        address,
        lat: place?.lat || 40.7128, // Default to NYC coordinates
        lng: place?.lng || -74.0060,
        google_place_id: place?.google_place_id || null
      };
      
      if (isEditing && place) {
        const { error: updateError } = await updatePlace(place.id, placeData);
        if (updateError) throw new Error(String(updateError));
      } else {
        const { error: createError } = await createPlace(placeData);
        if (createError) throw new Error(String(createError));
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer data-testid="place-form">
      <FormTitle>{isEditing ? 'Edit Place' : 'Add New Place'}</FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormField>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter place name"
            disabled={isSubmitting}
            data-testid="place-name-input"
          />
        </FormField>
        
        <FormField>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            disabled={isSubmitting}
            data-testid="place-address-input"
          />
        </FormField>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ButtonContainer>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isSubmitting}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            data-testid="save-button"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
          </Button>
        </ButtonContainer>
      </form>
    </FormContainer>
  );
};

export default PlaceForm; 