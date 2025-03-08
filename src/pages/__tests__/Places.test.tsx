import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Places from '../Places';
import * as placeServiceModule from '../../utils/placeService';
import { ThemeProvider } from 'styled-components';
import theme from '../../styles/theme';

// Mock the place service
vi.mock('../../utils/placeService', () => ({
  getPlaces: vi.fn(),
}));

// Mock the PlaceForm component
vi.mock('../../components/PlaceForm', () => ({
  default: vi.fn(() => <div data-testid="place-form">Place Form</div>),
}));

// Mock the Map component
vi.mock('../../components/Map', () => ({
  default: vi.fn(({ places }) => (
    <div data-testid="map">
      Map View
      <div data-testid="map-places">{places.length} places</div>
    </div>
  )),
}));

describe('Places Page', () => {
  const mockPlaces = [
    {
      id: 'place-1',
      name: 'Coffee Shop',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.0060,
      created_by: 'test-user-id',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      google_place_id: 'google-place-1'
    },
    {
      id: 'place-2',
      name: 'Park',
      address: '456 Park Ave',
      lat: 40.7580,
      lng: -73.9855,
      created_by: 'test-user-id',
      created_at: '2025-03-08T00:00:00.000Z',
      updated_at: null,
      google_place_id: 'google-place-2'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful response from getPlaces
    vi.mocked(placeServiceModule.getPlaces).mockResolvedValue({
      data: mockPlaces,
      error: null
    });
  });

  it('should render the Places page with list view by default', async () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Places />
        </BrowserRouter>
      </ThemeProvider>
    );

    // Check that getPlaces was called
    expect(placeServiceModule.getPlaces).toHaveBeenCalled();

    // Check that the page title is rendered
    expect(await screen.findByText('Places')).toBeInTheDocument();

    // Check that the list view is rendered by default
    expect(await screen.findByTestId('places-list')).toBeInTheDocument();
    
    // Check that the places are rendered in the list
    expect(await screen.findByText('Coffee Shop')).toBeInTheDocument();
    expect(await screen.findByText('Park')).toBeInTheDocument();
  });

  it('should toggle between list and map views', async () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Places />
        </BrowserRouter>
      </ThemeProvider>
    );

    // Check that the list view is rendered by default
    expect(await screen.findByTestId('places-list')).toBeInTheDocument();
    
    // Toggle to map view
    fireEvent.click(screen.getByTestId('view-toggle'));
    
    // Check that the map view is rendered
    expect(await screen.findByTestId('map')).toBeInTheDocument();
    
    // Toggle back to list view
    fireEvent.click(screen.getByTestId('view-toggle'));
    
    // Check that the list view is rendered again
    expect(await screen.findByTestId('places-list')).toBeInTheDocument();
  });

  it('should open the PlaceForm when add button is clicked', async () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Places />
        </BrowserRouter>
      </ThemeProvider>
    );

    // Click the add button
    fireEvent.click(await screen.findByTestId('add-place-button'));
    
    // Check that the PlaceForm is rendered
    expect(await screen.findByTestId('place-form')).toBeInTheDocument();
  });

  it('should handle error when fetching places fails', async () => {
    // Mock error response from getPlaces
    vi.mocked(placeServiceModule.getPlaces).mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch places' }
    });

    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Places />
        </BrowserRouter>
      </ThemeProvider>
    );

    // Check that the error message is rendered
    expect(await screen.findByText('Failed to fetch places')).toBeInTheDocument();
  });

  it('should display a message when no places are available', async () => {
    // Mock empty response from getPlaces
    vi.mocked(placeServiceModule.getPlaces).mockResolvedValue({
      data: [],
      error: null
    });

    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Places />
        </BrowserRouter>
      </ThemeProvider>
    );

    // Check that the empty state message is rendered
    expect(await screen.findByText('No places added yet')).toBeInTheDocument();
  });
}); 