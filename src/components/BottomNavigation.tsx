import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaCog } from 'react-icons/fa';

// Icons would typically be imported from a library like react-icons
// For now, we'll use placeholder text
const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.layout.navHeight};
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  @media (min-width: 600px) {
    width: ${({ theme }) => theme.layout.maxWidth};
    left: 50%;
    transform: translateX(-50%);
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textLight};
  text-decoration: none;
  flex: 1;
  height: 100%;
  transition: color 0.2s ease-in-out;
  
  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

const IconContainer = styled.div`
  font-size: 1.2rem;
  margin-bottom: 4px;
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Don't show navigation on auth page or when not authenticated
  if (location.pathname === '/auth' || !isAuthenticated) {
    return null;
  }
  
  return (
    <NavContainer>
      <NavItem to="/" end>
        <IconContainer>
          <FaHome />
        </IconContainer>
        <Label>Home</Label>
      </NavItem>
      <NavItem to="/places">
        <IconContainer>
          <FaMapMarkerAlt />
        </IconContainer>
        <Label>Places</Label>
      </NavItem>
      <NavItem to="/friends">
        <IconContainer>
          <FaUsers />
        </IconContainer>
        <Label>Friends</Label>
      </NavItem>
      <NavItem to="/meetups">
        <IconContainer>
          <FaCalendarAlt />
        </IconContainer>
        <Label>Meetups</Label>
      </NavItem>
      <NavItem to="/settings">
        <IconContainer>
          <FaCog />
        </IconContainer>
        <Label>Settings</Label>
      </NavItem>
    </NavContainer>
  );
};

export default BottomNavigation; 