import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import UserRegister from "../users/userRegister"; 
import Login from "../users/Login";

export default function Navbar() {
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Smart Learning</h1>

        {/* Links */}
        <ul className="hidden md:flex space-x-8">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-sky-400 font-semibold"
                  : "hover:text-sky-400"
              }
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-sky-400 font-semibold"
                  : "hover:text-sky-400"
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive
                  ? "text-sky-400 font-semibold"
                  : "hover:text-sky-400"
              }
            >
              Users
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                isActive
                  ? "text-sky-400 font-semibold"
                  : "hover:text-sky-400"
              }
            >
              Tasks
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-sky-400 font-semibold"
                  : "hover:text-sky-400"
              }
            >
              About
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "text-sky-400 font-semibold"
                  : "hover:text-sky-400"
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Login / Sign Up */}
        <div className="hidden md:flex space-x-4 items-center">

          {/* LOGIN */}
          <button
            onClick={() => setShowLogin(true)}
            className="border border-white px-4 py-1 rounded hover:bg-white hover:text-gray-900"
          >
            Login
          </button>

          <div className="relative">
            <button
              onClick={() => setShowForm(true)}
              className="bg-sky-500 px-4 py-1 rounded hover:bg-sky-600 text-white"
            >
              Sign Up
            </button>

            {/* Modal */}
            {showLogin && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowLogin(false)}
                ></div>

                <div className="relative z-50">
                  <Login closeModal={() => setShowLogin(false)} />
                </div>
              </div>
            )}

            {showForm && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowForm(false)}
                ></div>

                <div className="relative z-50">
                  <UserRegister closeModal={() => setShowForm(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}