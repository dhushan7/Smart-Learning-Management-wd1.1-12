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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (role === "Admin" || role === "Academic Panel") return null;

  const navStyle = (isActive) =>
    `relative px-4 py-2 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
    }`;

  // Nav Item
  const NavItem = ({ to, label }) => (
    <NavLink to={to} className={({ isActive }) => navStyle(isActive)}>
      {({ isActive }) => (
        <div className="relative px-2 py-1">

          

          {/* TEXT */}
          <span className="relative z-10">{label}</span>

          {/* Underline */}
          <span
            className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transform transition-all duration-300 ${
              isActive ? "scale-x-100" : "scale-x-0"
            } origin-left`}
          />
        </div>
      )}
    </NavLink>
  );

  const renderLinks = () => (
    <>
      {!role && (
        <>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Home
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent("scroll-about"))}>
            About
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent("scroll-contact"))}>
            Contact
          </button>
        </>
      )}

      {role === "Student" && (
        <>
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/quiz-bank" label="Quiz Bank" />
          <NavItem to="/resources" label="Resources" />
          <NavItem to="/credits" label="Credits" />
          <NavItem to="/reviews" label="Reviews" />
          <NavItem to="/sessions" label="Sessions" />
        </>
      )}
    </>
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

          {/* LOGO */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Smart Learning
          </h1>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-4">
            {renderLinks()}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center space-x-3">

            {!role && (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-1 rounded-full border hover:bg-gray-100"
                >
                  Login
                </button>

                <button
                  onClick={() => setShowRegister(true)}
                  className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                >
                  Sign Up
                </button>
              </>
            )}

            {role && (
              <div className="relative" ref={menuRef}>
                <img
                  src={
                    user?.profileImage ||
                    "https://ui-avatars.com/api/?name=User&background=6366F1&color=fff"
                  }
                  alt="profile"
                  onClick={() => setOpenProfileMenu(!openProfileMenu)}
                  className="w-10 h-10 rounded-full cursor-pointer 
                    border-2 border-white 
                    ring-2 ring-indigo-500 
                    ring-offset-2 ring-offset-white 
                    shadow-md hover:shadow-indigo-300 
                    transition-all duration-300"
                />

                {openProfileMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border">
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
                      className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE BUTTON */}
            <button
              className="md:hidden text-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg px-6 py-4 flex flex-col space-y-3">
            {renderLinks()}
          </div>
        )}
      </nav>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          />
          <Login closeModal={() => setShowLogin(false)} />
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRegister(false)}
          />
          <UserRegister closeModal={() => setShowRegister(false)} />
        </div>
      )}
    </>
  );
}