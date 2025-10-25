// src/Components/Navbar.jsx
// ------------------------------------------------------------
// Existing navbar me minimal changes:
// - New hook import: useNotificationsPoll
// - Bell button with unread badge (right actions me add)
// Baaki purana flow (auth/profile/mobile menu) untouched.
// ------------------------------------------------------------

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/axios";
import useNotificationsPoll from "../hooks/useNotificationsPoll"; // ✅ NEW: bell polling hook
import NotificationDropdown from "./NotificationDropdown";        // ✅ NEW


export default function Navbar({ loggedIn, setLoggedIn }) {
  const [open, setOpen] = useState(false); // mobile menu toggle
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [isNotifOpen, setNotifOpen] = useState(false); 
  const profileMenuRef = useRef(null);
  const notifRef = useRef(null); // bell container ref

  // 🔔 NEW: notifications polling (30s). loading ko badge flicker avoid karne ke liye use kar rahe.
  const { unread, loading: notifLoading } = useNotificationsPoll(30000);

  // close profile menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef, notifRef]);

  function handleLogout() {
    // clear token locally and remove from axios default headers
    localStorage.removeItem("token");
    setAuthToken(null);
    setLoggedIn(false);
    setProfileMenuOpen(false); // close menu on logout
    navigate("/login");
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white shadow-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                {/* small logo svg */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="white" opacity="0.95"/>
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight">Lost &amp; Found</span>
            </Link>
          </div>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/lost" className="hover:underline">Lost</Link>
            <Link to="/found" className="hover:underline">Found</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link to="/upload" className="hidden sm:inline-block bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-sm">
                  Add item
                </Link>

                {/* 🔔 Notifications bell + dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    {/* Bell icon (inline SVG) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .53-.21 1.04-.59 1.41L4 17h5" />
                      <path d="M9 17a3 3 0 0 0 6 0" />
                    </svg>

                    {/* Unread badge: only show when not loading AND unread > 0 */}
                    {(!notifLoading && unread > 0) && (
                      <span
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                        aria-label={`${unread} unread notifications`}
                      >
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </button>
                  {/* Dropdown panel */}
                  <NotificationDropdown open={isNotifOpen} onClose={() => setNotifOpen(false)} />
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800 z-50">
                      <Link to="/my-lost" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setProfileMenuOpen(false)}>My Lost Items</Link>
                      <Link to="/my-found" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setProfileMenuOpen(false)}>My Found Items</Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:underline">Login</Link>
                <Link to="/register" className="ml-2 bg-white text-indigo-600 px-3 py-1 rounded-md font-medium">Register</Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-md hover:bg-white/10"
            >
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden bg-white/5 border-t border-white/10">
          <div className="px-4 py-3 space-y-2">
            <Link to="/lost" className="block" onClick={()=>setOpen(false)}>Lost</Link>
            <Link to="/found" className="block" onClick={()=>setOpen(false)}>Found</Link>
            <Link to="/about" className="block" onClick={()=>setOpen(false)}>About</Link>
            {loggedIn && (
              <div className="border-t border-white/20 pt-3 mt-3 space-y-2">
                 <Link to="/my-lost" className="block" onClick={()=>setOpen(false)}>My Lost Items</Link>
                 <Link to="/my-found" className="block" onClick={()=>setOpen(false)}>My Found Items</Link>
                 <Link to="/upload" className="block" onClick={()=>setOpen(false)}>Add item</Link>
              </div>
            )}
            <div className="border-t border-white/20 pt-3 mt-3 space-y-2">
              {loggedIn ? (
                <button className="w-full text-left" onClick={() => { setOpen(false); handleLogout(); }}>Logout</button>
              ) : (
                <>
                  <Link to="/login" className="block" onClick={()=>setOpen(false)}>Login</Link>
                  <Link to="/register" className="block" onClick={()=>setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
