import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import UserRegister from "../users/userRegister";
import Login from "../users/Login";

export default function Navbar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const menuRef = useRef();

  const user = JSON.parse(localStorage.getItem("user")); 
  // expect: { username, email, profileImage }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (role === "Admin" || role === "Academic Panel") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold">Smart Learning</h1>

        {/* LINKS */}
        <ul className="hidden md:flex space-x-8">
          {!role && (
            <>
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/about">About</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
            </>
          )}

          {role === "Student" && (
            <>
              <li><NavLink to="/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/tasks">Tasks</NavLink></li>
            </>
          )}
        </ul>

        
        <div className="flex items-center space-x-4">

          {/* NOT LOGGED IN */}
          {!role && (
            <>
              <button onClick={() => setShowLogin(true)} className="border px-4 py-1 rounded">
                Login
              </button>

              <button onClick={() => setShowRegister(true)} className="bg-sky-500 px-4 py-1 rounded">
                Sign Up
              </button>
            </>
          )}

          {/* LOGGED IN USER PROFILE */}
          {role && (
            <div className="relative" ref={menuRef}>
              
              {/* Avatar */}
              <img
                src={
                  user?.profileImage ||
                  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                }
                alt="profile"
                onClick={() => setOpenProfileMenu(!openProfileMenu)}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
              />

              {/* DROPDOWN */}
              {openProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden">

                  <button
                    onClick={() => {
                      setOpenProfileMenu(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Manage Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogin(false)} />
          <Login closeModal={() => setShowLogin(false)} />
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRegister(false)} />
          <UserRegister closeModal={() => setShowRegister(false)} />
        </div>
      )}
    </nav>
  );
}