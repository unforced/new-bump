import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';

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

const IconPlaceholder = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  margin-top: ${({ theme }) => theme.space[1]}px;
`;

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  // Don't show navigation on auth page
  if (location.pathname === '/auth') {
    return null;
  }
  
  return (
    <NavContainer>
      <NavItem to="/home" end>
        <IconPlaceholder>H</IconPlaceholder>
        <Label>Home</Label>
      </NavItem>
      <NavItem to="/places">
        <IconPlaceholder>P</IconPlaceholder>
        <Label>Places</Label>
      </NavItem>
      <NavItem to="/friends">
        <IconPlaceholder>F</IconPlaceholder>
        <Label>Friends</Label>
      </NavItem>
      <NavItem to="/meetups">
        <IconPlaceholder>M</IconPlaceholder>
        <Label>Meetups</Label>
      </NavItem>
      <NavItem to="/settings">
        <IconPlaceholder>S</IconPlaceholder>
        <Label>Settings</Label>
      </NavItem>
    </NavContainer>
  );
};

export default BottomNavigation; 