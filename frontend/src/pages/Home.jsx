import React, { useState } from "react";
import Login from "../users/Login";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen from-indigo-100 via-blue-100 to-gray-100 p-10 text-center">

      <h1 className="text-5xl font-extrabold mb-4">
        Welcome to Smart Learning
      </h1>

      <p className="text-lg text-gray-700 max-w-xl mx-auto">
        A centralized platform for students to manage learning effectively.
      </p>

      <button
        onClick={() => setShowLogin(true)}
        className="mt-8 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
      >
        Get Started
      </button>

      {/* Modal Login */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          ></div>

          {/* Login Form */}
          <div className="relative z-50">
            <Login closeModal={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  );
}