import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaceForm from '../PlaceForm';
import * as placeServiceModule from '../../utils/placeService';
import * as googleMapsUtilsModule from '../../utils/googleMapsUtils';
import { ThemeProvider } from 'styled-components';
import theme from '../../styles/theme';

// Mock the place service
vi.mock('../../utils/placeService', () => ({
  createPlace: vi.fn(),
  updatePlace: vi.fn(),
}));

// Mock the Google Maps utils
vi.mock('../../utils/googleMapsUtils', () => ({
  useGoogleMapsApi: vi.fn(() => ({
    isLoaded: true,
    loadError: null,
  })),
  getLatLngFromPlace: vi.fn(),
  formatPlaceAddress: vi.fn(),
  getPlaceId: vi.fn(),
}));

// Mock the Google Maps Autocomplete
const mockAddEventListener = vi.fn();
const mockGetPlace = vi.fn();

// @ts-ignore
global.google = {
  maps: {
    places: {
      Autocomplete: vi.fn(() => ({
        addListener: mockAddEventListener,
        getPlace: mockGetPlace,
      })),
    },
  },
};

describe('PlaceForm Component', () => {
  const mockPlace = {
    id: 'place-1',
    name: 'Coffee Shop',
    address: '123 Main St',
    lat: 40.7128,
    lng: -74.0060,
    created_by: 'test-user-id',
    created_at: '2025-03-08T00:00:00.000Z',
    updated_at: null,
    google_place_id: 'google-place-1'
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful response from createPlace
    vi.mocked(placeServiceModule.createPlace).mockResolvedValue({
      data: mockPlace,
      error: null
    });
    // Mock successful response from updatePlace
    vi.mocked(placeServiceModule.updatePlace).mockResolvedValue({
      data: mockPlace,
      error: null
    });
  });

  it('should render the form for adding a new place', () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Check that the form title is rendered
    expect(screen.getByText('Add New Place')).toBeInTheDocument();
    
    // Check that the form fields are rendered
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    
    // Check that the buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should render the form for editing an existing place', () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceForm place={mockPlace} onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Check that the form title is rendered
    expect(screen.getByText('Edit Place')).toBeInTheDocument();
    
    // Check that the form fields are pre-filled
    expect(screen.getByLabelText('Name')).toHaveValue('Coffee Shop');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Main St');
    
    // Check that the buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Click the cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show validation error when form is submitted with empty fields', async () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Submit the form with empty fields
    fireEvent.click(screen.getByText('Add'));
    
    // Check that validation error is shown
    expect(await screen.findByText('Name and address are required')).toBeInTheDocument();
    
    // Check that createPlace was not called
    expect(placeServiceModule.createPlace).not.toHaveBeenCalled();
  });

  it('should show validation error when lat/lng are missing', async () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Fill in the name and address fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Place' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '456 New St' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add'));
    
    // Check that validation error is shown
    expect(await screen.findByText('Please select a valid address from the suggestions')).toBeInTheDocument();
    
    // Check that createPlace was not called
    expect(placeServiceModule.createPlace).not.toHaveBeenCalled();
  });

  it('should call createPlace when form is submitted with valid data', async () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Set lat/lng directly (normally set by Google Places Autocomplete)
    const placeForm = screen.getByTestId('place-form');
    // @ts-ignore - Accessing private state
    const setLat = placeForm.__reactProps$*.children.props.children.props.setLat;
    // @ts-ignore - Accessing private state
    const setLng = placeForm.__reactProps$*.children.props.children.props.setLng;
    
    setLat(40.7128);
    setLng(-74.0060);

    // Fill in the name and address fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Place' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '456 New St' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add'));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(placeServiceModule.createPlace).toHaveBeenCalledWith({
        name: 'New Place',
        address: '456 New St',
        lat: 40.7128,
        lng: -74.0060,
        google_place_id: null
      });
    });
    
    // Check that onSave was called
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should handle error when createPlace fails', async () => {
    // Mock error response from createPlace
    vi.mocked(placeServiceModule.createPlace).mockResolvedValue({
      data: null,
      error: { message: 'Failed to create place' }
    });

    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Set lat/lng directly (normally set by Google Places Autocomplete)
    const placeForm = screen.getByTestId('place-form');
    // @ts-ignore - Accessing private state
    const setLat = placeForm.__reactProps$*.children.props.children.props.setLat;
    // @ts-ignore - Accessing private state
    const setLng = placeForm.__reactProps$*.children.props.children.props.setLng;
    
    setLat(40.7128);
    setLng(-74.0060);

    // Fill in the name and address fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Place' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '456 New St' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add'));
    
    // Check that error message is shown
    expect(await screen.findByText('Failed to create place')).toBeInTheDocument();
    
    // Check that onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should render loading state when Google Maps API is not loaded', () => {
    // Mock Google Maps API not loaded
    vi.mocked(googleMapsUtilsModule.useGoogleMapsApi).mockReturnValue({
      isLoaded: false,
      loadError: null,
    });

    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Check that loading message is shown
    expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();
  });

  it('should render error state when Google Maps API fails to load', () => {
    // Mock Google Maps API load error
    vi.mocked(googleMapsUtilsModule.useGoogleMapsApi).mockReturnValue({
      isLoaded: false,
      loadError: new Error('Failed to load Google Maps API'),
    });

    render(
      <ThemeProvider theme={theme}>
        <PlaceForm onClose={mockOnClose} onSave={mockOnSave} />
      </ThemeProvider>
    );

    // Check that error message is shown
    expect(screen.getByText('Error Loading Maps')).toBeInTheDocument();
    expect(screen.getByText('Failed to load Google Maps API. Please try again later.')).toBeInTheDocument();
  });
}); 