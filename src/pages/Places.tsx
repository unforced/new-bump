import React, { useState } from 'react';
import styled from 'styled-components';
import Card from '@components/Card';
import Button from '@components/Button';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.space[3]}px;
`;

const Title = styled.h1`
  margin-bottom: ${({ theme }) => theme.space[3]}px;
`;

const ViewToggle = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.space[3]}px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.space[2]}px;
  background-color: ${({ theme, active }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, active }) => active ? 'white' : theme.colors.primary};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
`;

const PlacesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[3]}px;
`;

const AddButton = styled.button`
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

const Places: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  return (
    <PageContainer>
      <Title>Places</Title>
      
      <ViewToggle>
        <ToggleButton 
          active={viewMode === 'list'} 
          onClick={() => setViewMode('list')}
        >
          List
        </ToggleButton>
        <ToggleButton 
          active={viewMode === 'map'} 
          onClick={() => setViewMode('map')}
        >
          Map
        </ToggleButton>
      </ViewToggle>
      
      {viewMode === 'list' ? (
        <PlacesList>
          <Card>
            <h3>No places added</h3>
            <p>Your favorite gathering spots will appear here.</p>
            <Button variant="text" fullWidth>Add your first place</Button>
          </Card>
        </PlacesList>
      ) : (
        <Card>
          <h3>Map View</h3>
          <p>Map integration will be added in a future update.</p>
        </Card>
      )}
      
      <AddButton aria-label="Add place">+</AddButton>
    </PageContainer>
  );
};

export default Places; 