import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getPlaces, Place, deletePlace } from '../utils/placeService';
import Map from '../components/Map';
import PlaceForm from '../components/PlaceForm';
import Button from '../components/Button';
import { FaMapMarkedAlt, FaList, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// Styled components
const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

interface ToggleButtonProps {
  active: boolean;
}

const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? '#fff' : theme.colors.text};
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.backgroundAlt};
  }
  
  svg {
    margin-right: 5px;
  }
`;

const PlacesListContainer = styled.div`
  margin-top: 20px;
`;

const PlaceCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlaceInfo = styled.div`
  flex: 1;
`;

const PlaceName = styled.h3`
  margin: 0 0 5px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const PlaceAddress = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 14px;
`;

const PlaceActions = styled.div`
  display: flex;
  gap: 10px;
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

const Modal = styled.div`
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

/**
 * Places page component
 * Displays a list of places with the ability to toggle between list and map views
 */
const Places: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>(undefined);
  
  // Fetch places on component mount
  useEffect(() => {
    fetchPlaces();
  }, []);
  
  // Function to fetch places from the API
  const fetchPlaces = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getPlaces();
      
      if (error) {
        setError(String(error) || 'Failed to fetch places');
      } else {
        setPlaces(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle place deletion
  const handleDeletePlace = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this place?')) {
      return;
    }
    
    try {
      const { error } = await deletePlace(id);
      
      if (error) {
        setError(String(error) || 'Failed to delete place');
      } else {
        // Remove the deleted place from the state
        setPlaces(places.filter(place => place.id !== id));
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }
  };
  
  // Function to handle place edit
  const handleEditPlace = (place: Place) => {
    setSelectedPlace(place);
    setShowForm(true);
  };
  
  // Function to handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPlace(undefined);
  };
  
  // Function to handle form save
  const handleFormSave = () => {
    setShowForm(false);
    setSelectedPlace(undefined);
    fetchPlaces(); // Refresh the places list
  };
  
  // Function to handle adding a new place
  const handleAddPlace = () => {
    setSelectedPlace(undefined);
    setShowForm(true);
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Places</PageTitle>
        
        <ActionButtons>
          <ViewToggle data-testid="view-toggle">
            <ToggleButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              <FaList /> List
            </ToggleButton>
            <ToggleButton 
              active={viewMode === 'map'} 
              onClick={() => setViewMode('map')}
            >
              <FaMapMarkedAlt /> Map
            </ToggleButton>
          </ViewToggle>
          
          <Button onClick={handleAddPlace} data-testid="add-place-button">
            <FaPlus /> Add Place
          </Button>
        </ActionButtons>
      </PageHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {loading ? (
        <EmptyState>Loading places...</EmptyState>
      ) : (
        <>
          {viewMode === 'list' ? (
            <PlacesListContainer data-testid="places-list">
              {places.length === 0 ? (
                <EmptyState>No places added yet</EmptyState>
              ) : (
                places.map(place => (
                  <PlaceCard key={place.id}>
                    <PlaceInfo>
                      <PlaceName>{place.name}</PlaceName>
                      <PlaceAddress>{place.address}</PlaceAddress>
                    </PlaceInfo>
                    <PlaceActions>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleEditPlace(place)}
                        data-testid={`edit-place-${place.id}`}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleDeletePlace(place.id)}
                        data-testid={`delete-place-${place.id}`}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </PlaceActions>
                  </PlaceCard>
                ))
              )}
            </PlacesListContainer>
          ) : (
            <Map 
              places={places} 
              onPlaceClick={handleEditPlace}
            />
          )}
        </>
      )}
      
      {showForm && (
        <Modal>
          <PlaceForm 
            place={selectedPlace} 
            onClose={handleFormClose} 
            onSave={handleFormSave} 
          />
        </Modal>
      )}
    </PageContainer>
  );
};

export default Places; 