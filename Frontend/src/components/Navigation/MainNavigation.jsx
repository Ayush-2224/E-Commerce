import React from 'react'
import { NavLink } from "react-router-dom"; // Corrected import path
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { useUserAuthStore } from '../../store/userAuth.store';
import { useLocation } from 'react-router-dom';
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-6 w-6 md:h-8 md:w-8 text-gray-500"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

const AccountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round h-7 w-7 md:h-9 md:w-9"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
);

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart h-8 w-8 md:h-10 md:w-10"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
);
const MainNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const authUser = useUserAuthStore((state) => state.authUser);
    const logout = useUserAuthStore((state) => state.logout);
    const isLoggedIn = !!authUser;
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("q") || "";
        setSearchTerm(q);
    }, [location.search]);


    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed !== "") {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
        }
    }

    return (
        <nav className='bg-blue-50 md px-10 sm:px-0'>
            <ul className="flex items-center justify-between list-none">
                <li className='cursor-pointer w-40'>
                    <Link to="/">
                        <svg
                            width="250"
                            height="100%"
                            viewBox="0 0 900 300"
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
                    </Link>
                </li>
                <li className="flex justify-center flex-1 py-3">
                    <form onSubmit={handleSubmit} className="relative w-full max-w-2/3">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search"
                            className="w-full pr-10 pl-3 py-2 border rounded-2xl bg-amber-50"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                        >
                            <SearchIcon />
                        </button>
                    </form>
                </li>
                {isLoggedIn ? (
                    <li className="relative group m-3 flex border border-cyan-500 hover:bg-cyan-500 transition-colors duration-200">
                        <div className="p-1 flex items-center gap-2 cursor-pointer">
                            <AccountIcon />
                            <span>{authUser.username}</span>
                        </div>

                        <ul className="absolute top-full left-0 w-40 bg-white border border-cyan-500 rounded shadow-md opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity duration-300 z-10">
                            <li>
                                <NavLink to="/user/profile" className="block px-4 py-2 hover:bg-cyan-100">
                                    My Profile
                                </NavLink>  
                            </li>
                            <li>
                                <NavLink to="/user/orders" className="block px-4 py-2 hover:bg-cyan-100">
                                    My Orders
                                </NavLink>
                            </li>
                            <li>
                                <div className="block px-4 py-2 hover:bg-cyan-100" onClick={() => {
                                    logout()
                                    navigate("/")
                                }}>
                                    Log Out
                                </div>
                            </li>
                        </ul>
                    </li>
                ) : (
                    <li className="m-3 flex border border-cyan-500 hover:bg-cyan-500 transition-colors duration-200">
                        <NavLink to="/user/login" className="p-1 flex items-center gap-2">
                            <AccountIcon />
                            <span>Sign up</span>
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/cart" className='block p-1 md:pr-3 hover:bg-blue-100'>
                        <CartIcon />
                    </NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default MainNavigation
