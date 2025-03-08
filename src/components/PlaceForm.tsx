import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Place, PlaceInput, createPlace, updatePlace } from '../utils/placeService';
import Button from './Button';
import { useGoogleMapsApi, getLatLngFromPlace, formatPlaceAddress, getPlaceId } from '../utils/googleMapsUtils';

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

const MapPreview = styled.div`
  width: 100%;
  height: 200px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
`;

const LoadingMessage = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
  padding: 10px;
`;

/**
 * Form component for adding or editing a place
 * Enhanced with Google Places API integration for address autocomplete
 */
const PlaceForm: React.FC<PlaceFormProps> = ({ place, onClose, onSave }) => {
  const [name, setName] = useState(place?.name || '');
  const [address, setAddress] = useState(place?.address || '');
  const [lat, setLat] = useState<number | null>(place?.lat || null);
  const [lng, setLng] = useState<number | null>(place?.lng || null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(place?.google_place_id || null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reference to the address input element for Places Autocomplete
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  // Reference to the Places Autocomplete instance
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Load the Google Maps API
  const { isLoaded, loadError } = useGoogleMapsApi();
  
  const isEditing = !!place;
  
  // Initialize Places Autocomplete when the API is loaded
  useEffect(() => {
    if (isLoaded && addressInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['establishment', 'geocode'],
      });
      
      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const selectedPlace = autocompleteRef.current?.getPlace();
        
        if (selectedPlace) {
          // Update form with selected place details
          if (selectedPlace.name) {
            setName(selectedPlace.name);
          }
          
          setAddress(formatPlaceAddress(selectedPlace));
          
          const latLng = getLatLngFromPlace(selectedPlace);
          if (latLng) {
            setLat(latLng.lat);
            setLng(latLng.lng);
          }
          
          const placeId = getPlaceId(selectedPlace);
          if (placeId) {
            setGooglePlaceId(placeId);
          }
        }
      });
    }
  }, [isLoaded]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !address.trim()) {
      setError('Name and address are required');
      return;
    }
    
    if (!lat || !lng) {
      setError('Please select a valid address from the suggestions');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const placeData: PlaceInput = {
        name,
        address,
        lat,
        lng,
        google_place_id: googlePlaceId
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
  
  if (loadError) {
    return (
      <FormContainer data-testid="place-form">
        <FormTitle>Error Loading Maps</FormTitle>
        <ErrorMessage>
          Failed to load Google Maps API. Please try again later.
        </ErrorMessage>
        <ButtonContainer>
          <Button onClick={onClose} data-testid="cancel-button">
            Close
          </Button>
        </ButtonContainer>
      </FormContainer>
    );
  }
  
  return (
    <FormContainer data-testid="place-form">
      <FormTitle>{isEditing ? 'Edit Place' : 'Add New Place'}</FormTitle>
      
      {!isLoaded ? (
        <LoadingMessage>Loading Google Maps...</LoadingMessage>
      ) : (
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
              ref={addressInputRef}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Start typing an address..."
              disabled={isSubmitting}
              data-testid="place-address-input"
            />
          </FormField>
          
          {lat && lng && (
            <MapPreview>
              <img 
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=500x200&markers=color:red%7C${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
                alt="Map preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </MapPreview>
          )}
          
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
              disabled={isSubmitting || !isLoaded}
              data-testid="save-button"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </Button>
          </ButtonContainer>
        </form>
      )}
    </FormContainer>
  );
};

export default PlaceForm; 