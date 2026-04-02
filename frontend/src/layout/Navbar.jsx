import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import UserRegister from "../users/userRegister";
import Login from "../users/Login";

export default function Navbar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
    window.location.reload();
  };


  if (role === "Admin" || role === "Academic Panel") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold">Smart Learning</h1>

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

        <div className="hidden md:flex space-x-4">

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

          {role && (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-1 rounded"
            >
              Logout
            </button>
          )}

        </div>
      </div>

      {/* login */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogin(false)} />
          <Login closeModal={() => setShowLogin(false)} />
        </div>
      )}

      {/* reg */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRegister(false)} />
          <UserRegister closeModal={() => setShowRegister(false)} />
        </div>
      )}
    </nav>
  );
}