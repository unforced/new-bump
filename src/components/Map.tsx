import React from 'react';
import styled from 'styled-components';
import { Place } from '../utils/placeService';

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

const PlaceMarker = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

/**
 * A placeholder Map component that will be replaced with Google Maps integration
 */
const Map: React.FC<MapProps> = ({ places, onPlaceClick }) => {
  // This is a placeholder implementation
  // We'll replace this with actual Google Maps integration later
  
  const handlePlaceClick = (place: Place) => {
    if (onPlaceClick) {
      onPlaceClick(place);
    }
  };
  
  return (
    <MapContainer data-testid="map">
      {places.length === 0 ? (
        <PlaceholderText>No places to display on the map</PlaceholderText>
      ) : (
        <>
          <PlaceholderText>
            Map View (Placeholder)<br />
            {places.length} places on the map
          </PlaceholderText>
          
          {/* Placeholder markers - these will be positioned properly with Google Maps */}
          {places.map((place) => (
            <PlaceMarker
              key={place.id}
              style={{
                // Random positions for now
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
              }}
              onClick={() => handlePlaceClick(place)}
              title={place.name}
              data-testid={`marker-${place.id}`}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
};

export default Map; 