import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { isDevelopment } from '../utils/supabaseClient';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin: 0.5rem 0;
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.success};
  margin: 0.5rem 0;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }
  
  span {
    padding: 0 10px;
    color: #666;
    font-size: 14px;
  }
`;

const DevModeNotice = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 1rem;
  font-size: 14px;
  text-align: center;
`;

const Auth: React.FC = () => {
  const { login, devLogin, verifyOtp, logout, isAuthenticated, user, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const isDevMode = isDevelopment();

  // Redirect to home page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    try {
      await login(email);
      setShowOtpInput(true);
      setSuccessMessage('Verification code sent to your email!');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    try {
      const success = await devLogin(email);
      if (success) {
        setSuccessMessage('Successfully logged in with development mode!');
        // Redirect will happen automatically due to the useEffect
      }
    } catch (err) {
      console.error('Development login error:', err);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    try {
      const success = await verifyOtp(email, otp);
      if (success) {
        setSuccessMessage('Successfully verified!');
        setShowOtpInput(false);
        setOtp('');
        // Redirect will happen automatically due to the useEffect
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setEmail('');
      setOtp('');
      setShowOtpInput(false);
      setSuccessMessage('Successfully logged out!');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContainer>
      <Card>
        <h1>Bump Authentication</h1>
        
        {isAuthenticated ? (
          <div>
            <h2>Welcome, {user?.username || user?.email}!</h2>
            <p>User ID: {user?.id}</p>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        ) : (
          <>
            {isDevMode && (
              <DevModeNotice>
                Development Mode: Email verification is bypassed.
              </DevModeNotice>
            )}
            
            {!showOtpInput ? (
              <>
                <Form onSubmit={handleLogin}>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Login Code'}
                  </Button>
                </Form>
                
                {isDevMode && (
                  <>
                    <Divider>
                      <span>OR</span>
                    </Divider>
                    
                    <Form onSubmit={handleDevLogin}>
                      <Input
                        type="email"
                        placeholder="Email for Dev Login"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Button 
                        type="submit" 
                        variant="secondary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Logging in...' : 'Dev Login (No Email)'}
                      </Button>
                    </Form>
                  </>
                )}
              </>
            ) : (
              <Form onSubmit={handleVerify}>
                <Input
                  type="text"
                  placeholder="Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setShowOtpInput(false)}
                >
                  Back to Email
                </Button>
              </Form>
            )}
          </>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        
        {isLoading && <p>Loading...</p>}
      </Card>
    </AuthContainer>
  );
};

export default Auth; 