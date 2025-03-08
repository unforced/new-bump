import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card from '../components/Card';
import { getCheckInsByPlace } from '../utils/statusService';
import { useDataSubscription } from '../hooks/useRealtimeSubscription';
import CheckInForm from '../components/CheckInForm';
import { Place } from '../utils/statusService';

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

const PlaceCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.space[3]}px;
`;

const PlaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space[2]}px;
`;

const PlaceName = styled.h3`
  margin: 0;
`;

const CheckInCount = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const CheckInItem = styled.div`
  padding: ${({ theme }) => theme.space[2]}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Username = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-right: ${({ theme }) => theme.space[1]}px;
`;

const Activity = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
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
  cursor: pointer;
  
  &:hover {
    animation: pulse ${({ theme }) => theme.animations.pulse};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.space[3]}px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.space[4]}px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorMessage = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.space[4]}px;
  color: ${({ theme }) => theme.colors.error};
`;

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [checkInsData, setCheckInsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates for check-ins
  const { data: checkInsSubscription } = useDataSubscription({
    table: 'check_ins',
    pollingInterval: 10000, // Poll every 10 seconds
  });

  // Refresh when subscription data changes
  useEffect(() => {
    if (checkInsSubscription) {
      fetchCheckIns();
    }
  }, [checkInsSubscription]);

  // Fetch check-ins grouped by place
  const fetchCheckIns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getCheckInsByPlace();
      
      if (error) {
        setError(error);
      } else if (data) {
        setCheckInsData(data);
        
        // Extract unique places for the check-in form
        const uniquePlaces = data.map(item => item.place);
        setPlaces(uniquePlaces);
      }
    } catch (err) {
      setError('Failed to fetch check-ins. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCheckInSuccess = () => {
    fetchCheckIns();
  };

  // Render loading state
  if (isLoading && !checkInsData.length) {
    return (
      <PageContainer>
        <Title>Home</Title>
        <LoadingMessage>Loading check-ins...</LoadingMessage>
      </PageContainer>
    );
  }

  // Render error state
  if (error && !checkInsData.length) {
    return (
      <PageContainer>
        <Title>Home</Title>
        <ErrorMessage>{error}</ErrorMessage>
        <CheckInButton aria-label="Check in" onClick={handleOpenModal}>+</CheckInButton>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title>Home</Title>
      <StatusList>
        {checkInsData.length === 0 ? (
          <Card>
            <h3>No active check-ins</h3>
            <p>Your friends' check-ins will appear here.</p>
          </Card>
        ) : (
          checkInsData.map((placeData) => (
            <PlaceCard key={placeData.place.id}>
              <PlaceHeader>
                <PlaceName>{placeData.place.name}</PlaceName>
                <CheckInCount>{placeData.checkIns.length}</CheckInCount>
              </PlaceHeader>
              
              {placeData.checkIns.map((checkIn: any) => (
                <CheckInItem key={checkIn.id}>
                  <UserInfo>
                    <Username>{checkIn.profile.username || 'Anonymous'}</Username>
                    {checkIn.activity && (
                      <Activity>is {checkIn.activity}</Activity>
                    )}
                  </UserInfo>
                </CheckInItem>
              ))}
            </PlaceCard>
          ))
        )}
      </StatusList>
      
      <CheckInButton aria-label="Check in" onClick={handleOpenModal}>+</CheckInButton>
      
      {isModalOpen && (
        <Modal>
          <CheckInForm 
            onClose={handleCloseModal} 
            onSuccess={handleCheckInSuccess}
            places={places}
          />
        </Modal>
      )}
    </PageContainer>
  );
};

export default Home; 