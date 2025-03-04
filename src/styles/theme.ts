import { Theme } from '../types/theme';

const theme: Theme = {
  colors: {
    primary: '#2E7D32',
    primaryLight: '#E8F5E9',
    background: '#D7CCC8',
    backgroundAlt: '#F0ECE0',
    text: '#212121',
    textLight: '#666666',
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: {
      body: '16px',
      h1: '20px',
      small: '14px',
    },
    fontWeight: {
      regular: 400,
      bold: 700,
    },
  },
  space: [0, 4, 8, 16, 24, 32, 48, 64],
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  animations: {
    pulse: '0.5s ease-in-out',
    fade: '0.3s linear',
  },
  layout: {
    maxWidth: '600px',
    navHeight: '48px',
  },
};

export default theme; 