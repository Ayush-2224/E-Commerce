<<<<<<< HEAD
import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'   

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
=======
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Your main App component
import "./index.css"
const root = createRoot(document.getElementById('root'));
root.render(
    <App />
);
>>>>>>> 8e5614feab51722c5ded993637c70976bd1089b7
