import { useLoadScript, Libraries } from '@react-google-maps/api';

// Libraries to load with the Google Maps API
const libraries: Libraries = ['places'];

// Google Maps API key from environment variables
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

/**
 * Hook to load the Google Maps API with the Places library
 * @returns An object with isLoaded and loadError properties
 */
export const useGoogleMapsApi = () => {
  return useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });
};

/**
 * Get the latitude and longitude from a Google Place result
 * @param place The Google Place result
 * @returns An object with lat and lng properties
 */
export const getLatLngFromPlace = (place: google.maps.places.PlaceResult): { lat: number; lng: number } | null => {
  if (!place.geometry || !place.geometry.location) {
    return null;
  }
  
  return {
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng(),
  };
};

/**
 * Format a Google Place result for display
 * @param place The Google Place result
 * @returns The formatted address or name
 */
export const formatPlaceAddress = (place: google.maps.places.PlaceResult): string => {
  return place.formatted_address || place.name || '';
};

/**
 * Get the Google Place ID from a Google Place result
 * @param place The Google Place result
 * @returns The Google Place ID
 */
export const getPlaceId = (place: google.maps.places.PlaceResult): string | null => {
  return place.place_id || null;
}; 