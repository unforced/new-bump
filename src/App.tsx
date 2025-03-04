import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from '@styles/theme';
import GlobalStyles from '@styles/globalStyles';
import { AuthProvider } from '@context/AuthContext';
import Layout from '@components/Layout';
import Auth from '@pages/Auth';
import Home from '@pages/Home';
import Places from '@pages/Places';
import Friends from '@pages/Friends';
import Meetups from '@pages/Meetups';
import Settings from '@pages/Settings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={<Home />} />
              <Route path="/places" element={<Places />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/meetups" element={<Meetups />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
