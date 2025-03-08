import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Place } from '../utils/placeService';
import { useGoogleMapsApi } from '../utils/googleMapsUtils';

interface MapProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  position: relative;
  overflow: hidden;
`;

const PlaceholderText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const InfoWindowContent = styled.div`
  padding: 5px;
`;

const InfoWindowTitle = styled.h3`
  margin: 0 0 5px 0;
  font-size: 16px;
`;

const InfoWindowAddress = styled.p`
  margin: 0;
  font-size: 14px;
`;

const InfoWindowButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

// Default map center (New York City)
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Map options
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

/**
 * Map component that displays places on a Google Map
 */
const Map: React.FC<MapProps> = ({ places, onPlaceClick }) => {
  // Load the Google Maps API
  const { isLoaded, loadError } = useGoogleMapsApi();
  
  // State for the selected place (for info window)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Calculate map center based on places or use default
  const getMapCenter = useCallback(() => {
    if (places.length === 0) {
      return defaultCenter;
    }
    
    // If there's only one place, center on it
    if (places.length === 1) {
      return { lat: places[0].lat, lng: places[0].lng };
    }
    
    // Calculate the center of all places
    const bounds = new google.maps.LatLngBounds();
    places.forEach(place => {
      bounds.extend({ lat: place.lat, lng: place.lng });
    });
    
    const center = bounds.getCenter();
    return { lat: center.lat(), lng: center.lng() };
  }, [places]);
  
  // Handle marker click
  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
  };
  
  // Handle info window close
  const handleInfoWindowClose = () => {
    setSelectedPlace(null);
  };
  
  // Handle view details button click
  const handleViewDetails = () => {
    if (selectedPlace && onPlaceClick) {
      onPlaceClick(selectedPlace);
      setSelectedPlace(null);
    }
  };
  
  if (loadError) {
    return (
      <MapContainer data-testid="map">
        <PlaceholderText>
          Error loading Google Maps. Please try again later.
        </PlaceholderText>
      </MapContainer>
    );
  }
  
  if (!isLoaded) {
    return (
      <MapContainer data-testid="map">
        <PlaceholderText>Loading map...</PlaceholderText>
      </MapContainer>
    );
  }
  
  return (
    <MapContainer data-testid="map">
      {places.length === 0 ? (
        <PlaceholderText>No places to display on the map</PlaceholderText>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={getMapCenter()}
          zoom={places.length === 1 ? 15 : 12}
          options={mapOptions}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.name}
              onClick={() => handleMarkerClick(place)}
              data-testid={`marker-${place.id}`}
            />
          ))}
          
          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={handleInfoWindowClose}
            >
              <InfoWindowContent>
                <InfoWindowTitle>{selectedPlace.name}</InfoWindowTitle>
                <InfoWindowAddress>{selectedPlace.address}</InfoWindowAddress>
                {onPlaceClick && (
                  <InfoWindowButton onClick={handleViewDetails}>
                    View Details
                  </InfoWindowButton>
                )}
              </InfoWindowContent>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </MapContainer>
  );
};

export default Map; 