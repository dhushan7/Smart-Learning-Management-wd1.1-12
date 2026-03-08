import React from "react";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <h1 className="text-xl font-bold">Smart Learning</h1>

        <ul className="hidden md:flex space-x-8">
          <li><a href="/" className="hover:text-sky-400">Home</a></li>
          <li><a href="/a" className="hover:text-sky-400">a</a></li>
          <li><a href="/b" className="hover:text-sky-400">b</a></li>
          <li><a href="/about" className="hover:text-sky-400">About</a></li>
          <li><a href="/contact" className="hover:text-sky-400">Contact</a></li>
        </ul>

        <div className="hidden md:flex space-x-4">
          <button className="border border-white px-4 py-1 rounded hover:bg-white hover:text-gray-900">
            Login
          </button>
          <button className="bg-sky-500 px-4 py-1 rounded hover:bg-sky-600">
            Sign Up
          </button>
        </div>

      </div>
    </nav>
  );
}