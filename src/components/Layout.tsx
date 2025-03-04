import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

const Main = styled.main`
  padding-bottom: ${({ theme }) => theme.layout.navHeight};
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <>
      <Main>{children}</Main>
      {!isAuthPage && <BottomNavigation />}
    </>
  );
};

export default Layout; 