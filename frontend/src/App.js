import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header1 from './components/Header1';
import Header2 from './components/Header2';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import Teams from './components/Teams';
import Players from './components/Players';
import About from './components/About';
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