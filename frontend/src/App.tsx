import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header1 from './components/common/Header1';
import Header2 from './components/common/Header2';
import Sidebar from './components/sidebar/Sidebar';
import Footer from './components/common/Footer';
import { SocialProvider } from './contexts/SocialContext';
import './App.css';

// Lazy load components
const MainContent = lazy(() => import('./components/main/MainContent'));
const Teams = lazy(() => import('./components/teams/Teams'));
const Players = lazy(() => import('./components/players/Players'));
const About = lazy(() => import('./components/about/About'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SocialProvider>
      <Router>
        <div className="app">
          <Header1 />
          <Header2 />
          <Routes>
            <Route path="/" element={<Layout><MainContent /></Layout>} />
            <Route path="/teams/*" element={<Layout><Teams /></Layout>} />
            <Route path="/players" element={<Layout><Players /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
          </Routes>
          <Footer />
        </div>
      </Router>
      <Analytics />
    </SocialProvider>
  );
};

export default App; 