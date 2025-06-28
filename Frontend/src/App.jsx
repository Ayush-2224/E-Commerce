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
//import BuyNowPage from './pages/home';
import ProductReviews from './pages/ProductReviews';
import Review from './pages/Review';
import Profile from './pages/Profile';
import Search from './util/search';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AddProduct from './pages/AddProduct';
import SellerStore from './pages/sellerStore';
import UserReviews from './pages/UserReviews';
import EditProduct from './pages/EditProduct';
import SellerProfile from './pages/sellerProfile';
import Dashboard from './pages/Dashboard';
import SellerOrders from './pages/ProductDashboard';
import { useUserAuthStore } from './store/userAuth.store';
import { useEffect } from 'react';
// import EditProduct from './pages/EditProduct';
import BuyNowPage from './pages/BuyNowPage';
import HomePage from './pages/home';
function App() {
  const authUser = useUserAuthStore((state) => state.authUser);
  const isLoggedIn = !!authUser;

  useEffect(() => {
    if (!isLoggedIn) {
      if (!localStorage.getItem("cartItems")) {
        localStorage.setItem("cartItems", JSON.stringify([]));
      }
    }
  }, [isLoggedIn]);


  return (
    <BrowserRouter>
    <Routes>
    <Route element={<NavPages/>}>
      <Route path='/cart' element={<Cart/>} />
      <Route path="product/:productId" element={<Product />} />
      <Route path="/search" element={<Search />} />
      <Route path='/user/orders' element={<Order/>} />
      <Route path="/buy/:productId" element={<BuyNowPage/>} />
      <Route path="/reviews/:productId" element={<ProductReviews/>} />
      <Route path="/product/:productId/review" element={<Review/>} />
      <Route path="/user/profile" element={<Profile/>} />
      <Route path="/user/reviews" element={<UserReviews/>} />
      <Route path="user/forget-password" element={<ForgotPassword/>}/>
      <Route path="user/reset-password/:token" element={<ResetPassword/>}/>
      <Route path="/" element={<HomePage />} />
    </Route>

        {/* Auth pages without Nav + Footer */}
        <Route element={<AuthPages />}>
          <Route path="seller/dashboard" element={<Dashboard />} />
          <Route path="seller/orders" element={<SellerOrders />} />
          <Route path="seller/add-product" element={<AddProduct />} />
          <Route path="seller/profile" element={<SellerProfile />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/signup" element={<UserSignup />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/signup" element={<SellerSignup />} />
          <Route path="/seller/store" element={<SellerStore />} />
          <Route path="/seller/edit-product/:id" element={<EditProduct />} />
          {/* <Route path="/seller/edit-product/:id" element={<EditProduct />} /> */}
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;