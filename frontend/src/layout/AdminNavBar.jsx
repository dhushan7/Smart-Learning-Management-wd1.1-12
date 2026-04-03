import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminNavBar() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  if (role !== "Admin" && role !== "Academic Panel") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
    window.location.reload();
  };

  const linkStyle = ({ isActive }) =>
    isActive
      ? "block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium"
      : "block px-4 py-2 rounded-lg hover:bg-white/10 text-gray-300";

  return (
    <div className="fixed top-0 left-0 h-full w-[17vw] bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-20 p-5 shadow-2xl">

      <div className="mb-8">
        <h2 className="text-xl font-bold">
          {role === "Admin" ? "Admin Panel" : "Academic Panel"}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Smart Learning System
        </p>
      </div>

      {/* menu */}
      <ul className="space-y-2">

        {role === "Admin" && (
          <>
            <li>
              <NavLink to="/admin/users" className={linkStyle}>
                Users
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/reports" className={linkStyle}>
                Reports
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/settings" className={linkStyle}>
                Settings
              </NavLink>
            </li>
          </>
        )}

        {role === "Academic Panel" && (
          <>
            <li>
              <NavLink to="/resources" className={linkStyle}>
                Resources
              </NavLink>
            </li>

            <li>
              <NavLink to="/cources" className={linkStyle}>
                Manage Courses
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="absolute bottom-6 left-0 w-full px-5">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}