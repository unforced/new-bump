import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import ProfileForm from '../components/ProfileForm';

const SettingsContainer = styled.div`
  padding: 1rem;
`;

const Settings: React.FC = () => {
  return (
    <Layout>
      <SettingsContainer>
        <h1>Settings</h1>
        <ProfileForm />
      </SettingsContainer>
    </Layout>
  );
};

export default Settings; 