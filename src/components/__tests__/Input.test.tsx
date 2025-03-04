import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { describe, it, expect, vi } from 'vitest';
import theme from '../../styles/theme';
import Input from '../Input';

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Input', () => {
  // Rendering tests
  it('renders input element correctly', () => {
    renderWithTheme(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    renderWithTheme(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    renderWithTheme(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  // Props tests
  it('applies fullWidth style when fullWidth is true', () => {
    renderWithTheme(<Input fullWidth data-testid="input-container" />);
    // Note: We need to target the container div since that's where the fullWidth prop is applied
    const container = screen.getByTestId('input-container').parentElement;
    expect(container).toHaveStyle('width: 100%');
  });

  it('passes additional props to the input element', () => {
    renderWithTheme(
      <Input 
        placeholder="Enter your name" 
        type="text" 
        maxLength={50} 
        data-testid="input" 
      />
    );
    
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Enter your name');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('maxLength', '50');
  });

  // Interaction tests
  it('calls onChange when input value changes', async () => {
    const handleChange = vi.fn();
    renderWithTheme(<Input onChange={handleChange} data-testid="input" />);
    
    const user = userEvent.setup();
    const input = screen.getByTestId('input');
    
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('can be focused and blurred', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    renderWithTheme(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        data-testid="input" 
      />
    );
    
    const user = userEvent.setup();
    const input = screen.getByTestId('input');
    
    await user.click(input); // Focus
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    await user.tab(); // Tab away to blur
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  // Disabled state test
  it('applies disabled styles when disabled', () => {
    renderWithTheme(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  // Error state test
  it('applies error styles when error is provided', () => {
    renderWithTheme(<Input error="Error message" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveStyle('border-color: red');
  });

  // Ref forwarding test
  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    renderWithTheme(<Input ref={ref} data-testid="input" />);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBe(screen.getByTestId('input'));
  });
}); 