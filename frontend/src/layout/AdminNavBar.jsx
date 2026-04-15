import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminNavBar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdminOrPanel = role === "Admin" || role === "Academic Panel";

  // --- Calendar Logic ---
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();
  const currentDate = today.getDate();

  // Calculate days for the calendar grid
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, today.getMonth(), 1).getDay();
  
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  // ----------------------

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

  if (!isAdminOrPanel) return null;

  const linkStyle = ({ isActive }) =>
    isActive
      ? "block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium transition-all"
      : "block px-4 py-2 rounded-lg hover:bg-white/10 text-gray-300 transition-all";

  return (
    // Added flex and flex-col to manage vertical spacing
    <div className="fixed top-0 left-0 h-full w-[17vw] bg-gradient-to-b from-gray-900 to-gray-800 text-white p-5 shadow-2xl flex flex-col">
      
      {/* 1. TOP SECTION: PROFILE */}
      <div className="mb-6 flex items-center justify-between" ref={menuRef}>
        <div>
          <h2 className="text-xl font-bold">{role}</h2>
          <p className="text-xs text-gray-400 mt-1">Smart Learning</p>
        </div>

        <div className="relative">
          <img
            src={
              user?.profileImage ||
              "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
            }
            alt="profile"
            onClick={() => setOpenProfileMenu(!openProfileMenu)}
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-white transition-transform hover:scale-105"
          />

          {openProfileMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => navigate("/admin/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-medium"
              >
                Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MENU LINKS */}
      <ul className="space-y-1 mb-8">
        {role === "Admin" && (
          <>
            <li><NavLink to="/dashboard" className={linkStyle}>Dashboard</NavLink></li>
            <li><NavLink to="/admin/edit-profile" className={linkStyle}>Profile Settings</NavLink></li>
            <li><NavLink to="/admin/users" className={linkStyle}>Users</NavLink></li>
            <li><NavLink to="/admin/reports" className={linkStyle}>Reports</NavLink></li>
            <li><NavLink to="/admin/credits" className={linkStyle}>Credits</NavLink></li>
          </>
        )}

        {role === "Academic Panel" && (
          <>
            <li><NavLink to="/dashboard" className={linkStyle}>Dashboard</NavLink></li>
            <li><NavLink to="/admin/edit-profile" className={linkStyle}>Profile Settings</NavLink></li>
            <li><NavLink to="/admin/users" className={linkStyle}>View Students</NavLink></li>
            <li><NavLink to="/admin/resources" className={linkStyle}>Resources</NavLink></li>
            <li><NavLink to="/admin/sessions" className={linkStyle}>Supportive Sessions</NavLink></li>
          </>
        )}
      </ul>

      {/* CALENDAR */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm shadow-inner mb-6 mt-[10vh] ">
        <div className="text-center font-semibold mb-3 text-indigo-300">
          {currentMonth} {currentYear}
        </div>
        
        {/* Days of the week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="p-1"></div>
          ))}
          {days.map((day) => (
            <div
              key={day}
              className={`p-1 rounded-md ${
                day === currentDate
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Logout
        </button>
      </div>

    </div>
  );
}