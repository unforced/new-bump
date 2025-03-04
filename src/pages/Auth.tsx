import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.space[3]}px;
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.space[4]}px;
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const Form = styled.form`
  width: 100%;
`;

const Auth: React.FC = () => {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email);
      setIsOtpSent(true);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('OTP is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await verifyOtp(email, otp);
      
      if (success) {
        navigate('/home');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <Logo>Bump</Logo>
      <AuthCard variant="elevated">
        {!isOtpSent ? (
          <Form onSubmit={handleSendOtp}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              fullWidth
              required
              error={error}
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              Send OTP
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleVerifyOtp}>
            <Input
              label="One-Time Password"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the OTP sent to your email"
              fullWidth
              required
              error={error}
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              Verify
            </Button>
            <Button
              type="button"
              variant="text"
              fullWidth
              onClick={() => setIsOtpSent(false)}
              disabled={isLoading}
              style={{ marginTop: '16px' }}
            >
              Back to Email
            </Button>
          </Form>
        )}
      </AuthCard>
    </AuthContainer>
  );
};

export default Auth; 