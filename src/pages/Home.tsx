import React from 'react';
import styled from 'styled-components';
import Card from '@components/Card';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.space[3]}px;
`;

const Title = styled.h1`
  margin-bottom: ${({ theme }) => theme.space[3]}px;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[3]}px;
`;

const CheckInButton = styled.button`
  position: fixed;
  bottom: calc(${({ theme }) => theme.layout.navHeight} + ${({ theme }) => theme.space[3]}px);
  right: ${({ theme }) => theme.space[3]}px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    animation: pulse ${({ theme }) => theme.animations.pulse};
  }
`;

const Home: React.FC = () => {
  return (
    <PageContainer>
      <Title>Home</Title>
      <StatusList>
        <Card>
          <h3>No active statuses</h3>
          <p>Your friends' check-ins will appear here.</p>
        </Card>
      </StatusList>
      <CheckInButton aria-label="Check in">+</CheckInButton>
    </PageContainer>
  );
};

export default Home; 