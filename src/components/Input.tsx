import { InputHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.space[3]}px;
  
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  margin-bottom: ${({ theme }) => theme.space[1]}px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.space[2]}px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme, $hasError }) => 
    $hasError ? 'red' : theme.colors.backgroundAlt};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  background-color: white;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    cursor: not-allowed;
  }
  
  ${({ $hasError }) =>
    $hasError &&
    css`
      border-color: red;
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
      }
    `}
`;

const ErrorMessage = styled.span`
  color: red;
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  margin-top: ${({ theme }) => theme.space[1]}px;
`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, ...props }, ref) => {
    return (
      <InputContainer $fullWidth={fullWidth}>
        {label && <Label>{label}</Label>}
        <StyledInput ref={ref} $hasError={!!error} {...props} />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input; 