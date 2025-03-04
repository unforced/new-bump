import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import theme from '../../styles/theme';
import Layout from '../Layout';

// Mock the BottomNavigation component
vi.mock('../BottomNavigation', () => ({
  default: () => <div data-testid="bottom-navigation">Bottom Navigation</div>
}));

// Helper function to render with theme and router
const renderWithThemeAndRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );
};

describe('Layout', () => {
  // Rendering tests
  it('renders children correctly', () => {
    renderWithThemeAndRouter(
      <Layout>
        <div data-testid="content">Content</div>
      </Layout>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders BottomNavigation when not on auth page', () => {
    renderWithThemeAndRouter(
      <Layout>
        <div>Content</div>
      </Layout>,
      { route: '/home' }
    );
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  it('does not render BottomNavigation on auth page', () => {
    renderWithThemeAndRouter(
      <Layout>
        <div>Content</div>
      </Layout>,
      { route: '/auth' }
    );
    expect(screen.queryByTestId('bottom-navigation')).not.toBeInTheDocument();
  });

  // Styling tests
  it('applies padding-bottom to main content', () => {
    renderWithThemeAndRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    // Find the main element (it's the parent of the content)
    const main = screen.getByText('Content').closest('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveStyle(`padding-bottom: ${theme.layout.navHeight}`);
  });
}); 