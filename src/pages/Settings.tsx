import React from 'react';
import styled from 'styled-components';
import Card from '@components/Card';
import Button from '@components/Button';
import { useAuth } from '@context/AuthContext';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.space[3]}px;
`;

const Title = styled.h1`
  margin-bottom: ${({ theme }) => theme.space[3]}px;
`;

const SettingsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.space[4]}px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: ${({ theme }) => theme.space[2]}px;
`;

const Settings: React.FC = () => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <PageContainer>
      <Title>Settings</Title>
      
      <SettingsSection>
        <SectionTitle>Profile</SectionTitle>
        <Card>
          <p>Profile settings will be implemented in a future update.</p>
        </Card>
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>Notifications</SectionTitle>
        <Card>
          <p>Notification settings will be implemented in a future update.</p>
        </Card>
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>Availability</SectionTitle>
        <Card>
          <p>Availability settings will be implemented in a future update.</p>
        </Card>
      </SettingsSection>
      
      <Button onClick={handleLogout} variant="secondary" fullWidth>
        Logout
      </Button>
    </PageContainer>
  );
};

export default Settings; 