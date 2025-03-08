import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    loadError: undefined,
  })),
  getLatLngFromPlace: vi.fn(),
  formatPlaceAddress: vi.fn(),
  getPlaceId: vi.fn(),
}));

// Mock the Google Maps API globally
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: vi.fn(({ children }) => <div data-testid="google-map">{children}</div>),
  Marker: vi.fn(() => <div data-testid="map-marker" />),
  InfoWindow: vi.fn(({ children }) => <div data-testid="info-window">{children}</div>),
  useLoadScript: vi.fn(() => ({ isLoaded: true, loadError: null })),
}));

// Stub for google global object
global.google = {
  maps: {
    places: {
      Autocomplete: class {
        constructor() {
          // Empty constructor
        }
        addListener() {
          // Empty method
        }
      },
    },
  },
} as any;

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

  it('should render loading state when Google Maps API is not loaded', () => {
    // Mock Google Maps API not loaded
    vi.mocked(googleMapsUtilsModule.useGoogleMapsApi).mockReturnValue({
      isLoaded: false,
      loadError: undefined,
    } as any);

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
    } as any);

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