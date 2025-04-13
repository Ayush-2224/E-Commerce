import React from 'react';
import "./App.css"
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import MainNavigation from './components/Navigation/MainNavigation';
import Footer from './components/Footer/Footer';
import { UserSignup } from './pages/userSignup';
import { UserLogin } from './pages/userlogin';
import SellerSignup from './pages/sellerSignup';
import SellerLogin from './pages/sellerLogin';
import AuthPages from './util/AuthPages';
import NavPages from './util/NavPages';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route element={<NavPages/>}>
      
    </Route>

    {/* Auth pages without Nav + Footer */}
    <Route element={<AuthPages />}>
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/signup" element={<UserSignup />} />
      <Route path="/seller/login" element={<SellerLogin/>} />
      <Route path="/seller/signup" element={<SellerSignup />} />
    </Route>
  </Routes>
  <Toaster/>
  </BrowserRouter>
  );
}

export default App;