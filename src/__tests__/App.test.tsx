import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the components used in App
vi.mock('../pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('../pages/Places', () => ({
  default: () => <div data-testid="places-page">Places Page</div>,
}));

vi.mock('../pages/Auth', () => ({
  default: () => <div data-testid="auth-page">Auth Page</div>,
}));

vi.mock('../pages/Friends', () => ({
  default: () => <div data-testid="friends-page">Friends Page</div>,
}));

vi.mock('../pages/Meetups', () => ({
  default: () => <div data-testid="meetups-page">Meetups Page</div>,
}));

vi.mock('../pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

vi.mock('../components/BottomNavigation', () => ({
  default: () => <div data-testid="bottom-navigation">Bottom Navigation</div>,
}));

vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'test-user', email: 'test@example.com' },
    login: vi.fn(),
    logout: vi.fn(),
    verifyOtp: vi.fn(),
    updateProfile: vi.fn(),
    error: null
  }),
}));

// Mock the router to control the current route
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
    Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
    Route: ({ path, element }: { path: string; element: React.ReactNode }) => (
      <div data-testid={`route-${path.replace('/', '')}`}>{element}</div>
    ),
    Navigate: ({ to }: { to: string }) => <div data-testid={`navigate-to-${to.replace('/', '')}`}>Navigate to {to}</div>,
  };
});

describe('App Component', () => {
  it('should render the App component with all routes', () => {
    render(<App />);
    
    // Check that the app container is rendered
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    
    // Check that the routes are rendered
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    
    // Check that the auth provider is rendered
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    
    // Check that the bottom navigation is rendered
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
    
    // Check that all routes are rendered
    expect(screen.getByTestId('route-auth')).toBeInTheDocument();
    expect(screen.getByTestId('route-')).toBeInTheDocument(); // Root route
    expect(screen.getByTestId('route-places')).toBeInTheDocument();
    expect(screen.getByTestId('route-friends')).toBeInTheDocument();
    expect(screen.getByTestId('route-meetups')).toBeInTheDocument();
    expect(screen.getByTestId('route-settings')).toBeInTheDocument();
    expect(screen.getByTestId('route-*')).toBeInTheDocument();
    
    // Check that protected routes are used for authenticated routes
    expect(screen.getAllByTestId('protected-route').length).toBe(5); // Home, Places, Friends, Meetups, Settings
  });
}); 