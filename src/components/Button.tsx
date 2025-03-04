import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

// Use $fullWidth and $isLoading as transient props
const StyledButton = styled.button<{
  variant?: ButtonVariant;
  size?: ButtonSize;
  $fullWidth?: boolean;
  $isLoading?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  /* Size styles */
  ${({ size, theme }) => {
    switch (size) {
      case 'small':
        return css`
          padding: ${theme.space[1]}px ${theme.space[2]}px;
          font-size: ${theme.typography.fontSize.small};
        `;
      case 'large':
        return css`
          padding: ${theme.space[3]}px ${theme.space[4]}px;
          font-size: ${theme.typography.fontSize.h1};
        `;
      default: // medium
        return css`
          padding: ${theme.space[2]}px ${theme.space[3]}px;
          font-size: ${theme.typography.fontSize.body};
        `;
    }
  }}
  
  /* Variant styles */
  ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return css`
          background-color: ${theme.colors.backgroundAlt};
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryLight};
          }
          
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary};
          border: none;
          padding-left: ${theme.space[2]}px;
          padding-right: ${theme.space[2]}px;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryLight};
          }
          
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
      default: // primary
        return css`
          background-color: ${theme.colors.primary};
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary}dd;
          }
          
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
    }
  }}
  
  /* Full width */
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Loading state */
  ${({ $isLoading }) =>
    $isLoading &&
    css`
      position: relative;
      color: transparent;
      
      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      $fullWidth={fullWidth}
      $isLoading={isLoading}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 