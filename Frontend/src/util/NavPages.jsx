import { Outlet } from "react-router-dom";
import React from 'react'
import MainNavigation from "../components/Navigation/MainNavigation";
import Footer from "../components/Footer/Footer";
function NavPages() {
  return (
    <>
    <MainNavigation/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default NavPages
