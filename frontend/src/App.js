import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header1 from './components/common/Header1';
import Header2 from './components/common/Header2';
import Sidebar from './components/sidebar/Sidebar';
import MainContent from './components/main/MainContent';
import Footer from './components/common/Footer';
import Teams from './components/teams/Teams';
import Players from './components/players/Players';
import About from './components/about/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header1 />
        <Header2 />
        <div className="main-layout">
          <Sidebar />
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;