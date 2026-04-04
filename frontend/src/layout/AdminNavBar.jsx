import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminNavBar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isAdminOrPanel = role === "Admin" || role === "Academic Panel";

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
      ? "block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium"
      : "block px-4 py-2 rounded-lg hover:bg-white/10 text-gray-300";

  return (
    <div className="fixed top-0 left-0 h-full w-[17vw] bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-5 p-5 shadow-2xl">

      {/* PROFILE */}
      <div className="mb-8 flex items-center justify-between" ref={menuRef}>
        <div>
          <h2 className="text-xl font-bold">
            {role}
          </h2>
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
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
          />

          {openProfileMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg z-50">
              <button
                onClick={() => navigate("/admin/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
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
      </div>

      {/* MENU */}
      <ul className="space-y-2">

        {role === "Admin" && (
          <>
            <li><NavLink to="/dashboard" className={linkStyle}>Dashboard</NavLink></li>
            <li><NavLink to="/admin/users" className={linkStyle}>Users</NavLink></li>
            <li><NavLink to="/admin/reports" className={linkStyle}>Reports</NavLink></li>
            <li><NavLink to="/admin/settings" className={linkStyle}>Settings</NavLink></li>
          </>
        )}

        {role === "Academic Panel" && (
          <>
            <li><NavLink to="/dashboard" className={linkStyle}>Dashboard</NavLink></li>
            <li><NavLink to="/resources" className={linkStyle}>Resources</NavLink></li>
            <li><NavLink to="/courses" className={linkStyle}>Manage Courses</NavLink></li>
          </>
        )}

      </ul>
    </div>
  );
}