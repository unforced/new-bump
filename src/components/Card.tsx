import React, { HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: boolean;
  clickable?: boolean;
}

// Use $padding and $clickable as transient props (they won't be passed to the DOM)
const StyledCard = styled.div<{ $padding?: boolean; $clickable?: boolean; variant?: string }>`
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  
  ${({ $padding, theme }) =>
    $padding &&
    css`
      padding: ${theme.space[3]}px;
    `}
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'outlined':
        return css`
          border: 1px solid ${theme.colors.backgroundAlt};
          background-color: transparent;
        `;
      case 'elevated':
        return css`
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        `;
      default:
        return css`
          background-color: ${theme.colors.backgroundAlt};
        `;
    }
  }}
  
  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: translateY(0);
      }
    `}
`;

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = true,
  clickable = false,
  ...props
}) => {
  return (
    <StyledCard 
      variant={variant} 
      $padding={padding} 
      $clickable={clickable} 
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card; 