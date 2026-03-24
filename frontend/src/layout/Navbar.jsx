import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">Smart Learning</h1>

        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/quiz-bank">Quiz Bank</Link></li>
        </ul>

        <div className="navbar-buttons">
          <button className="btn-outline">Login</button>
          <button className="btn-primary">Sign Up</button>
        </div>
      </div>
    </nav>
  );
}