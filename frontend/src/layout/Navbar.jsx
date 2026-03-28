import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import UserRegister from "../users/userRegister";
import Login from "../users/Login";
import AdminCreateUser from "../users/AdminCreateUser";

export default function Navbar() {
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold">Smart Learning</h1>

        {/* LINKS */}
        <ul className="hidden md:flex space-x-8">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/admin/users">Users</NavLink></li>
          <li><NavLink to="/tasks">Tasks</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>

        {/* BUTTONS */}
        <div className="hidden md:flex space-x-4">

          <button
            onClick={() => setShowLogin(true)}
            className="border px-4 py-1 rounded"
          >
            Login
          </button>

          <button
            onClick={() => setShowAdmin(true)}
            className="border px-4 py-1 rounded text-sky-400"
          >
            Add User
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="bg-sky-500 px-4 py-1 rounded"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          />
          <Login closeModal={() => setShowLogin(false)} />
        </div>
      )}

      {/* ================= SIGNUP MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <UserRegister closeModal={() => setShowForm(false)} />
        </div>
      )}

      {/* ================= ADMIN MODAL ================= */}
      {showAdmin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAdmin(false)}
          />
          <AdminCreateUser closeModal={() => setShowAdmin(false)} />
        </div>
      )}
    </nav>
  );
}