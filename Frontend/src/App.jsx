import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserLogin from './pages/userlogin'
import SellerLogin from './pages/sellerLogin'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/a" element={<UserLogin />} />
      <Route path="/" element={<SellerLogin/>} />
    </Routes>
  )
}

export default App
