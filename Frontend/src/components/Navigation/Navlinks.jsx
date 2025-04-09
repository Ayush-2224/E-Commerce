import React from 'react';
import "./Navlinks.css";
import { NavLink } from "react-router"

const Navlinks = () => {
  return (
    <nav>
      <NavLink to="/">
        Home
      </NavLink>
    </nav>
  );
};

export default Navlinks;