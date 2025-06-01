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
import Product from './pages/product';
import NavPages from './util/NavPages';
import { Toaster } from 'react-hot-toast';
import Order from './pages/order';
import Cart from './pages/cart';
import BuyNowPage from './pages/home';
import ProductReviews from './pages/ProductReviews';
import Review from './pages/Review';
import Profile from './pages/Profile';
import Search from './util/search';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  
  return (
    <BrowserRouter>
    <Routes>
    <Route element={<NavPages/>}>
      <Route path='/cart' element={<Cart/>} />
      <Route path="product/:productId" element={<Product />} />
      <Route path="/search" element={<Search />} />
      <Route path='/order' element={<Order/>} />
      <Route path="/buy/:productId" element={<BuyNowPage/>} />
      <Route path="/reviews/:productId" element={<ProductReviews/>} />
      <Route path="/product/:productId/review" element={<Review/>} />
      <Route path="/user/profile" element={<Profile/>} />
      <Route path="user/forget-password" element={<ForgotPassword/>}/>
      <Route path="user/reset-password/:token" element={<ResetPassword/>}/>

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