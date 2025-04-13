import React from 'react';
import "./Navlinks.css";
import { NavLink } from "react-router"
import cart from "../../assets/cart.png"
const Navlinks = () => {
  return (
    <ul>
        <li>
        <NavLink to="/signup">
        Sign up
      </NavLink>
        </li>
        <li>
      <NavLink to="/cart">
        <img src={cart} alt="" height={40}/>
      </NavLink>
        </li>
    <li>
        
    </li>
    </ul>
  );
};

export default Navlinks;