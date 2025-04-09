import React from 'react'
import { NavLink } from "react-router-dom"; // Corrected import path
// import cart from "../../assets/cart.png"
import logo from "../../assets/logo.svg"
import cart from "../../assets/cart.svg"
import search from "../../assets/search.svg"
const MainNavigation = () => {
  return (
    <nav className='bg-red-300'>
      <ul className="flex items-center justify-between list-none">
        <li className='cursor-pointer w-50'>
        <svg
    width="250"
    height="100%"
    viewBox="0 0 800 300"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>
      {`
        .logo-text {
          font-family: 'Fantasy', sans-serif;
          font-size: 100px;
          fill: green;
          font-weight: bold;
        }
        .tagline {
          font-family: 'Arial', sans-serif;
          font-size: 30px;
          fill: black;
        }
      `}
    </style>
    <text x="50" y="150" className="logo-text">Cartshop</text>
    <text x="150" y="200" className="tagline">Shop Smart, Save Big!</text>
  </svg>
        </li>
        <li className="flex justify-center flex-1 py-3">
  <div className="relative w-full">
    <input
      type="text"
      placeholder="Search"
      className="w-full pr-10 pl-3 py-2 border rounded-2xl"
    />
    <img
      src={search}
      alt="Search"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-8 pointer-events-none"
    />
  </div>
</li>

        <li>
          <NavLink to="/signup" className="p-3 ">
            Sign up
          </NavLink>
        </li>

        <li>
          <NavLink to="/cart">
            <img src={cart} alt="Cart" className='h-15 pr-3'/>
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default MainNavigation
