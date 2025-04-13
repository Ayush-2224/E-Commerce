import React from 'react';
import "./App.css"
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import MainNavigation from './components/Navigation/MainNavigation';
import Footer from './components/Footer/Footer';
function App() {
  return (
    <div>
      <BrowserRouter>
      <MainNavigation />
      <Footer />
      </BrowserRouter>

    </div>
  );
}

export default App;