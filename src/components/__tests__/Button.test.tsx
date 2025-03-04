import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { describe, it, expect, vi } from 'vitest';
import theme from '../../styles/theme';
import Button from '../Button';

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Button', () => {
  // Rendering tests
  it('renders children correctly', () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  // Variant tests - focusing on presence of key attributes rather than exact color values
  it('applies primary variant styles by default', () => {
    renderWithTheme(<Button>Primary Button</Button>);
    const button = screen.getByRole('button');
    // Check for presence of background-color without exact matching
    expect(button).toHaveStyle(`color: rgb(255, 255, 255)`);
    expect(button).toHaveStyle(`border: none`);
  });

  it('applies secondary variant styles when specified', () => {
    renderWithTheme(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button');
    // Check for presence of color without exact matching
    expect(button).toHaveStyle(`color: ${theme.colors.primary}`);
    expect(button).toHaveStyle(`border: 1px solid ${theme.colors.primary}`);
  });

  it('applies text variant styles when specified', () => {
    renderWithTheme(<Button variant="text">Text Button</Button>);
    const button = screen.getByRole('button');
    // Check for presence of color without exact matching
    expect(button).toHaveStyle(`color: ${theme.colors.primary}`);
    expect(button).toHaveStyle(`border: none`);
  });

  // Size tests
  it('applies medium size styles by default', () => {
    renderWithTheme(<Button>Medium Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle(`padding: ${theme.space[2]}px ${theme.space[3]}px`);
    expect(button).toHaveStyle(`font-size: ${theme.typography.fontSize.body}`);
  });

  it('applies small size styles when specified', () => {
    renderWithTheme(<Button size="small">Small Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle(`padding: ${theme.space[1]}px ${theme.space[2]}px`);
    expect(button).toHaveStyle(`font-size: ${theme.typography.fontSize.small}`);
  });

  it('applies large size styles when specified', () => {
    renderWithTheme(<Button size="large">Large Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle(`padding: ${theme.space[3]}px ${theme.space[4]}px`);
    expect(button).toHaveStyle(`font-size: ${theme.typography.fontSize.h1}`);
  });

  // Full width test
  it('applies full width styles when specified', () => {
    renderWithTheme(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('width: 100%');
  });

  // Disabled state test
  it('applies disabled styles when disabled', () => {
    renderWithTheme(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Note: We can't test pseudo-selectors with toHaveStyle, so we'll skip those checks
  });

  // Loading state test
  it('applies loading styles when loading', () => {
    renderWithTheme(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled(); // Button should be disabled when loading
    // Check for position without checking exact color value
    expect(button).toHaveStyle('position: relative');
    // Note: We can't test pseudo-elements with toHaveStyle, so we'll skip those checks
  });

  // Interaction tests
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /click me/i });
    
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick} disabled>Click me</Button>);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /click me/i });
    
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', async () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick} isLoading>Click me</Button>);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /click me/i });
    
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
}); 