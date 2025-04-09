import React from 'react';
import "./App.css"
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import MainNavigation from './components/Navigation/MainNavigation';
function App() {
  return (
    <div>
      <BrowserRouter>
      <MainNavigation />
      </BrowserRouter>
    </div>
  );
}

export default App;