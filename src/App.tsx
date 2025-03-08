import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import Home from './pages/Home';
import Places from './pages/Places';
import Auth from './pages/Auth';
import Friends from './pages/Friends';
import Meetups from './pages/Meetups';
import Settings from './pages/Settings';
import BottomNavigation from './components/BottomNavigation';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Home />} />
              <Route path="/places" element={<Places />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/meetups" element={<Meetups />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BottomNavigation />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
