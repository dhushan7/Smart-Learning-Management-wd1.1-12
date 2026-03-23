import React, { useState } from "react";
import { Link } from "react-router-dom";
import UserRegister from "../users/userRegister"; 

export default function Navbar() {
  const [showForm, setShowForm] = useState(false);

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Smart Learning</h1>

        {/* Links */}
        <ul className="hidden md:flex space-x-8">
          <li><Link to="/" className="hover:text-sky-400">Home</Link></li>
          <li><Link to="/admin/users" className="hover:text-sky-400">Users</Link></li>
          <li><Link to="/b" className="hover:text-sky-400">b</Link></li>
          <li><Link to="/about" className="hover:text-sky-400">About</Link></li>
          <li><Link to="/contact" className="hover:text-sky-400">Contact</Link></li>
        </ul>

        {/* Login / Sign Up */}
        <div className="hidden md:flex space-x-4 items-center">
          <button className="border border-white px-4 py-1 rounded hover:bg-white hover:text-gray-900">
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
            {showForm && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                
                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowForm(false)}
                ></div>

                {/* Glass Register Form */}
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