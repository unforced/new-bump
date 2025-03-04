import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import theme from '../../styles/theme';
import BottomNavigation from '../BottomNavigation';

// Helper function to render with theme and router
const renderWithThemeAndRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );
};

describe('BottomNavigation', () => {
  // Rendering tests
  it('renders all navigation items', () => {
    renderWithThemeAndRouter(<BottomNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Places')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Meetups')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders navigation with correct links', () => {
    renderWithThemeAndRouter(<BottomNavigation />);
    
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/home');
    expect(screen.getByText('Places').closest('a')).toHaveAttribute('href', '/places');
    expect(screen.getByText('Friends').closest('a')).toHaveAttribute('href', '/friends');
    expect(screen.getByText('Meetups').closest('a')).toHaveAttribute('href', '/meetups');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
  });

  it('highlights the active route', () => {
    renderWithThemeAndRouter(<BottomNavigation />, { route: '/places' });
    
    // The Places link should have the 'active' class
    const placesLink = screen.getByText('Places').closest('a');
    expect(placesLink).toHaveClass('active');
    
    // Other links should not have the 'active' class
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveClass('active');
  });

  it('does not render on auth page', () => {
    const { container } = renderWithThemeAndRouter(<BottomNavigation />, { route: '/auth' });
    
    // The component should return null, so the container should be empty
    expect(container.firstChild).toBeNull();
  });

  // Styling tests
  it('has fixed position at the bottom of the screen', () => {
    renderWithThemeAndRouter(<BottomNavigation />);
    
    const navElement = screen.getByRole('navigation');
    expect(navElement).toHaveStyle('position: fixed');
    expect(navElement).toHaveStyle('bottom: 0');
  });

  it('has correct height based on theme', () => {
    renderWithThemeAndRouter(<BottomNavigation />);
    
    const navElement = screen.getByRole('navigation');
    expect(navElement).toHaveStyle(`height: ${theme.layout.navHeight}`);
  });
}); 