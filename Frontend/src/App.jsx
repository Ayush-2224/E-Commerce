import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navlinks from './components/Navigation/Navlinks';

function App() {
  return (
    <div>
      <Navlinks />
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        {/* Add other routes as needed */}
      </Routes>
    </div>
  );
}

export default App;